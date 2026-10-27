// Google Apps Script — stores wedding RSVPs in this spreadsheet.
// Setup: Extensions → Apps Script → paste this → set SECRET → Deploy → New deployment
//        → type "Web app", Execute as "Me", Who has access "Anyone" → copy the URL.

const SECRET = "CHANGE-ME"; // must match SHEET_SECRET on the server
const COLS = ["id", "name", "attending", "guests", "events", "wish", "note", "invitedAs", "updated"];
const HEAD = ["ID", "Name", "Attending", "Guests", "Events", "Wish", "Note", "Invited as", "Updated"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("RSVPs");
  if (!sh) {
    sh = ss.insertSheet("RSVPs");
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold");
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.secret !== SECRET) return json_({ error: "forbidden" });
  const values = sheet_().getDataRange().getValues().slice(1);
  return json_(values.filter((r) => r[0]).map((r) => Object.fromEntries(COLS.map((c, i) => [c, r[i]]))));
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.secret !== SECRET) return json_({ error: "forbidden" });
  const row = body.row;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const values = COLS.map((c) => (c === "attending" ? (row[c] ? "Yes" : "No") : row[c] ?? ""));
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map((r) => r[0]);
    const at = ids.indexOf(row.id);
    if (at > 0) sh.getRange(at + 1, 1, 1, COLS.length).setValues([values]);
    else sh.appendRow(values);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
