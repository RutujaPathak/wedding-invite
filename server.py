#!/usr/bin/env python3
"""Wedding invite server — zero dependencies (Python 3.8+).

    python3 server.py              # serves on http://0.0.0.0:8000
    PORT=9000 python3 server.py

Routes
    /                    the invite (static files from ./public)
    POST /api/rsvp       save / update an RSVP
    GET  /api/wishes     public wishes for the wishes wall
    GET  /admin?key=...  private RSVP dashboard
    GET  /admin.csv?key=...
"""
import csv
import html
import io
import json
import os
import secrets
import socket
import threading
import time
import urllib.request
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(ROOT, "public")
DATA = os.path.join(ROOT, "data")
RSVP_FILE = os.path.join(DATA, "rsvps.json")
KEY_FILE = os.path.join(DATA, "admin_key.txt")
PORT = int(os.environ.get("PORT", "8000"))
MAX_BODY = 8 * 1024

os.makedirs(DATA, exist_ok=True)
lock = threading.Lock()


def admin_key():
    if os.environ.get("ADMIN_KEY"):
        return os.environ["ADMIN_KEY"]
    if not os.path.exists(KEY_FILE):
        with open(KEY_FILE, "w") as f:
            f.write(secrets.token_urlsafe(9))
    with open(KEY_FILE) as f:
        return f.read().strip()


ADMIN_KEY = admin_key()


