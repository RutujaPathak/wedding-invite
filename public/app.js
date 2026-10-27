(function () {
  const C = window.WEDDING;
  const $ = (id) => document.getElementById(id);
  const txt = (id, v) => ($(id).textContent = v);
  const wedding = new Date(C.weddingDate);

  const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const pad = (n) => String(n).padStart(2, "0");
  const icsStamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const mapsUrl = C.venue.mapsUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${C.venue.name}, ${C.venue.address}`);

  // ── Personalised guest link: ?to=Aditi%20%26%20Family ──
  const guest = (new URLSearchParams(location.search).get("to") || "").trim().slice(0, 60);
  if (guest) {
    txt("addressee", `For ${guest}`);
    txt("greeting", `Dear ${guest},`);
  }
  document.title = `${C.bride} & ${C.groom} — Wedding Invitation`;

  // ── Hero ──
  txt("sealText", C.initials);
  txt("envCardNames", `${C.bride} & ${C.groom}`);
  txt("invocation", C.invocation || "");
  txt("bride", C.bride);
  txt("groom", C.groom);
  txt("brideSurname", C.brideSurname || "");
  txt("groomSurname", C.groomSurname || "");
  txt("brideParents", C.brideParents || "");
  txt("groomParents", C.groomParents || "");
  txt("hostLine", C.hostLine);
  txt("heroMonth", wedding.toLocaleDateString("en-US", { month: "long" }));
  txt("heroDay", wedding.toLocaleDateString("en-US", { weekday: "long" }));
  txt("heroDate", wedding.getDate());
  txt("heroTime", C.timeLabel || fmtTime(wedding));
  txt("heroYear", wedding.getFullYear());
  document.querySelectorAll(".flora").forEach((f) => (f.innerHTML = floraSVG()));
  $("flapPath").setAttribute("d", scallopFlap());

  // ── Petals ──
  const petals = $("petals");
  for (let i = 0; i < 14; i++) {
    const el = document.createElement("i");
    el.className = "petal";
    el.style.left = Math.random() * 100 + "%";
    el.style.setProperty("--t", 9 + Math.random() * 9 + "s");
    el.style.setProperty("--delay", -Math.random() * 18 + "s");
    el.style.setProperty("--sway", (Math.random() * 120 - 60).toFixed(0) + "px");
    el.style.scale = 0.6 + Math.random() * 0.7;
    petals.appendChild(el);
  }

  // ── Envelope open sequence ──
  const env = $("envelope");
  env.addEventListener("click", () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    Music.start();
    setTimeout(() => {
      $("intro").classList.add("gone");
      document.body.classList.remove("locked");
      document.body.classList.add("opened");
      $("invite").removeAttribute("aria-hidden");
      $("music").hidden = false;
      window.scrollTo(0, 0);
      layout();
    }, 2300);
    setTimeout(() => $("intro").remove(), 3600);
  }, { once: false });

  // ── Story ──
  txt("storyQuote", C.story.quote);

  // ── Polaroids ──
  const pol = $("polaroids");
  C.photos.forEach((ph, i) => {
    const f = document.createElement("figure");
    f.className = "polaroid" + (ph.wide ? " wide" : "");
    f.style.setProperty("--r", [-6, 5, 4, -5, -3, 6][i % 6] + "deg");
    f.style.transitionDelay = 0.15 * i + "s";
    const d = document.createElement("div");
    d.className = "ph" + (ph.src ? "" : " empty");
    if (ph.src) d.style.backgroundImage = `url("photos/${encodeURI(ph.src)}")`;
    if (ph.pos) d.style.backgroundPosition = ph.pos;
    const cap = document.createElement("figcaption");
    cap.textContent = ph.caption || "♡";
    f.append(d, cap);
    f.addEventListener("click", () => {
      const was = f.classList.contains("focus");
      pol.querySelectorAll(".focus").forEach((x) => x.classList.remove("focus"));
      if (!was) f.classList.add("focus");
    });
    pol.appendChild(f);
  });
  function layoutPolaroids() {
    const W = pol.clientWidth;
    let bottom = 0, top = 0, col = 0;
    [...pol.children].forEach((f, i, all) => {
      if (f.classList.contains("wide") || (col === 0 && i === all.length - 1)) {
        // full-row photo, centred
        if (col) { top += W * 0.74; col = 0; }
        const wide = f.classList.contains("wide");
        f.style.setProperty("--x", wide ? "11%" : "24%");
        f.style.setProperty("--y", top + "px");
        bottom = Math.max(bottom, top + f.offsetHeight);
        top += f.offsetHeight * 0.92;
        return;
      }
      f.style.setProperty("--x", col ? "44%" : "3%");
      f.style.setProperty("--y", top + col * W * 0.1 + "px");
      bottom = Math.max(bottom, top + col * W * 0.1 + f.offsetHeight);
      if (col) top += W * 0.74 * 0.92;
      col = 1 - col;
    });
    pol.style.height = bottom + 20 + "px";
  }

  // ── Timeline ──
  const tl = $("timeline");
  C.events.forEach((e, i) => {
    const d = new Date(e.date);
    const side = i % 2 ? "right" : "left";
    const item = document.createElement("div");
    item.className = `tl-item ${side}`;
    item.innerHTML = `<div class="tl-node" style="--sx:${side === "left" ? 22 : -22}px">${iconSVG(e.icon)}</div>
      <div class="tl-text"><p class="tl-time"></p><p class="tl-name"><b></b><span></span></p><p class="tl-date"></p></div>`;
    item.querySelector(".tl-time").textContent = fmtTime(d);
    item.querySelector(".tl-name b").textContent = e.name;
    item.querySelector(".tl-name span").textContent = e.theme ? `: ${e.theme}` : "";
    item.querySelector(".tl-date").textContent = fmtDate(d);
    tl.appendChild(item);
  });
  let tlLen = 0;
  function layoutTimeline() {
    const box = tl.getBoundingClientRect();
    const pts = [...tl.querySelectorAll(".tl-item")].map((it) => {
      const n = it.querySelector(".tl-node");
      const sx = parseFloat(n.style.getPropertyValue("--sx"));
      return [n.offsetLeft + n.offsetWidth / 2 + sx, it.offsetTop + it.offsetHeight / 2];
    });
    if (!pts.length) return;
    let [px, py] = [box.width / 2, 0];
    let d = `M${px} ${py}`;
    for (const [x, y] of [...pts, [box.width / 2, tl.offsetHeight]]) {
      const my = (py + y) / 2;
      d += ` C ${px} ${my}, ${x} ${my}, ${x} ${y}`;
      [px, py] = [x, y];
    }
    $("tlSvg").setAttribute("viewBox", `0 0 ${box.width} ${tl.offsetHeight}`);
    $("tlTrack").setAttribute("d", d);
    $("tlDraw").setAttribute("d", d);
    tlLen = $("tlDraw").getTotalLength();
    $("tlDraw").style.strokeDasharray = tlLen;
    drawTimeline();
  }
  function drawTimeline() {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    $("tlDraw").style.strokeDashoffset = tlLen * (1 - p);
    tl.querySelectorAll(".tl-item").forEach((it) => {
      it.classList.toggle("on", (it.offsetTop + it.offsetHeight / 2) / r.height <= p + 0.02);
    });
  }

  // ── Venue ──
  txt("venueDesc", C.venue.description);
  txt("venueName", C.venue.name);
  txt("venueAddr", C.venue.address);
  $("directions").href = mapsUrl;
  $("qr").src = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&color=6e3a39&data=" + encodeURIComponent(mapsUrl);
  $("qr").onerror = () => ($("qr").style.display = "none");
  $("palace").innerHTML = palaceSVG();
  $("mandap").innerHTML = mandapSVG();
  document.querySelectorAll(".ink path, .ink circle").forEach((el) => el.setAttribute("pathLength", "1"));

  // ── Calendar ──
  (function () {
    const y = wedding.getFullYear(), m = wedding.getMonth();
    txt("calHead", wedding.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase());
    txt("calFoot", `${wedding.toLocaleDateString("en-US", { month: "long" }).toUpperCase()} · ${y}`);
    const g = $("calGrid");
    let h = "SMTWTFS".split("").map((d) => `<span class="dow">${d}</span>`).join("");
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prev = new Date(y, m, 0).getDate();
    for (let i = first - 1; i >= 0; i--) h += `<span class="d muted">${prev - i}</span>`;
    for (let d = 1; d <= days; d++) h += `<span class="d${d === wedding.getDate() ? " wed" : ""}">${d}</span>`;
    const tail = (7 - ((first + days) % 7)) % 7;
    for (let d = 1; d <= tail; d++) h += `<span class="d muted">${d}</span>`;
    g.innerHTML = h;
  })();

  // ── Add to calendar ──
  const main = C.events.find((e) => +new Date(e.date) === +wedding) || C.events[0];
  const endOf = (e) => (e.end ? new Date(e.end) : new Date(+new Date(e.date) + 3 * 3600e3));
  const title = (e) => `${e.name} — ${C.bride} & ${C.groom}`;
  $("gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title(main))}&dates=${icsStamp(new Date(main.date))}/${icsStamp(endOf(main))}` +
    `&details=${encodeURIComponent(location.origin + location.pathname)}&location=${encodeURIComponent(`${C.venue.name}, ${C.venue.address}`)}`;
  $("ics").addEventListener("click", () => {
    const esc = (s) => s.replace(/([,;\\])/g, "\\$1");
    const ev = C.events.map((e, i) => [
      "BEGIN:VEVENT", `UID:wedding-${i}-${icsStamp(new Date(e.date))}@invite`, `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(new Date(e.date))}`, `DTEND:${icsStamp(endOf(e))}`,
      `SUMMARY:${esc(title(e))}`, `LOCATION:${esc(`${C.venue.name}, ${C.venue.address}`)}`, "END:VEVENT",
    ].join("\r\n"));
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//WeddingInvite//EN", ...ev, "END:VCALENDAR"].join("\r\n");
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${C.bride}-${C.groom}-wedding.ics`;
    a.click();
  });

  // ── Scratch to reveal the date ──
  const sc = $("scratch"), sctx = sc.getContext("2d", { willReadFrequently: true });
  let scratched = false, revealed = false, moves = 0, last = null;
  function paintFoil() {
    if (scratched) return;
    const r = sc.parentElement.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    sc.width = r.width * dpr; sc.height = r.height * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = sctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#e9c3b4"); g.addColorStop(0.35, "#d9a77d"); g.addColorStop(0.55, "#f3dccb");
    g.addColorStop(0.75, "#cf9a72"); g.addColorStop(1, "#e7bfae");
    sctx.globalCompositeOperation = "source-over";
    sctx.fillStyle = g;
    sctx.beginPath(); sctx.roundRect ? sctx.roundRect(0, 0, r.width, r.height, 14) : sctx.rect(0, 0, r.width, r.height); sctx.fill();
    for (let i = 0; i < 90; i++) {
      sctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
      sctx.fillRect(Math.random() * r.width, Math.random() * r.height, 1.5, 1.5);
    }
    sctx.fillStyle = "rgba(110,58,57,.75)";
    sctx.textAlign = "center"; sctx.textBaseline = "middle";
    sctx.font = "500 15px Cinzel, serif";
    sctx.fillText("♡  SCRATCH HERE  ♡", r.width / 2, r.height / 2);
  }
  function scratchAt(x, y) {
    sctx.globalCompositeOperation = "destination-out";
    sctx.lineWidth = 44; sctx.lineCap = "round";
    sctx.beginPath();
    sctx.moveTo(last ? last[0] : x, last ? last[1] : y);
    sctx.lineTo(x, y);
    sctx.stroke();
    last = [x, y];
    scratched = true;
    if (++moves % 8 === 0 && clearedRatio() > 0.45) reveal();
  }
  function clearedRatio() {
    const d = sctx.getImageData(0, 0, sc.width, sc.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 24) { n++; if (d[i] === 0) clear++; }
    return clear / n;
  }
  function reveal() {
    if (revealed) return;
    revealed = true;
    sc.classList.add("done");
    $("scratchHint").textContent = "Save the Date ♡";
    $("scratchHint").classList.add("revealed");
    const r = sc.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
  }
  const pt = (e) => { const r = sc.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  sc.addEventListener("pointerdown", (e) => { sc.setPointerCapture(e.pointerId); last = null; scratchAt(...pt(e)); });
  sc.addEventListener("pointermove", (e) => { if (sc.hasPointerCapture(e.pointerId)) scratchAt(...pt(e)); });
  sc.addEventListener("pointerup", () => { last = null; });
  $("scratchHint").addEventListener("click", reveal);
  paintFoil();

  // ── Countdown ──
  const units = Object.fromEntries([...document.querySelectorAll("#clock b")].map((b) => [b.dataset.u, b]));
  function tick() {
    let s = Math.max(0, Math.floor((wedding - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in v) units[k].textContent = k === "d" ? v[k] : pad(v[k]);
  }
  tick();
  setInterval(tick, 1000);
  txt("hashtag", C.hashtag || "");
  txt("closing", C.closing || "See you there!");
  txt("photosCap", C.photosCaption || "");

  // ── Scroll reveal ──
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll(".palace, .mandap").forEach((x) => x.classList.add("drawn"));
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((s) => io.observe(s));

  function layout() { layoutPolaroids(); layoutTimeline(); paintFoil(); }
  addEventListener("resize", layout);
  addEventListener("scroll", drawTimeline, { passive: true });
  document.fonts && document.fonts.ready.then(layout);
  layout();

  // ── Burst of petals (scratch reveal) ──
  function confetti(x = innerWidth / 2, y = innerHeight * 0.6) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.className = "petal";
      Object.assign(p.style, { left: x + "px", top: y + "px", animation: "none", transition: "transform 1.6s cubic-bezier(.1,.7,.3,1), opacity 1.6s" });
      $("petals").appendChild(p);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 220;
        p.style.transform = `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r - 120}px) rotate(${Math.random() * 720}deg)`;
        p.style.opacity = 0;
      }));
      setTimeout(() => p.remove(), 1800);
    }
  }

  // ── Music: an mp3 if configured, otherwise a generated music-box melody ──
  const Music = (function () {
    const btn = $("music");
    let on = false, useSynth = false, audio, fade, ctx, timer, next = 0, step = 0;
    // I–vi–IV–V in D major, arpeggiated
    const chords = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]];
    const melody = [78, 76, 74, 76, 78, 81, 78, 0, 74, 76, 78, 76, 74, 71, 74, 0, 71, 74, 76, 74, 71, 69, 71, 0, 73, 76, 78, 81, 79, 78, 76, 0];
    const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
    let out;
    function bell(note, t, vol, dur) {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o2.type = "sine";
      o.frequency.value = hz(note); o2.frequency.value = hz(note) * 3.01;
      const g2 = ctx.createGain(); g2.gain.value = 0.12;
      o.connect(g); o2.connect(g2).connect(g); g.connect(out);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }
    function schedule() {
      const eighth = 60 / 72 / 2;
      while (next < ctx.currentTime + 0.4) {
        const bar = Math.floor(step / 8) % 4, ch = chords[bar], i = step % 8;
        if (i === 0) bell(ch[0] - 12, next, 0.18, 2.6);
        bell([ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1] + 12, ch[0] + 12, ch[2]][i], next, 0.06, 1.4);
        const m = melody[step % melody.length];
        if (m && step >= 32) bell(m, next, 0.08, 1.8);
        next += eighth; step++;
      }
    }
    function startSynth() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!out) {
        out = ctx.createGain(); out.gain.value = 0.9;
        const delay = ctx.createDelay(), fb = ctx.createGain(), wet = ctx.createGain();
        delay.delayTime.value = 0.42; fb.gain.value = 0.35; wet.gain.value = 0.3;
        out.connect(ctx.destination); out.connect(delay); delay.connect(fb).connect(delay); delay.connect(wet).connect(ctx.destination);
      }
      ctx.resume();
      clearInterval(timer);
      next = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 100);
    }
    // Skip the song's quiet intro: start (and loop back) at music.start seconds
    const startAt = (C.music && C.music.start) || 0;
    let firstPlay = true;
    function seekToStart() {
      if (!startAt) return;
      if (audio.readyState >= 1) audio.currentTime = startAt;
      else audio.addEventListener("loadedmetadata", () => (audio.currentTime = startAt), { once: true });
    }
    // Start downloading right away so the song is ready by the time the envelope is tapped
    if (C.music && C.music.src) {
      audio = Object.assign(new Audio(C.music.src), { volume: 0.25, preload: "auto" });
      audio.addEventListener("error", () => { useSynth = true; audio.pause(); if (on) startSynth(); });
      audio.addEventListener("ended", () => { seekToStart(); audio.play(); });
      audio.load();
    }
    function set(v) {
      on = v;
      btn.classList.toggle("playing", on);
      if (audio && !useSynth) {
        clearInterval(fade);
        if (on) {
          if (firstPlay) { seekToStart(); firstPlay = false; }
          audio.play().catch((e) => { if (e.name === "NotAllowedError") set(false); });
          // quick fade-in (iOS ignores volume, so it simply plays)
          fade = setInterval(() => {
            audio.volume = Math.min(0.7, audio.volume + 0.05);
            if (audio.volume >= 0.7) clearInterval(fade);
          }, 80);
        } else audio.pause();
      } else if (on) startSynth();
      else { clearInterval(timer); ctx && ctx.suspend(); }
    }
    btn.addEventListener("click", () => set(!on));
    return { start: () => set(true) };
  })();
})();
