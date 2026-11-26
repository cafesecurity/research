// AI pentest agent readiness planner (research.cafesecurity.com/artex/readiness/).
// Everything runs in the browser: nothing typed here is sent anywhere. Progress is kept in
// this browser's local storage and can be exported (PDF via print, CSV, Excel, Markdown,
// JSON, calendar) or shared as a link whose data stays in the part after "#".
// Licence: MIT. Café Security Research.
(function (root) {
  "use strict";

  var CONTENT_VERSION = "2026-11-26";
  var STORE_KEY = "csr-readiness-planner";
  var SCHEMA = 1;
  var CLAIM_URL = "/claims/#artex-2026-11-";
  var IND_URL = "/artex/indicators/";
  var STATUSES = [["todo", "Not started"], ["doing", "In progress"], ["done", "Done"], ["na", "Not applicable"]];
  var STATUS_LABEL = {}; STATUSES.forEach(function (s) { STATUS_LABEL[s[0]] = s[1]; });

  // The plan. Task IDs are stable: a later version of this page keeps your status, owner,
  // dates and notes for every task whose ID it still has.
  var PLAN = [
    { id: "ws1", rank: 1, title: "Machine credentials", team: "Platform team",
      why: "Stolen machine credentials did the damage at Bitrise and in the AWS cases Datadog described.", claims: ["C219", "C126"],
      question: "Which of our machine credentials would still work if they leaked today?",
      tasks: [
        { id: "ws1-inventory", text: "List every long-lived machine credential", detail: "Cloud and service-account keys, CI/CD tokens, API keys in SaaS integrations: where each is stored, what it can reach, who owns it and when it expires." },
        { id: "ws1-replace", text: "Replace the riskiest with short-lived credentials tied to the workload", detail: "For example workload identity federation on Google Cloud, IAM roles on AWS or managed identities on Azure." },
        { id: "ws1-scope", text: "Limit the rest to the job they do", detail: "One credential per service, least privilege, an expiry date." },
        { id: "ws1-protect", text: "Mark build secrets as protected, so nobody can simply reveal them", detail: "Bitrise's attacker read CI secrets that hadn't been marked as protected.", claims: ["C219"] },
        { id: "ws1-exposed", text: "Find exposed secrets and rotate them", detail: "Search repositories, CI logs, JavaScript bundles and environment files." }
      ] },
    { id: "ws2", rank: 2, title: "Detection", team: "Security operations centre",
      why: "Four alerts that watch what credentials and accounts do. They also cover you while the other workstreams are under way.",
      question: "If a key was used from somewhere new tonight, who would know by morning?",
      tasks: [
        { id: "ws2-logging", text: "Make sure internal web apps and APIs log requests", detail: "A detection engineer who ran ARTEX against his own network found most of his internal apps logged nothing.", claims: ["C213"] },
        { id: "ws2-alert1", text: "Alert 1: a machine credential used from outside your own networks and cloud ranges", detail: "Bitrise says this one rule matched every stolen-key use in its advisory. Rules for Google Cloud, AWS and Azure.", claims: ["C219"], link: true },
        { id: "ws2-alert2", text: "Alert 2: a secret exposed, then any credential used from a new address within the hour", detail: "Joins a secret-exposure event with credential use from an address that credential hasn't used before.", link: true },
        { id: "ws2-alert3", text: "Alert 3: a burst of failed sign-ins, then a success", detail: "Bitrise saw failed sign-ins on three bots two minutes before the one that got in.", claims: ["C219"], link: true },
        { id: "ws2-alert4", text: "Alert 4: traffic calling itself an authorised test you didn't book", detail: "ARTEX's built-in prompts describe the work as an authorised penetration test.", claims: ["C184", "C211"], link: true },
        { id: "ws2-history", text: "Search past logs for tool names and test labels", detail: "\"norma/0.4\", \"artex-enrich/1.0\", \"authorized-pentest\". These find older copies and past visits only: newer builds use ordinary browser user agents.", claims: ["C208", "C209", "C210"], link: true }
      ] },
    { id: "ws3", rank: 3, title: "Accounts and exposure", team: "Identity and infrastructure teams",
      why: "Bitrise's intruder walked in through a forgotten test account, and ARTEX carries no exploit library of its own.", claims: ["C219", "C042"],
      question: "Which accounts and consoles has nobody touched this year?",
      tasks: [
        { id: "ws3-dormant", text: "Switch off dormant, test and supplier accounts", detail: "Bitrise's way in was a test bot nobody had used since 2022, with no two-factor authentication.", claims: ["C219"] },
        { id: "ws3-supplier-keys", text: "Revoke any key a former supplier still holds" },
        { id: "ws3-2fa", text: "Put two-factor authentication on every account that's left" },
        { id: "ws3-consoles", text: "Take admin consoles, build systems and cloud management endpoints off the open internet" },
        { id: "ws3-forgotten", text: "Close the endpoints nobody remembers" },
        { id: "ws3-signups", text: "Limit automated sign-ups and public identity pools" },
        { id: "ws3-agent-consoles", text: "Check your own estate for AI pentest agent consoles nobody approved", detail: "For ARTEX: port 8787 and an unauthenticated health check that names the service.", claims: ["C100", "C104"], link: true }
      ] },
    { id: "ws4", rank: 4, title: "Data leaving, and the night it goes wrong", team: "Security architecture and incident response",
      why: "Make data leaving the hard part, and know how to revoke a key everywhere it's honoured. ARTEX ships with its data-leak rule switched off.", claims: ["C085"],
      question: "For our most important key, do we know every place to revoke it?",
      tasks: [
        { id: "ws4-egress", text: "Give build servers and back ends egress allow-lists", detail: "So they can only talk to the places they need." },
        { id: "ws4-ratelimit", text: "Rate-limit anything that can send or export in bulk" },
        { id: "ws4-secret-reads", text: "Log who reads your secrets" },
        { id: "ws4-runbook", text: "Write a revocation runbook for each important key", detail: "Where it's honoured, how to kill it there, and a fixed window for judging the damage. Disabling a key doesn't recall tokens already issued from it.", claims: ["C219"] },
        { id: "ws4-supplier-question", text: "If you commission AI-driven testing, ask the supplier: is scope enforced in the network, or only in a prompt?", claims: ["C082", "C083"] }
      ] }
  ];
  var TASK_INDEX = {};
  PLAN.forEach(function (ws) { ws.tasks.forEach(function (t) { TASK_INDEX[t.id] = { ws: ws, task: t }; }); });

  // ---------- state ----------
  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(iso, n) { var d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function blankState() {
    var s = today();
    return { schema: SCHEMA, content: CONTENT_VERSION, settings: { org: "", owner: "", start: s, target: addDays(s, 30) }, tasks: {}, custom: [], updated: "" };
  }
  function str(v, max) { return typeof v === "string" ? v.slice(0, max || 2000) : ""; }
  function isoDate(v) { return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ""; }
  function cleanEntry(e) {
    e = e || {};
    return { owner: str(e.owner, 200), status: STATUS_LABEL[e.status] ? e.status : "todo", due: isoDate(e.due), notes: str(e.notes, 4000), updated: str(e.updated, 40) };
  }
  // Accepts anything (stored, imported or shared) and returns a clean state.
  function normalise(raw) {
    var st = blankState();
    if (!raw || typeof raw !== "object") return st;
    var se = raw.settings || {};
    st.settings = { org: str(se.org, 200), owner: str(se.owner, 200), start: isoDate(se.start) || st.settings.start, target: isoDate(se.target) || st.settings.target };
    var tasks = raw.tasks || {};
    Object.keys(tasks).forEach(function (id) { if (TASK_INDEX[id] || /^custom-/.test(id)) st.tasks[id] = cleanEntry(tasks[id]); });
    (Array.isArray(raw.custom) ? raw.custom : []).slice(0, 200).forEach(function (c) {
      if (!c || !/^custom-[\w-]{1,40}$/.test(c.id) || !PLAN.some(function (w) { return w.id === c.ws; })) return;
      st.custom.push({ id: c.id, ws: c.ws, text: str(c.text, 300) || "New task" });
    });
    st.updated = str(raw.updated, 40);
    return st;
  }
  function entry(st, id) { return st.tasks[id] || (st.tasks[id] = cleanEntry({})); }

  // Every task row, in plan order, custom tasks after each workstream's own.
  function rows(st) {
    var out = [];
    PLAN.forEach(function (ws) {
      ws.tasks.forEach(function (t) { var e = entry(st, t.id); out.push({ ws: ws, id: t.id, text: t.text, detail: t.detail || "", custom: false, owner: e.owner, status: e.status, due: e.due, notes: e.notes, updated: e.updated }); });
      st.custom.filter(function (c) { return c.ws === ws.id; }).forEach(function (c) { var e = entry(st, c.id); out.push({ ws: ws, id: c.id, text: c.text, detail: "", custom: true, owner: e.owner, status: e.status, due: e.due, notes: e.notes, updated: e.updated }); });
    });
    return out;
  }
  function progress(list) {
    var live = list.filter(function (r) { return r.status !== "na"; });
    var done = live.filter(function (r) { return r.status === "done"; }).length;
    return { done: done, total: live.length, pct: live.length ? Math.round(100 * done / live.length) : 0 };
  }
  function themeState(st, ids) {
    var list = rows(st).filter(function (r) { return ids.indexOf(r.id) >= 0 && r.status !== "na"; });
    if (!list.length) return "na";
    if (list.every(function (r) { return r.status === "done"; })) return "done";
    if (list.some(function (r) { return r.status === "done" || r.status === "doing"; })) return "doing";
    return "todo";
  }
  function longDate(iso) {
    if (!iso) return "";
    var m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var p = iso.split("-"); return String(+p[2]) + " " + m[+p[1] - 1] + " " + p[0];
  }
  // A serial comma only where an item already contains "and", so the list stays unambiguous.
  function joinList(a) { if (a.length < 2) return a.join(""); var sep = a.some(function (x) { return / and /.test(x); }) && a.length > 2 ? ", and " : " and "; return a.slice(0, -1).join(", ") + sep + a[a.length - 1]; }

  // The two sentences for the board, updated from the plan's status.
  function boardAnswer(st) {
    var first = "The tool is cheap, fast and noisy, and it gets in through old credentials and forgotten systems rather than anything exotic.";
    var themes = [
      { s: themeState(st, ["ws1-replace", "ws1-scope", "ws1-protect", "ws1-exposed"]), done: "replaced long-lived keys", doing: "replacing long-lived keys", todo: "replace long-lived keys" },
      { s: themeState(st, ["ws3-dormant", "ws3-supplier-keys", "ws3-consoles", "ws3-forgotten"]), done: "closed old accounts and exposed consoles", doing: "closing old accounts and exposed consoles", todo: "close old accounts and exposed consoles" },
      { s: themeState(st, ["ws2-alert1", "ws2-alert2", "ws2-alert3", "ws2-alert4"]), done: "set up alerts for keys used in the wrong place", doing: "setting up alerts for keys used in the wrong place", todo: "set up alerts for keys used in the wrong place" }
    ];
    var done = themes.filter(function (t) { return t.s === "done"; }).map(function (t) { return t.done; });
    var doing = themes.filter(function (t) { return t.s === "doing"; }).map(function (t) { return t.doing; });
    var todo = themes.filter(function (t) { return t.s === "todo"; }).map(function (t) { return t.todo; });
    var parts = [];
    if (done.length) parts.push("We've " + joinList(done));
    if (doing.length) parts.push((parts.length ? "we're " : "We're ") + joinList(doing));
    if (todo.length) parts.push((parts.length ? "we plan to " : "We plan to ") + joinList(todo));
    var second = parts.length ? parts.join("; ") : "We've reviewed each area and recorded what doesn't apply to us";
    var target = st.settings.target;
    if (target && (doing.length || todo.length)) second += ", all by " + longDate(target);
    return first + " " + second + ".";
  }

  // ---------- exports ----------
  var COLUMNS = ["Priority", "Workstream", "Team", "Task ID", "Task", "Owner", "Status", "Due", "Notes", "Last updated"];
  function tableRows(st) {
    return rows(st).map(function (r) { return [String(r.ws.rank), r.ws.title, r.ws.team, r.id, r.text, r.owner, STATUS_LABEL[r.status], r.due, r.notes, r.updated]; });
  }
  function csvField(v) { v = String(v == null ? "" : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCSV(st) {
    return "\uFEFF" + [COLUMNS].concat(tableRows(st)).map(function (r) { return r.map(csvField).join(","); }).join("\r\n") + "\r\n";
  }
  function toTSV(st) {
    return [COLUMNS].concat(tableRows(st)).map(function (r) { return r.map(function (v) { return String(v).replace(/[\t\r\n]+/g, " "); }).join("\t"); }).join("\n");
  }
  function parseCSV(text) {
    text = String(text).replace(/^\uFEFF/, "");
    var out = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); out.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f !== "" || row.length) { row.push(f); out.push(row); }
    return out.filter(function (r) { return r.some(function (v) { return v !== ""; }); });
  }
  // Updates a state from a CSV in this planner's own format (as exported, then edited in a spreadsheet).
  function fromCSV(st, text) {
    var data = parseCSV(text);
    if (!data.length) throw new Error("The file is empty.");
    var head = data[0].map(function (h) { return h.trim().toLowerCase(); });
    var col = function (name) { return head.indexOf(name.toLowerCase()); };
    var iId = col("Task ID"), iTask = col("Task"), iWs = col("Workstream"), iOwner = col("Owner"), iStatus = col("Status"), iDue = col("Due"), iNotes = col("Notes");
    if (iId < 0 || iStatus < 0) throw new Error("This doesn't look like a CSV exported from the planner (no Task ID or Status column).");
    var byLabel = {}; STATUSES.forEach(function (s) { byLabel[s[1].toLowerCase()] = s[0]; byLabel[s[0]] = s[0]; });
    var n = 0;
    data.slice(1).forEach(function (r) {
      var id = (r[iId] || "").trim(); if (!id) return;
      if (!TASK_INDEX[id] && !/^custom-[\w-]{1,40}$/.test(id)) return;
      if (/^custom-/.test(id) && !st.custom.some(function (c) { return c.id === id; })) {
        var ws = PLAN.filter(function (w) { return w.title === (r[iWs] || "").trim(); })[0];
        if (!ws) return;
        st.custom.push({ id: id, ws: ws.id, text: str((r[iTask] || "").trim(), 300) || "New task" });
      }
      var e = entry(st, id);
      if (iOwner >= 0) e.owner = str(r[iOwner] || "", 200);
      var s = byLabel[(r[iStatus] || "").trim().toLowerCase()]; if (s) e.status = s;
      if (iDue >= 0) e.due = isoDate((r[iDue] || "").trim());
      if (iNotes >= 0) e.notes = str(r[iNotes] || "", 4000);
      e.updated = new Date().toISOString(); n++;
    });
    return n;
  }
  // Markdown export. Plans can arrive in a shared link, so treat every value as untrusted:
  // escape backslashes before pipes (a "\|" typed by the user must not close the cell), and turn
  // HTML's special characters into entities so nothing renders as markup in a Markdown viewer.
  function mdHtml(v) { return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function mdText(v) { return mdHtml(v).replace(/\\/g, "\\\\").replace(/[\r\n]+/g, " "); }
  function mdCell(v) { return mdHtml(v).replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/[\r\n]+/g, "<br>"); }
  function toMarkdown(st) {
    var s = st.settings, L = [];
    L.push("# AI pentest agent readiness plan" + (s.org ? ": " + mdText(s.org) : ""));
    L.push("");
    L.push("Plan owner: " + (mdText(s.owner) || "not set") + " · Start: " + (longDate(s.start) || "not set") + " · Target: " + (longDate(s.target) || "not set"));
    var p = progress(rows(st));
    L.push("Progress: " + p.done + " of " + p.total + " tasks done (" + p.pct + "%)");
    L.push("");
    L.push("## For the board"); L.push(""); L.push(mdText(boardAnswer(st))); L.push("");
    PLAN.forEach(function (ws) {
      var list = rows(st).filter(function (r) { return r.ws === ws; });
      L.push("## " + ws.rank + ". " + ws.title + " (" + ws.team + ")"); L.push("");
      L.push("Question for the team: " + ws.question); L.push("");
      L.push("| Status | Task | Owner | Due | Notes |"); L.push("| --- | --- | --- | --- | --- |");
      list.forEach(function (r) { L.push("| " + [STATUS_LABEL[r.status], r.text, r.owner, r.due, r.notes].map(mdCell).join(" | ") + " |"); });
      L.push("");
    });
    L.push("Made with the AI pentest agent readiness planner, https://research.cafesecurity.com/artex/readiness/ (plan version " + CONTENT_VERSION + ").");
    return L.join("\n") + "\n";
  }
  // Calendar file: one all-day event per task with a due date, plus the target date.
  function utf8(s) { return unescape(encodeURIComponent(s)); }
  function icsText(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function fold(line) {
    var out = [], cur = "", bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], code = line.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < line.length) { ch += line[++i]; }
      var b = utf8(ch).length, limit = out.length ? 74 : 75;
      if (bytes + b > limit) { out.push(cur); cur = ""; bytes = 0; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join("\r\n ");
  }
  function toICS(st, now) {
    var stamp = (now || new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cafe Security Research//Readiness planner//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    function ev(uid, date, summary, desc) {
      L.push("BEGIN:VEVENT", "UID:" + uid + "@research.cafesecurity.com", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + date.replace(/-/g, ""), "DTEND;VALUE=DATE:" + addDays(date, 1).replace(/-/g, ""),
        "SUMMARY:" + icsText(summary), "DESCRIPTION:" + icsText(desc), "END:VEVENT");
    }
    rows(st).forEach(function (r) {
      if (r.due && r.status !== "done" && r.status !== "na") ev("readiness-" + r.id, r.due, "Readiness: " + r.text, r.ws.title + " (" + r.ws.team + ")" + (r.owner ? ". Owner: " + r.owner : "") + (r.notes ? ". Notes: " + r.notes : ""));
    });
    if (st.settings.target) ev("readiness-target", st.settings.target, "Readiness plan: target date", boardAnswer(st));
    L.push("END:VCALENDAR");
    return L.map(fold).join("\r\n") + "\r\n";
  }

  // A small, dependency-free .xlsx writer (stored zip, inline strings).
  var CRC_TABLE = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { var c = 0xFFFFFFFF; for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8Bytes(s) { var b = utf8(s), out = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i); return out; }
  function zip(files) {
    var parts = [], central = [], offset = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    files.forEach(function (f) {
      var name = utf8Bytes(f.name), data = utf8Bytes(f.text), crc = crc32(data);
      var local = [].concat([0x50, 0x4B, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(local), name, data);
      central.push(new Uint8Array([].concat([0x50, 0x4B, 0x01, 0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset))), name);
      offset += local.length + name.length + data.length;
    });
    var cdSize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var end = new Uint8Array([].concat([0x50, 0x4B, 0x05, 0x06], u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0)));
    var all = parts.concat(central, [end]), len = all.reduce(function (a, b) { return a + b.length; }, 0), out = new Uint8Array(len), p = 0;
    all.forEach(function (a) { out.set(a, p); p += a.length; });
    return out;
  }
  function xml(v) { return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function colName(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function sheetXML(data, widths) {
    var cols = widths ? "<cols>" + widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join("") + "</cols>" : "";
    var body = data.map(function (r, ri) {
      return '<row r="' + (ri + 1) + '">' + r.map(function (v, ci) {
        return '<c r="' + colName(ci) + (ri + 1) + '" t="inlineStr"' + (ri === 0 ? ' s="1"' : ' s="2"') + '><is><t xml:space="preserve">' + xml(v) + "</t></is></c>";
      }).join("") + "</row>";
    }).join("");
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' + cols + "<sheetData>" + body + "</sheetData></worksheet>";
  }
  function toXLSX(st) {
    var s = st.settings, p = progress(rows(st));
    var sheets = [
      { name: "Plan", data: [COLUMNS].concat(tableRows(st)), widths: [9, 30, 30, 22, 60, 20, 14, 12, 50, 22] },
      { name: "Board answer", data: [["For the board"], [boardAnswer(st)]], widths: [120] },
      { name: "Settings", data: [["Setting", "Value"], ["Organisation", s.org], ["Plan owner", s.owner], ["Start date", s.start], ["Target date", s.target], ["Progress", p.done + " of " + p.total + " tasks done (" + p.pct + "%)"], ["Plan version", CONTENT_VERSION], ["Made with", "https://research.cafesecurity.com/artex/readiness/"]], widths: [18, 60] }
    ];
    var files = [
      { name: "[Content_Types].xml", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") + "</Types>" },
      { name: "_rels/.rels", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: "xl/workbook.xml", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map(function (sh, i) { return '<sheet name="' + xml(sh.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + "</sheets></workbook>" },
      { name: "xl/_rels/workbook.xml.rels", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: "xl/styles.xml", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' }
    ].concat(sheets.map(function (sh, i) { return { name: "xl/worksheets/sheet" + (i + 1) + ".xml", text: sheetXML(sh.data, sh.widths) }; }));
    return zip(files);
  }
  function toJSON(st) { return JSON.stringify(Object.assign({ app: "csr-readiness-planner", content: CONTENT_VERSION }, st), null, 2); }
  function fromJSON(text) {
    var raw = JSON.parse(text);
    if (!raw || (raw.app && raw.app !== "csr-readiness-planner")) throw new Error("This isn't a readiness planner backup.");
    return normalise(raw);
  }
  function b64urlEncode(s) { return (typeof btoa === "function" ? btoa(utf8(s)) : Buffer.from(s, "utf8").toString("base64")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64urlDecode(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return typeof atob === "function" ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, "base64").toString("utf8"); }

  var api = { PLAN: PLAN, CONTENT_VERSION: CONTENT_VERSION, blankState: blankState, normalise: normalise, rows: rows, progress: progress, boardAnswer: boardAnswer,
    toCSV: toCSV, toTSV: toTSV, parseCSV: parseCSV, fromCSV: fromCSV, toMarkdown: toMarkdown, toICS: toICS, toXLSX: toXLSX, toJSON: toJSON, fromJSON: fromJSON,
    b64urlEncode: b64urlEncode, b64urlDecode: b64urlDecode, crc32: crc32 };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  // ---------- page ----------
  var mount = document.getElementById("planner");
  if (!mount) return;
  var state, saveNote, loadedShared = false;

  function load() {
    var m = /[#&]plan=([\w-]+)/.exec(location.hash);
    if (m) {
      try {
        var shared = normalise(JSON.parse(b64urlDecode(m[1])));
        if (window.confirm("This link holds a shared readiness plan. Load it? It will replace the plan saved in this browser.")) {
          history.replaceState(null, "", location.pathname + location.search);
          loadedShared = true;
          return shared;
        }
      } catch (e) { window.alert("The shared plan in this link couldn't be read."); }
      history.replaceState(null, "", location.pathname + location.search);
    }
    try { var saved = localStorage.getItem(STORE_KEY); if (saved) return normalise(JSON.parse(saved)); } catch (e) {}
    return blankState();
  }
  function save() {
    state.updated = new Date().toISOString();
    var ok = true;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { ok = false; }
    if (saveNote) saveNote.textContent = ok ? "Saved in this browser at " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + "." : "This browser won't save the plan: export a backup before you leave.";
    refresh();
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function download(name, data, type) {
    var blob = data instanceof Uint8Array ? new Blob([data], { type: type }) : new Blob([data], { type: type + ";charset=utf-8" });
    var a = el("a", { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function fileBase() { return "readiness-plan" + (state.settings.org ? "-" + state.settings.org.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) : "") + "-" + today(); }
  function copy(text, button) {
    var done = function () { var t = button.textContent; button.textContent = "Copied"; setTimeout(function () { button.textContent = t; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt("Copy this:", text); });
    else window.prompt("Copy this:", text);
  }

  var refs = {};
  function render() {
    mount.textContent = "";
    var s = state.settings;
    function setting(key, label, type) {
      return el("label", { class: "pl-field" }, [el("span", { text: label }), el("input", { type: type || "text", value: s[key] || "", maxlength: 200, oninput: function (e) { s[key] = e.target.value; save(); } })]);
    }
    var pace30 = el("button", { type: "button", class: "md-button", text: "30 days from start", onclick: function () { s.target = addDays(s.start || today(), 30); render(); save(); } });
    var pace14 = el("button", { type: "button", class: "md-button", text: "A fortnight from start", onclick: function () { s.target = addDays(s.start || today(), 14); render(); save(); } });
    mount.appendChild(el("section", { class: "pl-settings", "aria-label": "Plan settings" }, [
      setting("org", "Organisation (optional)"), setting("owner", "Plan owner"), setting("start", "Start date", "date"), setting("target", "Target date", "date"),
      el("div", { class: "pl-pace" }, [pace30, pace14])
    ]));

    refs.bar = el("div", { class: "pl-bar-fill" });
    refs.progressText = el("span");
    refs.wsList = el("ul", { class: "pl-ws-list" });
    refs.board = el("p", { class: "pl-board-text" });
    var copyBoard = el("button", { type: "button", class: "md-button", text: "Copy", onclick: function () { copy(boardAnswer(state), copyBoard); } });
    mount.appendChild(el("section", { class: "pl-summary" }, [
      el("div", { class: "pl-progress" }, [el("div", { class: "pl-bar", role: "presentation" }, [refs.bar]), refs.progressText, refs.wsList]),
      el("div", { class: "pl-board" }, [el("h3", { text: "Your two sentences for the board" }), refs.board, copyBoard,
        el("p", { class: "pl-hint", text: "This updates as you mark tasks done." })])
    ]));

    var importInput = el("input", { type: "file", accept: ".json,.csv,application/json,text/csv", hidden: true, onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          if (/\.csv$/i.test(f.name)) { var n = fromCSV(state, r.result); window.alert("Updated " + n + " tasks from " + f.name + "."); }
          else { var next = fromJSON(r.result); if (!window.confirm("Replace the plan in this browser with " + f.name + "?")) return; state = next; }
          render(); save();
        } catch (err) { window.alert("Couldn't import " + f.name + ": " + err.message); }
        e.target.value = "";
      };
      r.readAsText(f);
    } });
    var tsvBtn = el("button", { type: "button", class: "md-button", text: "Copy as a table", title: "Paste into Google Sheets or Excel", onclick: function () { copy(toTSV(state), tsvBtn); } });
    var shareBtn = el("button", { type: "button", class: "md-button", text: "Copy share link", onclick: function () {
      if (!window.confirm("The link will contain everything in your plan, including owners and notes. Anyone with the link can see it. Continue?")) return;
      copy(location.origin + location.pathname + "#plan=" + b64urlEncode(JSON.stringify(state)), shareBtn);
    } });
    mount.appendChild(el("section", { class: "pl-tools", "aria-label": "Export and import" }, [
      el("div", { class: "pl-tool-group" }, [el("strong", { text: "Export" }),
        el("button", { type: "button", class: "md-button md-button--primary", text: "Print or save as PDF", onclick: function () { renderPrint(); window.print(); } }),
        el("button", { type: "button", class: "md-button", text: "Excel (.xlsx)", onclick: function () { download(fileBase() + ".xlsx", toXLSX(state), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); } }),
        el("button", { type: "button", class: "md-button", text: "CSV", onclick: function () { download(fileBase() + ".csv", toCSV(state), "text/csv"); } }),
        tsvBtn,
        el("button", { type: "button", class: "md-button", text: "Markdown", onclick: function () { download(fileBase() + ".md", toMarkdown(state), "text/markdown"); } }),
        el("button", { type: "button", class: "md-button", text: "Calendar (.ics)", title: "Due dates and the target date", onclick: function () { download(fileBase() + ".ics", toICS(state), "text/calendar"); } })]),
      el("div", { class: "pl-tool-group" }, [el("strong", { text: "Keep and share" }),
        el("button", { type: "button", class: "md-button", text: "Back up (.json)", onclick: function () { download(fileBase() + ".json", toJSON(state), "application/json"); } }),
        el("button", { type: "button", class: "md-button", text: "Import .json or .csv", onclick: function () { importInput.click(); } }), importInput,
        shareBtn,
        el("button", { type: "button", class: "md-button", text: "Start again", onclick: function () { if (window.confirm("Clear this plan from this browser? Export a backup first if you want to keep it.")) { state = blankState(); render(); save(); } } })]),
      saveNote = el("p", { class: "pl-hint", text: state.updated ? "Saved in this browser." : "Nothing you type here leaves your browser." })
    ]));

    refs.ws = {};
    PLAN.forEach(function (ws) {
      var list = el("ol", { class: "pl-tasks" });
      rows(state).filter(function (r) { return r.ws === ws; }).forEach(function (r) { list.appendChild(taskRow(r)); });
      refs.ws[ws.id] = el("span", { class: "pl-ws-count" });
      var add = el("button", { type: "button", class: "md-button", text: "Add a task", onclick: function () {
        var text = window.prompt("New task for " + ws.title + ":"); if (!text) return;
        state.custom.push({ id: "custom-" + Date.now().toString(36), ws: ws.id, text: str(text.trim(), 300) || "New task" });
        render(); save();
      } });
      mount.appendChild(el("section", { class: "pl-ws", id: ws.id }, [
        el("header", {}, [el("span", { class: "pl-rank", text: String(ws.rank) }), el("div", {}, [el("h2", { text: ws.title }), el("p", { class: "pl-team", text: ws.team })]), refs.ws[ws.id]]),
        el("p", {}, [ws.why].concat((ws.claims || []).reduce(function (acc, c) { acc.push(acc.length ? ", " : " ("); acc.push(el("a", { href: CLAIM_URL + c, text: c })); return acc; }, [])).concat(ws.claims ? [")"] : [])),
        el("p", { class: "pl-question" }, [el("strong", { text: "Ask the team: " }), ws.question]),
        list, add
      ]));
    });
    refresh();
  }
  function taskRow(r) {
    var e = entry(state, r.id);
    function upd(k) { return function (ev) { e[k] = ev.target.value; e.updated = new Date().toISOString(); if (k === "status") li.dataset.status = e.status; save(); }; }
    var status = el("select", { "aria-label": "Status", onchange: upd("status") }, STATUSES.map(function (s) { return el("option", { value: s[0], text: s[1], selected: e.status === s[0] }); }));
    var meta = [];
    var t = TASK_INDEX[r.id] && TASK_INDEX[r.id].task;
    if (t && t.claims) t.claims.forEach(function (c) { meta.push(el("a", { href: CLAIM_URL + c, text: c })); });
    if (t && t.link) meta.push(el("a", { href: IND_URL, text: "Rules and indicators" }));
    var title = r.custom
      ? el("input", { type: "text", class: "pl-task-edit", value: r.text, maxlength: 300, "aria-label": "Task", oninput: function (ev) { var c = state.custom.filter(function (x) { return x.id === r.id; })[0]; if (c) { c.text = ev.target.value; save(); } } })
      : el("span", { class: "pl-task-text", text: r.text });
    var li = el("li", { class: "pl-task", "data-status": e.status }, [
      el("div", { class: "pl-task-main" }, [status, title]),
      r.detail ? el("p", { class: "pl-detail", text: r.detail }) : null,
      meta.length ? el("p", { class: "pl-refs" }, meta.reduce(function (a, m, i) { if (i) a.push(" · "); a.push(m); return a; }, [])) : null,
      el("div", { class: "pl-task-fields" }, [
        el("label", {}, [el("span", { text: "Owner" }), el("input", { type: "text", value: e.owner, maxlength: 200, oninput: upd("owner") })]),
        el("label", {}, [el("span", { text: "Due" }), el("input", { type: "date", value: e.due, oninput: upd("due") })]),
        el("label", { class: "pl-notes" }, [el("span", { text: "Notes" }), el("textarea", { rows: 1, maxlength: 4000, oninput: upd("notes") }, [e.notes])])
      ]),
      r.custom ? el("button", { type: "button", class: "pl-remove", text: "Remove task", onclick: function () {
        if (!window.confirm("Remove this task?")) return;
        state.custom = state.custom.filter(function (c) { return c.id !== r.id; }); delete state.tasks[r.id]; render(); save();
      } }) : null
    ]);
    return li;
  }
  function refresh() {
    var all = rows(state), p = progress(all);
    if (refs.bar) refs.bar.style.width = p.pct + "%";
    if (refs.progressText) refs.progressText.textContent = p.done + " of " + p.total + " tasks done (" + p.pct + "%)";
    if (refs.board) refs.board.textContent = boardAnswer(state);
    if (refs.wsList) refs.wsList.textContent = "";
    PLAN.forEach(function (ws) {
      var q = progress(all.filter(function (r) { return r.ws === ws; }));
      if (refs.ws && refs.ws[ws.id]) refs.ws[ws.id].textContent = q.done + " / " + q.total + " done";
      if (refs.wsList) refs.wsList.appendChild(el("li", {}, [el("a", { href: "#" + ws.id, text: ws.rank + ". " + ws.title }), el("span", { text: q.done + " / " + q.total })]));
    });
  }
  // A clean report for printing or saving as PDF.
  function renderPrint() {
    var old = document.getElementById("planner-print"); if (old) old.remove();
    var s = state.settings, p = progress(rows(state));
    var box = el("div", { id: "planner-print" }, [
      el("h1", { text: "AI pentest agent readiness plan" + (s.org ? ": " + s.org : "") }),
      el("p", { text: "Plan owner: " + (s.owner || "not set") + " · Start: " + (longDate(s.start) || "not set") + " · Target: " + (longDate(s.target) || "not set") + " · " + p.done + " of " + p.total + " tasks done (" + p.pct + "%)" }),
      el("h2", { text: "For the board" }), el("p", { text: boardAnswer(state) })
    ]);
    PLAN.forEach(function (ws) {
      var tb = el("tbody");
      rows(state).filter(function (r) { return r.ws === ws; }).forEach(function (r) {
        tb.appendChild(el("tr", {}, [el("td", { text: STATUS_LABEL[r.status] }), el("td", { text: r.text }), el("td", { text: r.owner }), el("td", { text: r.due }), el("td", { text: r.notes })]));
      });
      box.appendChild(el("h2", { text: ws.rank + ". " + ws.title + " (" + ws.team + ")" }));
      box.appendChild(el("p", { text: "Ask the team: " + ws.question }));
      box.appendChild(el("table", {}, [el("thead", {}, [el("tr", {}, ["Status", "Task", "Owner", "Due", "Notes"].map(function (h) { return el("th", { text: h }); }))]), tb]));
    });
    box.appendChild(el("p", { class: "pl-hint", text: "Made with the AI pentest agent readiness planner, research.cafesecurity.com/artex/readiness/ (plan version " + CONTENT_VERSION + "). Printed " + longDate(today()) + "." }));
    document.body.appendChild(box);
  }

  state = load();
  render();
  if (loadedShared) save();
})(this);
