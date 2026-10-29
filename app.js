// Lädt beim Aufruf die aktuelle README, daher kein Build und kein Workflow nötig.
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const span = (c, s) => `<span class="${c}">${s}</span>`;

// Färbt eine Zeile Shell-Ausgabe; unbekannte Zeilen bleiben unverändert. Zahlen nur mit nums (Stats-Block).
function color(line, nums) {
  const l = esc(line);
  let m;
  if ((m = l.match(/^(\S+@\S+:\S*\$)( .*)$/))) return span("prompt", m[1]) + span("cmd", m[2]);
  if ((m = l.match(/^([A-Za-z ]+?) (\.+) (.*)$/))) return span("key", m[1]) + " " + span("dim", m[2]) + " " + (nums ? m[3].replace(/[+-]?\d[\d.,]*[kKyYm]?/g, x => span(x[0] == "+" ? "add" : x[0] == "-" ? "del" : "num", x)) : m[3]);
  if ((m = l.match(/^([0-9a-f]{7}) (.*)$/))) return span("hash", m[1]) + " " + m[2];
  if ((m = l.match(/^(\S+)(\s+-&gt;\s+)(.*)$/))) return span("key", m[1]) + span("dim", m[2]) + `<a href="https://${m[3]}">${m[3]}</a>`;
  return l.replace(/^●/, span("ok", "●")).replace(/\(running\)/, span("ok", "(running)")).replace(/&quot;200 OK&quot;/, span("ok", "&quot;200 OK&quot;"));
}

fetch("https://raw.githubusercontent.com/larknafets/larknafets/main/README.md")
  .then(r => r.ok ? r.text() : Promise.reject(r.status))
  .then(md => {
    const el = document.getElementById("content");
    el.innerHTML = DOMPurify.sanitize(marked.parse(md));
    el.querySelectorAll("pre code").forEach(c => {
      const stats = /\bgh stats\b/.test(c.textContent), pre = c.parentNode;
      pre.dataset.cmd = c.textContent.split("\n")[0];
      c.innerHTML = c.textContent.split("\n").map(l => color(l, stats)).join("\n");
      // Gelber und grüner Punkt blenden die Box ein und aus; Stats starten ausgeblendet.
      const dots = document.createElement("div");
      dots.className = "dots";
      const dot = (tag, c, label) => { const d = document.createElement(tag); d.className = "dot " + c; if (label) d.setAttribute("aria-label", label); dots.append(d); return d; };
      dot("span", "r");
      const set = off => { pre.classList.toggle("off", off); toggles.forEach(b => b.setAttribute("aria-expanded", !off)); };
      const toggles = ["y", "g"].map(c => dot("button", c, "Ein-/ausblenden"));
      toggles.forEach(b => b.onclick = e => { e.stopPropagation(); set(!pre.classList.contains("off")); });
      pre.onclick = () => pre.classList.contains("off") && set(false);
      pre.prepend(dots); set(stats);
    });
  })
  .catch(e => { document.getElementById("content").textContent = "Could not load README (" + e + ")."; });
