// Lädt beim Aufruf die aktuelle README, daher kein Build und kein Workflow nötig.
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const span = (c, s) => `<span class="${c}">${s}</span>`;

// Färbt eine Zeile Shell-Ausgabe; unbekannte Zeilen bleiben unverändert.
function color(line) {
  const l = esc(line);
  let m;
  if ((m = l.match(/^(\S+@\S+:\S*\$)( .*)$/))) return span("prompt", m[1]) + span("cmd", m[2]);
  if ((m = l.match(/^([A-Za-z ]+?) (\.+) (.*)$/))) return span("key", m[1]) + " " + span("dim", m[2]) + " " + m[3].replace(/[+-]?\d[\d.,]*[kKyYm]?/g, x => span(x[0] == "+" ? "add" : x[0] == "-" ? "del" : "num", x));
  if ((m = l.match(/^([0-9a-f]{7}) (.*)$/))) return span("hash", m[1]) + " " + m[2];
  if ((m = l.match(/^(\S+)(\s+-&gt;\s+)(.*)$/))) return span("key", m[1]) + span("dim", m[2]) + `<a href="https://${m[3]}">${m[3]}</a>`;
  return l.replace(/^●/, span("ok", "●")).replace(/\(running\)/, span("ok", "(running)")).replace(/"200 OK"/, span("ok", '"200 OK"'));
}

fetch("https://raw.githubusercontent.com/larknafets/larknafets/main/README.md")
  .then(r => r.ok ? r.text() : Promise.reject(r.status))
  .then(md => {
    const el = document.getElementById("content");
    el.innerHTML = DOMPurify.sanitize(marked.parse(md));
    el.querySelectorAll("pre code").forEach(c => { c.innerHTML = c.textContent.split("\n").map(color).join("\n"); });
  })
  .catch(e => { document.getElementById("content").textContent = "README konnte nicht geladen werden (" + e + ")."; });
