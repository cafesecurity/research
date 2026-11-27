// Glossary: filters (search, reader), topic counts, compact view and hover definitions.
// The page works without this script. Nothing is stored or sent. Licence: MIT.
// All text is written with textContent; no HTML is built from page or URL data.
(function () {
  "use strict";
  var bar = document.getElementById("gloss-bar");
  var input = document.getElementById("gloss-q");
  if (!bar || !input) return;
  var terms = Array.prototype.slice.call(document.querySelectorAll(".cs-term"));
  if (!terms.length) return;
  var count = document.getElementById("gloss-count");
  var reset = document.getElementById("gloss-reset");
  var compact = document.getElementById("gloss-compact");
  var chips = Array.prototype.slice.call(bar.querySelectorAll(".cs-chip"));
  var content = document.querySelector(".md-content") || document.body;
  var AUD = { all: "everyone", start: "Start here", leaders: "Leaders", security: "Security teams",
              developers: "Developers", researchers: "Researchers", risk: "Risk and compliance" };
  var aud = "all";

  Array.prototype.forEach.call(bar.querySelectorAll(".cs-needs-js"), function (el) { el.hidden = false; });

  // ----- index terms -----
  var info = terms.map(function (el) {
    var h = el.querySelector("h3");
    var first = el.querySelector("li");
    var def = first ? first.textContent.replace(/^\s*What it is:\s*/, "").replace(/\s+/g, " ").trim() : "";
    var title = h ? h.textContent.replace(/¶/g, "").replace(/\s+/g, " ").trim() : "";
    var tags = (el.getAttribute("data-aud") || "").split(/\s+/).filter(function (t) { return AUD.hasOwnProperty(t); });
    return { el: el, id: h ? h.id : "", title: title, def: def, tags: tags,
             text: ((h ? h.id : "") + " " + el.textContent).toLowerCase().replace(/\s+/g, " ") };
  });
  var byId = {};
  info.forEach(function (t) { if (t.id) byId[t.id] = t; });

  // Reader badges under each heading.
  info.forEach(function (t) {
    var names = t.tags.filter(function (x) { return x !== "start"; }).map(function (x) { return AUD[x]; });
    if (!names.length) return;
    var p = document.createElement("p");
    p.className = "cs-term-for";
    p.textContent = "For: " + names.join(" · ");
    var h = t.el.querySelector("h3");
    if (h && h.nextSibling) t.el.insertBefore(p, h.nextSibling);
  });

  // ----- sections: every node between one h2 and the next -----
  var sections = [];
  Array.prototype.forEach.call(content.querySelectorAll("h2"), function (h2) {
    var nodes = [h2], n = h2.nextElementSibling, own = [];
    while (n && n.tagName !== "H2") { nodes.push(n); n = n.nextElementSibling; }
    info.forEach(function (t) { if (nodes.indexOf(t.el) !== -1) own.push(t); });
    sections.push({ id: h2.id, nodes: nodes, terms: own });
  });
  var counters = Array.prototype.slice.call(document.querySelectorAll(".cs-topic-n"));
  function topicCounts(active) {
    counters.forEach(function (el) {
      var id = el.getAttribute("data-count");
      sections.forEach(function (s) {
        if (s.id !== id || !s.terms.length) return;
        var n = s.terms.length, vis = s.terms.filter(function (t) { return !t.el.hidden; }).length;
        el.textContent = active ? vis + " of " + n + " terms" : n + (n === 1 ? " term" : " terms");
        if (el.parentNode) el.parentNode.classList.toggle("cs-topic-empty", active && vis === 0);
      });
    });
  }

  // ----- filtering -----
  function words() {
    return String(input.value || "").toLowerCase().split(/\s+/).filter(Boolean).slice(0, 10);
  }
  function apply() {
    var w = words(), shown = 0, active = w.length > 0 || aud !== "all";
    info.forEach(function (t) {
      var ok = (aud === "all" || t.tags.indexOf(aud) !== -1) &&
               w.every(function (x) { return t.text.indexOf(x) !== -1; });
      t.el.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(function (s) {
      if (!s.terms.length) return;
      var any = s.terms.some(function (t) { return !t.el.hidden; });
      s.nodes.forEach(function (n) { if (!n.classList.contains("cs-term")) n.hidden = active && !any; });
    });
    topicCounts(active);
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-aud") === aud ? "true" : "false"); });
    reset.hidden = !active;
    if (!active) count.textContent = info.length + " terms.";
    else if (shown === 0) count.textContent = "No terms match. Try a shorter word or another reader.";
    else count.textContent = shown + " of " + info.length + " terms" + (aud === "all" ? "" : aud === "start" ? " to start with" : " for " + AUD[aud].toLowerCase()) + ".";
    try {
      var url = new URL(window.location.href);
      if (aud === "all") url.searchParams.delete("for"); else url.searchParams.set("for", aud);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* address bar not updated; filtering still works */ }
  }
  function clear() { aud = "all"; input.value = ""; apply(); }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var a = c.getAttribute("data-aud");
      aud = AUD.hasOwnProperty(a) ? a : "all";
      apply();
    });
  });
  input.addEventListener("input", apply);
  input.addEventListener("keydown", function (e) { if (e.key === "Escape") { input.value = ""; apply(); } });
  reset.addEventListener("click", clear);
  compact.addEventListener("click", function () {
    var on = content.classList.toggle("cs-compact");
    compact.setAttribute("aria-pressed", on ? "true" : "false");
    compact.textContent = on ? "Full entries" : "Definitions only";
  });

  // A link to a term or section that the filters have hidden clears the filters first.
  function reveal() {
    var id = decodeURIComponent((window.location.hash || "").slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var hiddenBy = target.closest("[hidden]");
    if (hiddenBy) { clear(); target.scrollIntoView(); }
  }
  window.addEventListener("hashchange", reveal);

  // Reader from the address (?for=developers); only known values are used.
  try {
    var q = new URL(window.location.href).searchParams.get("for");
    if (q && AUD.hasOwnProperty(q)) aud = q;
  } catch (e) { /* ignore */ }
  apply();
  reveal();

  // ----- hover and focus definitions -----
  var tip = document.createElement("div");
  tip.className = "cs-tip";
  tip.id = "gloss-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  var tipTitle = document.createElement("strong");
  var tipBody = document.createElement("span");
  tip.appendChild(tipTitle); tip.appendChild(tipBody);
  document.body.appendChild(tip);
  var current = null, timer = null;

  function shorten(text) {
    if (text.length <= 230) return text;
    var cut = text.slice(0, 230), stop = cut.lastIndexOf(". ");
    return stop > 90 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
  }
  function show(link, t) {
    current = link;
    tipTitle.textContent = t.title;
    tipBody.textContent = shorten(t.def);
    tip.hidden = false;
    link.setAttribute("aria-describedby", "gloss-tip");
    var r = link.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, document.documentElement.clientWidth - w - 8));
    var top = r.top - h - 8;
    if (top < 56) top = r.bottom + 8;
    tip.style.left = Math.round(left + window.scrollX) + "px";
    tip.style.top = Math.round(top + window.scrollY) + "px";
  }
  function hide() {
    window.clearTimeout(timer);
    if (current) current.removeAttribute("aria-describedby");
    current = null;
    tip.hidden = true;
  }
  Array.prototype.forEach.call(content.querySelectorAll('a[href^="#"]'), function (link) {
    var t = byId[decodeURIComponent(link.getAttribute("href").slice(1))];
    if (!t || !t.def || link.classList.contains("headerlink")) return;
    link.classList.add("cs-termlink");
    link.addEventListener("mouseenter", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { show(link, t); }, 150);
    });
    link.addEventListener("mouseleave", hide);
    link.addEventListener("focus", function () { show(link, t); });
    link.addEventListener("blur", hide);
    link.addEventListener("click", hide);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  window.addEventListener("scroll", function () { if (current) hide(); }, { passive: true });
})();
