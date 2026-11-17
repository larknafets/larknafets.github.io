const ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = s => s.replace(/[&<>"]/g, ch => ENT[ch]);
const span = (c, s) => `<span class="${c}">${s}</span>`;
const DOTS = `<span class="dot r"></span><button class="dot y" tabindex="-1" aria-label="Toggle"></button><button class="dot g" aria-label="Toggle"></button>`;
const BASE = 15;
const PAGE = "https://github.com/larknafets/larknafets/blob/main/site/README.md";
let width = 0;

function color(line, nums, tone) {
  const l = esc(line);
  let m;
  if ((m = l.match(/^(\S+@\S+:\S*\$)( .*)$/))) return span("prompt", m[1]) + span("cmd", m[2]);
  if ((m = l.match(/^([\w -]+?) (\.+) (.*)$/))) return (nums && / commits$/.test(m[3]) ? `<a href="https://github.com/larknafets/${m[1]}" target="_blank" rel="noopener noreferrer">${m[1]}</a>` : span("key", m[1])) + " " + span("dim", m[2]) + " " + (nums ? m[3].replace(/[+-]?\d[\d.,]*[kKyYm]?/g, x => span(x[0] == "+" ? "add" : x[0] == "-" ? "del" : "num", x)) : m[3]);
  if ((m = l.match(/^([0-9a-f]{7}) (.*)$/))) return span("hash", m[1]) + " " + m[2];
  if ((m = l.match(/^(\S+)(\s+-&gt;\s+)(.*)$/))) return span("key", m[1]) + span("dim", m[2]) + `<a href="https://${m[3]}" target="_blank" rel="noopener noreferrer">${m[3]}</a>`;
  return l.replace(/^[●○]/, x => span(tone, x)).replace(/^(\s+(?:Active|Status): )(.*)$/, (_, k, v) => k + span(tone, v));
}

function setup(code) {
  const pre = code.parentNode, text = code.textContent, lines = text.split("\n"), stats = /\bgh stats\b/.test(text), tone = /\(dead\)/.test(text) ? "del" : /activating/.test(text) ? "num" : "ok";
  const dots = document.createElement("div");
  dots.className = "dots";
  dots.innerHTML = DOTS;
  const set = off => {
    pre.classList.toggle("off", off);
    dots.querySelectorAll("button").forEach(b => b.setAttribute("aria-expanded", !off));
  };
  pre.dataset.cmd = lines[0];
  pre.id = (lines[0].match(/~\/(\w+)|\b(neofetch|log|stats|status)\b/) || []).slice(1).find(Boolean) || "";
  let log = false;
  code.innerHTML = lines.map(l => (log = /^\w+\[\d+\]: /.test(l) || (log && /^\s/.test(l))) ? span("log", esc(l)) : color(l, stats, tone)).join("\n");
  pre.prepend(dots);
  pre.addEventListener("click", e => {
    const off = pre.classList.contains("off");
    if (off || e.target.closest("button")) set(!off);
  });
  set(stats);
}

function fit() {
  width = innerWidth;
  const pres = [...document.querySelectorAll("pre")];
  if (!pres.length) return;
  const folded = pres.filter(p => p.classList.contains("off"));
  folded.forEach(p => p.classList.remove("off"));
  document.body.style.fontSize = BASE + "px";
  const cs = getComputedStyle(pres[0]), room = pres[0].clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const need = Math.max(...pres.map(p => p.querySelector("code").getBoundingClientRect().width));
  if (need > room) document.body.style.fontSize = BASE * room / need * 0.98 + "px";
  folded.forEach(p => p.classList.add("off"));
}

fetch("https://raw.githubusercontent.com/larknafets/larknafets/main/site/README.md")
  .then(r => r.ok ? r.text() : Promise.reject(r.status))
  .then(md => {
    const el = document.getElementById("content");
    el.innerHTML = DOMPurify.sanitize(marked.parse(md));
    el.querySelectorAll("pre code").forEach(setup);
    fit();
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    document.fonts.addEventListener("loadingdone", fit);
    addEventListener("resize", () => { if (innerWidth !== width) fit(); });
  })
  .catch(e => { document.getElementById("content").innerHTML = `Could not load README (${esc(String(e))}). <a href="${PAGE}">Read it on GitHub</a>.`; });
