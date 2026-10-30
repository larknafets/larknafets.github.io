const ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = s => s.replace(/[&<>"]/g, ch => ENT[ch]);
const span = (c, s) => `<span class="${c}">${s}</span>`;
const DOTS = `<span class="dot r"></span>` + ["y", "g"].map(c => `<button class="dot ${c}" aria-label="Ein-/ausblenden"></button>`).join("");

function color(line, nums) {
  const l = esc(line);
  let m;
  if ((m = l.match(/^(\S+@\S+:\S*\$)( .*)$/))) return span("prompt", m[1]) + span("cmd", m[2]);
  if ((m = l.match(/^([\w -]+?) (\.+) (.*)$/))) return span("key", m[1]) + " " + span("dim", m[2]) + " " + (nums ? m[3].replace(/[+-]?\d[\d.,]*[kKyYm]?/g, x => span(x[0] == "+" ? "add" : x[0] == "-" ? "del" : "num", x)) : m[3]);
  if ((m = l.match(/^([0-9a-f]{7}) (.*)$/))) return span("hash", m[1]) + " " + m[2];
  if ((m = l.match(/^(\S+)(\s+-&gt;\s+)(.*)$/))) return span("key", m[1]) + span("dim", m[2]) + `<a href="https://${m[3]}" target="_blank" rel="noopener noreferrer">${m[3]}</a>`;
  return l.replace(/^●/, span("ok", "●")).replace(/\(running\)/, span("ok", "(running)")).replace(/&quot;200 OK&quot;/, span("ok", "&quot;200 OK&quot;"));
}

function setup(code) {
  const pre = code.parentNode, text = code.textContent, lines = text.split("\n"), stats = /\bgh stats\b/.test(text);
  const dots = document.createElement("div");
  dots.className = "dots";
  dots.innerHTML = DOTS;
  const set = off => {
    pre.classList.toggle("off", off);
    dots.querySelectorAll("button").forEach(b => b.setAttribute("aria-expanded", !off));
  };
  pre.dataset.cmd = lines[0];
  code.innerHTML = lines.map(l => color(l, stats)).join("\n");
  pre.prepend(dots);
  pre.addEventListener("click", e => {
    const off = pre.classList.contains("off");
    if (off || e.target.closest("button")) set(!off);
  });
  set(stats);
}

fetch("https://raw.githubusercontent.com/larknafets/larknafets/main/site/README.md")
  .then(r => r.ok ? r.text() : Promise.reject(r.status))
  .then(md => {
    const el = document.getElementById("content");
    el.innerHTML = DOMPurify.sanitize(marked.parse(md));
    el.querySelectorAll("pre code").forEach(setup);
  })
  .catch(e => { document.getElementById("content").textContent = "Could not load README (" + e + ")."; });
