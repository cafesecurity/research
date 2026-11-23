// Claims explorer: search and filters over the claims rendered on the page.
// The page works without this script; it only adds filtering. Licence: MIT.
(function () {
  "use strict";
  var form = document.getElementById("claim-filters");
  if (!form) return;
  var claims = Array.prototype.slice.call(document.querySelectorAll("article.claim"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("section.claim-study"));
  var count = document.getElementById("claim-count");
  var none = document.getElementById("claim-none");
  var fields = ["text", "study", "topic", "status"];

  // Index each claim's visible text once.
  var index = claims.map(function (el) {
    return (el.id + " " + el.textContent).toLowerCase().replace(/\s+/g, " ");
  });

  function values() {
    var v = {};
    fields.forEach(function (f) { v[f] = (form.elements[f].value || "").trim(); });
    return v;
  }

  function apply(updateUrl) {
    var v = values();
    var words = v.text.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    claims.forEach(function (el, i) {
      var ok = (!v.study || el.dataset.study === v.study) &&
               (!v.topic || el.dataset.topic === v.topic) &&
               (!v.status || el.dataset.status === v.status) &&
               words.every(function (w) { return index[i].indexOf(w) !== -1; });
      el.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(function (s) {
      s.hidden = !s.querySelector("article.claim:not([hidden])");
    });
    count.textContent = shown === claims.length
      ? claims.length + " claims"
      : "Showing " + shown + " of " + claims.length + " claims";
    none.hidden = shown !== 0;
    if (updateUrl) {
      var params = new URLSearchParams();
      fields.forEach(function (f) { if (v[f]) params.set(f, v[f]); });
      var qs = params.toString();
      try {
        history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
      } catch (e) { /* ignore: some embedded views block history changes */ }
    }
  }

  // Restore filters from the address, e.g. /claims/?topic=law
  var params = new URLSearchParams(location.search);
  fields.forEach(function (f) {
    var val = params.get(f);
    if (val === null) return;
    var el = form.elements[f];
    if (el.tagName === "SELECT" && !el.querySelector('option[value="' + CSS.escape(val) + '"]')) return;
    el.value = val;
  });

  var timer;
  form.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { apply(true); }, 120);
  });
  form.addEventListener("change", function () { apply(true); });
  form.addEventListener("reset", function () { setTimeout(function () { apply(true); }, 0); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  // A link to one claim always shows it, whatever the filters say.
  function reveal() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (!el || !el.classList.contains("claim")) return;
    if (el.hidden) { form.reset(); apply(true); }
    claims.forEach(function (c) { c.classList.toggle("is-target", c === el); });
    el.scrollIntoView({ block: "start" });
  }
  window.addEventListener("hashchange", reveal);

  form.hidden = false;
  apply(false);
  reveal();
})();
