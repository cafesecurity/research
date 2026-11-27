// Glossary: filter the terms on the page as you type.
// The page works without this script; it only adds filtering. Licence: MIT.
(function () {
  "use strict";
  var input = document.getElementById("gloss-q");
  if (!input) return;
  var count = document.getElementById("gloss-count");
  var terms = Array.prototype.slice.call(document.querySelectorAll(".cs-term"));
  if (!terms.length) return;

  // Index each term's visible text (and its anchor) once. textContent only: no HTML is built.
  var index = terms.map(function (el) {
    var h = el.querySelector("h3");
    return ((h && h.id ? h.id : "") + " " + el.textContent).toLowerCase().replace(/\s+/g, " ");
  });

  // Each term's section heading, so empty sections can be hidden while filtering.
  var sectionOf = terms.map(function (el) {
    var node = el.previousElementSibling;
    while (node && node.tagName !== "H2") node = node.previousElementSibling;
    return node;
  });

  function apply() {
    var words = String(input.value || "").toLowerCase().split(/\s+/).filter(Boolean).slice(0, 10);
    var shown = 0;
    var visible = new Set();
    terms.forEach(function (el, i) {
      var ok = words.every(function (w) { return index[i].indexOf(w) !== -1; });
      el.hidden = !ok;
      if (ok) { shown++; if (sectionOf[i]) visible.add(sectionOf[i]); }
    });
    sectionOf.forEach(function (h2) { if (h2) h2.hidden = words.length > 0 && !visible.has(h2); });
    if (!words.length) count.textContent = "";
    else count.textContent = shown === 0
      ? "No terms match. Try a shorter word, or use the site search."
      : shown + " of " + terms.length + " terms match.";
  }

  input.addEventListener("input", apply);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; apply(); }
  });
})();