def load():
    try:
        with open(RSVP_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save(rows):
    tmp = RSVP_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    os.replace(tmp, RSVP_FILE)


# ── Optional Google Sheet backup (needed on hosts with temporary disks, e.g. Render free) ──
# Set SHEET_URL (Apps Script web-app URL) and SHEET_SECRET; see google-sheet-script.gs
SHEET_URL = os.environ.get("SHEET_URL", "")
SHEET_SECRET = os.environ.get("SHEET_SECRET", "")


def sheet_call(payload=None):
    req = urllib.request.Request(
        SHEET_URL + ("&" if "?" in SHEET_URL else "?") + "secret=" + quote(SHEET_SECRET),
        data=json.dumps(dict(payload or {}, secret=SHEET_SECRET)).encode() if payload else None,
        headers={"Content-Type": "text/plain"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        out = json.loads(r.read())
    if isinstance(out, dict) and out.get("error"):
        raise RuntimeError(out["error"])
    return out


def sheet_pull():
    """Replace the local copy with what's in the sheet (the sheet is the source of truth)."""
    if not SHEET_URL:
        return
    try:
        rows = sheet_call()
        for r in rows:
            r["attending"] = str(r.get("attending")).lower() in ("true", "yes", "1")
            r["guests"] = int(r.get("guests") or 0)
            r["events"] = [e for e in str(r.get("events") or "").split("; ") if e]
            for k in ("id", "name", "wish", "note", "invitedAs", "updated"):
                r[k] = str(r.get(k) or "")
        with lock:
            save(rows)
        print(f"  ☁ Loaded {len(rows)} RSVPs from Google Sheet")
    except Exception as e:  # keep serving even if the sheet is unreachable
        print(f"  ⚠ Could not load from Google Sheet: {e}")


def sheet_push(row):
    if not SHEET_URL:
        return
    for attempt in range(3):
        try:
            sheet_call({"row": dict(row, events="; ".join(row["events"]))})
            return
        except Exception as e:
            print(f"  ⚠ Google Sheet write failed (try {attempt + 1}): {e}")
            time.sleep(1 + attempt)


def clean(v, n):
    return str(v or "").strip()[:n]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=PUBLIC, **kw)

    def log_message(self, fmt, *args):
        if "/api/" in self.path or "/admin" in self.path:
            super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        if self.path.endswith((".js", ".css", ".html", "/")) or "?" in self.path:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authed(self, q):
        return secrets.compare_digest(q.get("key", [""])[0], ADMIN_KEY)

    # ── GET ──
    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path == "/api/wishes":
            rows = [r for r in load() if r.get("wish")]
            rows.sort(key=lambda r: r["updated"], reverse=True)
            return self.send_json([{"name": r["name"].split()[0], "wish": r["wish"]} for r in rows[:60]])
        if u.path in ("/admin", "/admin.csv"):
            if not self.authed(q):
                return self.send_error(HTTPStatus.FORBIDDEN, "Add ?key=YOUR_ADMIN_KEY")
            sheet_pull()
            return self.admin_csv() if u.path.endswith(".csv") else self.admin_html(q["key"][0])
        if u.path.startswith("/data") or u.path.startswith("/.."):
            return self.send_error(HTTPStatus.NOT_FOUND)
        return super().do_GET()

    # ── POST ──
    def do_POST(self):
        if urlparse(self.path).path != "/api/rsvp":
            return self.send_error(HTTPStatus.NOT_FOUND)
        try:
            length = int(self.headers.get("Content-Length", 0))
            if not 0 < length <= MAX_BODY:
                return self.send_json({"error": "Request too large"}, 413)
            d = json.loads(self.rfile.read(length))
        except (ValueError, json.JSONDecodeError):
            return self.send_json({"error": "Invalid request"}, 400)

        name = clean(d.get("name"), 80)
        rid = clean(d.get("id"), 64)
        if not name or not rid:
            return self.send_json({"error": "Name is required"}, 400)
        attending = bool(d.get("attending"))
        try:
            guests = max(0, min(20, int(d.get("guests", 1)))) if attending else 0
        except (TypeError, ValueError):
            guests = 1
        events = [clean(e, 60) for e in (d.get("events") or [])][:12] if attending else []
        row = {
            "id": rid, "name": name, "attending": attending, "guests": guests, "events": events,
            "wish": clean(d.get("wish"), 300), "note": clean(d.get("note"), 300),
            "invitedAs": clean(d.get("invitedAs"), 60), "updated": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        with lock:
            rows = [r for r in load() if r.get("id") != rid]
            rows.append(row)
            save(rows)
        sheet_push(row)
        print(f"  💌 RSVP: {name} — {'YES x' + str(guests) if attending else 'no'}")
        return self.send_json({"ok": True})

    # ── Admin ──
    def admin_csv(self):
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["Name", "Attending", "Guests", "Events", "Wish", "Note", "Invited as", "Updated"])
        for r in load():
            w.writerow([r["name"], "Yes" if r["attending"] else "No", r["guests"], "; ".join(r["events"]),
                        r["wish"], r["note"], r.get("invitedAs", ""), r["updated"]])
        body = buf.getvalue().encode("utf-8-sig")
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", 'attachment; filename="rsvps.csv"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def admin_html(self, key):
        rows = sorted(load(), key=lambda r: r["updated"], reverse=True)
        yes = [r for r in rows if r["attending"]]
        per_event = {}
        for r in yes:
            for e in r["events"]:
                per_event[e] = per_event.get(e, 0) + r["guests"]
        e = html.escape
        stats = [("Responses", len(rows)), ("Attending", len(yes)), ("Headcount", sum(r["guests"] for r in yes)),
                 ("Declined", len(rows) - len(yes))]
        tiles = "".join(f"<div class=t><b>{v}</b><span>{e(k)}</span></div>" for k, v in stats)
        evs = "".join(f"<li>{e(k)} <b>{v}</b></li>" for k, v in per_event.items()) or "<li>—</li>"
        trs = "".join(
            f"<tr><td>{e(r['name'])}<small>{e(r.get('invitedAs') or '')}</small></td>"
            f"<td class={'y' if r['attending'] else 'n'}>{'Yes' if r['attending'] else 'No'}</td>"
            f"<td>{r['guests']}</td><td>{e(', '.join(r['events']))}</td><td>{e(r['wish'])}</td>"
            f"<td>{e(r['note'])}</td><td>{e(r['updated'])}</td></tr>" for r in rows)
        page = f"""<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>RSVPs</title><meta http-equiv=refresh content=60>
<style>body{{font:15px system-ui;background:#fbf3ef;color:#5a3030;margin:0;padding:24px}}h1{{font-weight:500}}
.ts{{display:flex;gap:12px;flex-wrap:wrap}}.t{{background:#fff;border-radius:14px;padding:14px 20px;min-width:120px;box-shadow:0 4px 14px -8px #c9837f}}
.t b{{display:block;font-size:30px;color:#c4623a}}.t span{{font-size:12px;text-transform:uppercase;letter-spacing:.1em}}
ul{{display:flex;gap:18px;flex-wrap:wrap;padding:0;list-style:none}}li b{{color:#c4623a}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;margin-top:12px}}
th,td{{text-align:left;padding:10px;border-bottom:1px solid #f1e1dc;vertical-align:top}}th{{background:#f6e3dd;font-weight:600}}
td small{{display:block;color:#a88}}.y{{color:#2e7d32}}.n{{color:#b23a32}}a{{color:#c4623a}}
.wrap{{overflow-x:auto}}</style>
<h1>💌 RSVPs</h1><div class=ts>{tiles}</div><h3>Headcount per event</h3><ul>{evs}</ul>
<p><a href="/admin.csv?key={e(key)}">⬇ Download CSV</a> · auto-refreshes every minute</p>
<div class=wrap><table><tr><th>Name</th><th>Attending</th><th>Guests</th><th>Events</th><th>Wish</th><th>Note</th><th>Updated</th></tr>{trs}</table></div>"""
        body = page.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    sheet_pull()
    srv = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    ip = lan_ip()
    print(f"""
  💍 Wedding invite is live
     This computer : http://localhost:{PORT}
     Same Wi-Fi    : http://{ip}:{PORT}
     Personal link : http://{ip}:{PORT}/?to=Aditi%20%26%20Family
     RSVP admin    : http://localhost:{PORT}/admin?key={ADMIN_KEY}
     Google Sheet  : {"connected" if SHEET_URL else "not configured (RSVPs saved in data/rsvps.json)"}
  Ctrl+C to stop.
""")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n  bye 👋")
