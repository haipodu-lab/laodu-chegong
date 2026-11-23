import * as C from "./calc.js";
import { CRAFTS, buildCraft, programFor, profilePoints, drawSegmentsSVG } from "./crafts.js";
import { toolFace, toolIcon, toolNames } from "./tools.js";

const FAV_KEY = "laodu.favorites";
const NOTE_KEY = "laodu.notes";
const MODULES = [
  ["arc", "圆弧接点"], ["thread", "各种螺纹"], ["macro", "宏程序"], ["angle", "角度计算"],
  ["tol", "公差等级"], ["across", "对角计算"], ["weight", "材料重量"], ["gcode", "常用代码"],
  ["threads", "螺纹对照表"], ["trig", "三角函数表"], ["misc", "其他计算"], ["notes", "工艺品"],
  ["groove", "各种槽"], ["tri", "解三角形"], ["sim", "宏转G模拟"], ["lab", "切削参数"],
];
const memory = {};
let cutting = null;
let favs = loadSet(FAV_KEY);

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return new Set(); }
}
function saveFavs() { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); }
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTE_KEY) || "[]"); }
  catch { return []; }
}
function saveNotes(notes) { localStorage.setItem(NOTE_KEY, JSON.stringify(notes)); }
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function fmt(value, digits = 3) {
  if (value == null || !Number.isFinite(value)) return "—";
  return Number(value).toFixed(digits);
}
function num(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const text = el.value.replace(/，/g, ".").replace(/,/g, ".").trim();
  return text === "" ? NaN : Number(text);
}
function field(id, label, unit, value) {
  return `<label class="field"><span>${esc(label)}</span><input id="${id}" inputmode="decimal" value="${esc(value)}"><em>${esc(unit)}</em></label>`;
}
function icon(name) {
  const paths = {
    arc: '<circle cx="12" cy="12" r="7"/><path d="M5 19l4-4"/>',
    thread: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    macro: '<path d="M8 5c-3 2-3 12 0 14M16 5c3 2 3 12 0 14"/>',
    angle: '<path d="M5 19V7M5 19h12M5 19l9-9"/>',
    tol: '<path d="M5 12h14M12 5v4M12 15v4M8 8h8M8 16h8"/>',
    hex: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/>',
    cube: '<path d="M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8M12 12v8"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M10 10v9"/>',
    trig: '<path d="M4 16c2-6 4-6 6 0s4 6 6 0 4-6 4 0"/>',
    misc: '<circle cx="12" cy="12" r="8"/><path d="M12 12l5-2M12 6v2"/>',
    notes: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
    groove: '<rect x="3" y="8" width="18" height="8"/><path d="M12 8v8"/>',
    tri: '<path d="M5 19h14L12 5z"/>',
    sim: '<path d="M3 16c3-8 5 2 8-6s4 4 10-2"/>',
    lab: '<path d="M9 3h6M10 3v6L6 20h12l-4-11V3"/>',
  };
  return `<span class="glyph"><svg viewBox="0 0 24 24">${paths[name] || paths.arc}</svg></span>`;
}
const ICONS = { arc: "arc", thread: "thread", macro: "macro", angle: "angle", tol: "tol", across: "hex", weight: "cube", gcode: "code", threads: "table", trig: "trig", misc: "misc", notes: "notes", groove: "groove", tri: "tri", sim: "sim", lab: "lab" };

function homeHTML() {
  const tiles = MODULES.map(([id, title]) => `
    <a class="tile" href="#/m/${id}">
      ${favs.has(id) ? '<span class="star" aria-hidden="true">★</span>' : ""}
      ${icon(ICONS[id])}
      <span>${esc(title)}</span>
    </a>`).join("");
  return `<header class="home-head"><h1>老杜车工</h1><p class="sub">离线车床计算</p></header><div class="home-grid">${tiles}</div>`;
}

function mineHTML() {
  const saved = MODULES.filter(([id]) => favs.has(id));
  const list = saved.length
    ? saved.map(([id, title]) => `<a class="item" href="#/m/${id}"><b>${esc(title)}</b></a>`).join("")
    : `<p class="empty">在计算页右上角点星标，就会出现在这里。</p>`;
  return `<div class="page"><header class="page-head"><h1>我的</h1></header>
    <section class="card"><h2 style="margin:0 0 6px">老杜车工</h2><p class="muted">版本 1.0.0 · 网页版</p><p>给车床和数控车工用的离线计算本。不登录，不联网，没有广告。</p></section>
    <section class="card"><h2 style="margin:0 0 6px">使用前</h2><p>所有直径、牙高、公差和切削用量都是参考值。编程之前对照图纸、量具和机床说明书，首件必须实测。</p></section>
    <section class="card"><h2 style="margin:0 0 6px">收藏</h2>${list}</section>
    <section class="card"><a class="item" href="#/mine/notes"><b>我的工艺笔记</b><div class="muted">材料、刀具和转速记在这台设备上</div></a></section>
    <section class="card"><p class="note">${esc(C.standardsSummary)}</p></section>
    <p class="note">用 Safari 打开后，点分享，再点「添加到主屏幕」，就会像一个 App 一样从桌面启动，之后可以离线使用。</p></div>`;
}

function page(id, title, body, note) {
  const star = favs.has(id) ? "★" : "☆";
  return `<div class="page"><header class="page-head"><a href="#/" class="btn sec">返回</a><h1>${esc(title)}</h1><button class="btn sec" id="fav" type="button">${star}</button></header>${body}<p class="note">${note}</p></div>`;
}
function bindFav(id) {
  document.getElementById("fav")?.addEventListener("click", () => {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    saveFavs();
    route();
  });
}

function screenArc() {
  const s = memory.arc || (memory.arc = { mode: "ext", d: "50", r: "5", a: "0", small: "30", x1: "20", z1: "-10", x2: "20", z2: "10", cx: "40", cz: "0", cr: "10", c2x: "40", c2z: "16", c2r: "10" });
  const modes = [["ext", "凸圆角"], ["int", "凹圆角"], ["line", "直线交圆"], ["two", "两圆相交"]];
  return page("arc", "圆弧接点", `<div class="seg">${modes.map(([id, label]) => `<button type="button" data-mode="${id}" class="${s.mode === id ? "on" : ""}">${label}</button>`).join("")}</div><div class="split"><section class="card" id="inputs"></section><section class="card" id="out"></section></div>`, "X 为直径，Z 为轴向。尖点放在直径 D、Z=0，零件在 Z≤0。凸圆角的锥面朝小端，凹圆角是轴肩。α 是母线与轴线的夹角。");
}
function bindArc() {
  bindFav("arc");
  const s = memory.arc;
  const draw = () => {
    document.querySelectorAll("[data-mode]").forEach((btn) => btn.classList.toggle("on", btn.dataset.mode === s.mode));
    const box = document.getElementById("inputs");
    if (s.mode === "ext" || s.mode === "int") {
      box.innerHTML = field("d", "尖点直径 D", "mm", s.d) + field("r", "圆角 R", "mm", s.r) + field("a", "锥面半角 α", "°", s.a) + (s.mode === "int" ? field("small", "小径 d", "mm", s.small) : "");
    } else if (s.mode === "line") {
      box.innerHTML = field("x1", "直线点1 X", "mm", s.x1) + field("z1", "直线点1 Z", "mm", s.z1) + field("x2", "直线点2 X", "mm", s.x2) + field("z2", "直线点2 Z", "mm", s.z2) + field("cx", "圆心 X", "mm", s.cx) + field("cz", "圆心 Z", "mm", s.cz) + field("cr", "半径 R", "mm", s.cr);
    } else {
      box.innerHTML = field("cx", "圆1圆心 X", "mm", s.cx) + field("cz", "圆1圆心 Z", "mm", s.cz) + field("cr", "圆1半径", "mm", s.cr) + field("c2x", "圆2圆心 X", "mm", s.c2x) + field("c2z", "圆2圆心 Z", "mm", s.c2z) + field("c2r", "圆2半径", "mm", s.c2r);
    }
    box.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => { s[input.id] = input.value; paint(); }));
    paint();
  };
  const paint = () => {
    const out = document.getElementById("out");
    if (s.mode === "ext" || s.mode === "int") {
      const fillet = s.mode === "ext" ? C.externalFillet(num("d"), num("r"), num("a")) : C.internalFillet(num("d"), num("r"), num("a"), 0, num("small"));
      out.innerHTML = fillet ? `${sketchFillet(fillet)}<div class="rowline"><span>端面切点 X / Z</span><b>${fmt(fillet.face.x)} / ${fmt(fillet.face.z)}</b></div><div class="rowline"><span>表面切点 X / Z</span><b>${fmt(fillet.surface.x)} / ${fmt(fillet.surface.z)}</b></div><div class="rowline"><span>圆心 X / Z</span><b>${fmt(fillet.center.x)} / ${fmt(fillet.center.z)}</b></div><p class="muted">${esc(fillet.note)}</p>` : `<p class="empty">直径和半径要大于 0，半角小于 89°。</p>`;
    } else if (s.mode === "line") {
      const pts = C.lineCircleIntersections(num("x1"), num("z1"), num("x2"), num("z2"), num("cx"), num("cz"), num("cr"));
      out.innerHTML = pts.length ? pts.map((p, i) => `<div class="rowline"><span>交点 ${i + 1}</span><b>${fmt(p.x)} / ${fmt(p.z)}</b></div>`).join("") : `<p class="empty">没有交点。</p>`;
    } else {
      const pts = C.circleIntersections(num("cx"), num("cz"), num("cr"), num("c2x"), num("c2z"), num("c2r"));
      out.innerHTML = pts.length ? pts.map((p, i) => `<div class="rowline"><span>交点 ${i + 1}</span><b>${fmt(p.x)} / ${fmt(p.z)}</b></div>`).join("") : `<p class="empty">没有交点。</p>`;
    }
  };
  document.querySelectorAll("[data-mode]").forEach((btn) => btn.addEventListener("click", () => { s.mode = btn.dataset.mode; draw(); }));
  draw();
}
function sketchFillet(fillet) {
  const pts = [fillet.face, fillet.surface, fillet.center];
  const zs = pts.map((p) => p.z), xs = pts.map((p) => p.x / 2);
  const minZ = Math.min(...zs) - 4, maxZ = Math.max(...zs) + 4, minX = Math.min(0, ...xs) - 4, maxX = Math.max(...xs) + 4;
  const map = (x, z) => [12 + ((z - minZ) / (maxZ - minZ)) * 300, 160 - ((x - minX) / (maxX - minX)) * 140];
  const f = map(fillet.face.x / 2, fillet.face.z), sf = map(fillet.surface.x / 2, fillet.surface.z), c = map(fillet.center.x / 2, fillet.center.z);
  const rad = Math.hypot(f[0] - c[0], f[1] - c[1]);
  return `<svg class="sketch" viewBox="0 0 320 180"><line x1="12" y1="${map(0, minZ)[1]}" x2="308" y2="${map(0, maxZ)[1]}" stroke="#c8bfb4" /><line x1="${f[0]}" y1="${f[1]}" x2="${sf[0]}" y2="${sf[1]}" stroke="#1c1714" stroke-dasharray="4 3"/><circle cx="${c[0]}" cy="${c[1]}" r="${rad}" fill="none" stroke="#b8432f" stroke-width="2"/><circle cx="${f[0]}" cy="${f[1]}" r="3.5" fill="#b8432f"/><circle cx="${sf[0]}" cy="${sf[1]}" r="3.5" fill="#b8432f"/></svg>`;
}

function screenThread() {
  memory.thread ||= { kind: "coarse", index: 17, major: "20", pitch: "2.5", starts: 1, passes: 8 };
  return page("thread", "各种螺纹", `<div class="split"><section class="card" id="inputs"></section><section class="card" id="out"></section></div>`, "米制牙高按 ISO 68-1：外螺纹进刀用 17H/24。G76 的牙高按半径。递减切深使每刀切削面积接近。攻丝底孔 d−P 是车间常用值。");
}
function bindThread() {
  bindFav("thread");
  const s = memory.thread;
  const kinds = [["coarse", "粗牙"], ["fine", "细牙"], ["custom", "自定义"], ["un", "英制"], ["g", "G"], ["npt", "NPT"], ["tr", "梯形"], ["worm", "蜗杆"]];
  const draw = () => {
    const list = s.kind === "coarse" ? C.metricCoarse : s.kind === "fine" ? C.metricFine : s.kind === "un" ? C.unc : s.kind === "g" ? C.pipeG : s.kind === "npt" ? C.npt : [];
    const options = list.map((item, i) => `<option value="${i}" ${i === s.index ? "selected" : ""}>${esc(item.label || item.designation || ("NPT " + item.designation))}</option>`).join("");
    document.getElementById("inputs").innerHTML = `<div class="seg">${kinds.map(([id, label]) => `<button type="button" data-k="${id}" class="${s.kind === id ? "on" : ""}">${label}</button>`).join("")}</div>`
      + (options ? `<label class="field"><span>规格</span><select id="spec">${options}</select><em></em></label>` : "")
      + (["custom", "tr", "worm"].includes(s.kind) ? field("major", s.kind === "worm" ? "模数 m" : "大径", "mm", s.major) + field("pitch", s.kind === "worm" ? "分度圆" : "螺距", "mm", s.pitch) : "")
      + `<label class="field"><span>头数</span><input id="starts" inputmode="decimal" value="${s.starts}"><em></em></label>`
      + (s.kind === "worm" ? "" : `<label class="field"><span>走刀次数</span><input id="passes" inputmode="decimal" value="${s.passes}"><em>刀</em></label>`);
    document.querySelectorAll("[data-k]").forEach((btn) => btn.addEventListener("click", () => { s.kind = btn.dataset.k; s.index = s.kind === "coarse" ? 17 : 0; draw(); }));
    document.getElementById("inputs").querySelectorAll("input,select").forEach((el) => el.addEventListener("input", () => {
      if (el.id === "spec") s.index = Number(el.value);
      else s[el.id] = el.id === "starts" || el.id === "passes" ? Number(el.value) : el.value;
      paint();
    }));
    paint();
  };
  const paint = () => {
    let profile = null, trap = null, worm = null;
    const starts = Number(s.starts) || 1;
    if (s.kind === "coarse") profile = C.metricThread(C.metricCoarse[s.index].diameter, C.metricCoarse[s.index].pitch, starts);
    else if (s.kind === "fine") profile = C.metricThread(C.metricFine[s.index].diameter, C.metricFine[s.index].pitch, starts);
    else if (s.kind === "custom") profile = C.metricThread(num("major"), num("pitch"), starts);
    else if (s.kind === "un") { const item = C.unc[s.index]; profile = C.unifiedThread(item.majorMM, item.tpi, starts); }
    else if (s.kind === "g") { const item = C.pipeG[s.index]; profile = C.whitworth(item.major, item.pitch, item.designation); if (profile) profile.tapDrill = item.commonTapDrill; }
    else if (s.kind === "npt") {
      const item = C.npt[s.index];
      profile = { name: `NPT ${item.designation}`, pitch: item.pitchInch * 25.4, major: item.majorAtEndInch * 25.4, pitchDiameter: item.pitchDiameterAtEndInch * 25.4, basicMinor: item.minorAtEndInch * 25.4, externalMinor: item.minorAtEndInch * 25.4, externalHeight: item.threadHeightInch * 25.4, internalHeight: item.threadHeightInch * 25.4, leadAngleDeg: C.metricThread(item.majorAtEndInch * 25.4, item.pitchInch * 25.4)?.leadAngleDeg || 0, tapDrill: null, note: `ASME B1.20.1。手拧平面中径 ${fmt(item.pitchDiameterAtHandTightInch * 25.4)} mm，有效螺纹长 ${fmt(item.effectiveLengthInch * 25.4)} mm。锥度 1:16。` };
    } else if (s.kind === "tr") trap = C.trapezoidal(num("major"), num("pitch"));
    else worm = C.worm(num("major"), starts, num("pitch"));
    const lines = [];
    const height = profile?.externalHeight ?? trap?.externalHeight;
    const pitch = profile?.pitch ?? trap?.pitch;
    if (profile) {
      lines.push(`<h2 style="margin:0 0 8px">${esc(profile.name)}</h2>`, row("螺距", fmt(profile.pitch)), row("大径", fmt(profile.major)), row("中径", fmt(profile.pitchDiameter, 4)), row("基本小径", fmt(profile.basicMinor, 4)), row("外螺纹牙高（半径）", fmt(profile.externalHeight, 4)), row("升角", `${fmt(profile.leadAngleDeg)}°`));
      if (profile.tapDrill) lines.push(row("推荐底孔", fmt(profile.tapDrill)));
      lines.push(`<p class="muted">${esc(profile.note)}</p>`);
    }
    if (trap) lines.push(row("间隙 ac", fmt(trap.clearance)), row("中径", fmt(trap.pitchDiameter)), row("外螺纹小径", fmt(trap.externalMinor)), row("内螺纹小径", fmt(trap.internalMinor)));
    if (worm) lines.push(row("齿顶圆", fmt(worm.tipDiameter)), row("齿根圆", fmt(worm.rootDiameter)), row("全齿高", fmt(worm.toothHeight)), row("导程角", `${fmt(worm.leadAngleDeg)}°`));
    if (!profile && !trap && !worm) lines.push(`<p class="empty">这个螺距不在标准间隙表里，或数值无效。</p>`);
    if (height && pitch) {
      const passes = C.infeedPasses(height, Math.max(1, Number(s.passes) || 1));
      lines.push(`<p class="muted">建议 ${C.recommendedPasses(pitch)} 刀。直径编程时 X 切深是半径的两倍。</p>`);
      passes.forEach((pass) => lines.push(row(`第 ${pass.index} 刀 Δ / 累计`, `${fmt(pass.incrementalRadius, 4)} / ${fmt(pass.cumulativeRadius, 4)}`)));
    }
    document.getElementById("out").innerHTML = lines.join("");
  };
  const row = (k, v) => `<div class="rowline"><span>${k}</span><b>${v}</b></div>`;
  draw();
}

function screenSimple(id, title, note, html, bind) {
  return { html: () => page(id, title, html(), note), bind };
}

const screens = {
  arc: { html: screenArc, bind: bindArc },
  thread: { html: screenThread, bind: bindThread },
  macro: {
    html: () => page("macro", "宏程序", `<div class="split"><section class="card" id="inputs"></section><section class="card" id="out"></section></div>`, "生成可粘贴的宏。华中用 ENDW，FANUC 用 END1。步距太小会让展开步数过多，先空跑。"),
    bind() {
      bindFav("macro");
      memory.macro ||= { kind: "ellipse", dialect: "fanuc", a: "20", b: "10", step: "0.2", extra: "90" };
      const s = memory.macro;
      const draw = () => {
        document.getElementById("inputs").innerHTML = `<div class="seg">${[["ellipse", "椭圆"], ["parabola", "抛物线"], ["sphere", "球面"], ["spiral", "螺旋"]].map(([id, label]) => `<button type="button" data-k="${id}" class="${s.kind === id ? "on" : ""}">${label}</button>`).join("")}</div><div class="seg"><button type="button" data-d="fanuc" class="${s.dialect === "fanuc" ? "on" : ""}">FANUC</button><button type="button" data-d="huazhong" class="${s.dialect === "huazhong" ? "on" : ""}">华中</button></div>`
          + field("a", s.kind === "parabola" ? "焦距 p" : s.kind === "spiral" ? "起始直径" : s.kind === "sphere" ? "球半径" : "Z 向半轴 A", "mm", s.a)
          + field("b", s.kind === "spiral" ? "结束直径" : s.kind === "sphere" ? "起始角" : s.kind === "parabola" ? "起始 Z" : "半径半轴 B", s.kind === "sphere" ? "°" : "mm", s.b)
          + field("extra", s.kind === "spiral" ? "圈数" : s.kind === "sphere" ? "终止角" : "结束 Z", "", s.extra)
          + field("step", "步距", s.kind === "sphere" ? "°" : "mm", s.step);
        document.querySelectorAll("[data-k]").forEach((btn) => btn.addEventListener("click", () => { s.kind = btn.dataset.k; draw(); }));
        document.querySelectorAll("[data-d]").forEach((btn) => btn.addEventListener("click", () => { s.dialect = btn.dataset.d; draw(); }));
        document.querySelectorAll("#inputs input").forEach((el) => el.addEventListener("input", () => { s[el.id] = el.value; paint(); }));
        paint();
      };
      const paint = () => {
        let code = "";
        if (s.kind === "ellipse") code = C.macroEllipse(num("a"), num("b"), num("step"), s.dialect);
        else if (s.kind === "parabola") code = C.macroParabola(num("a"), num("b"), num("extra"), num("step"), s.dialect);
        else if (s.kind === "sphere") code = C.macroSphere(num("a"), num("b"), num("extra"), num("step"), s.dialect);
        else code = C.macroSpiral(num("a"), num("b"), num("step"), num("extra"), s.dialect);
        document.getElementById("out").innerHTML = `<pre class="code">${esc(code)}</pre><button class="btn" id="copy" type="button">复制</button>`;
        document.getElementById("copy").onclick = () => copyText(code);
      };
      draw();
    },
  },
  angle: {
    html: () => page("angle", "角度计算", `<div class="split"><section class="card">${field("D", "大端 D", "mm", "50")}${field("d", "小端 d", "mm", "40")}${field("L", "长度 L", "mm", "100")}<div id="out1"></div></section><section class="card">${field("dec", "十进制角度", "°", "5.5")}<div id="out2"></div>${field("deg", "度", "°", "5")}${field("min", "分", "′", "30")}${field("sec", "秒", "″", "0")}<div id="out3"></div></section></div>`, "锥度 K=(D−d)/L，半角 α=arctan((D−d)/(2L))。"),
    bind() { bindFav("angle"); const go = () => {
      const t = C.taper(num("D"), num("d"), num("L"));
      document.getElementById("out1").innerHTML = t ? `<div class="rowline"><span>半角</span><b>${fmt(t.halfAngleDeg, 4)}°</b></div><div class="rowline"><span>锥度</span><b>${t.unitRatio === Infinity ? "圆柱" : "1:" + fmt(t.unitRatio)}</b></div>` : `<p class="empty">大端不能小于小端。</p>`;
      const dms = C.decimalToDMS(num("dec") || 0);
      document.getElementById("out2").innerHTML = `<div class="rowline"><span>度分秒</span><b>${dms.sign < 0 ? "-" : ""}${dms.degrees}° ${dms.minutes}′ ${fmt(dms.seconds, 2)}″</b></div>`;
      document.getElementById("out3").innerHTML = `<div class="rowline"><span>十进制</span><b>${fmt(C.dmsToDecimal(1, num("deg") || 0, num("min") || 0, num("sec") || 0), 6)}°</b></div>`;
    }; document.querySelectorAll("input").forEach((el) => el.addEventListener("input", go)); go(); },
  },
  tol: {
    html: () => page("tol", "公差等级", `<div class="split"><section class="card">${field("dia", "公称直径", "mm", "50")}<div class="seg"><button type="button" data-f="hole" class="on">孔</button><button type="button" data-f="shaft">轴</button></div><label class="field"><span>代号</span><select id="letter"></select><em></em></label><label class="field"><span>等级</span><select id="grade">${[5, 6, 7, 8, 9, 10, 11].map((g) => `<option ${g === 7 ? "selected" : ""}>IT${g}</option>`).join("")}</select><em></em></label></section><section class="card" id="out"></section></div>`, "ISO 286-1 / GB/T 1800.1，到 500 mm，IT5–IT11。js 奇数公差按 ±IT/2。"),
    bind() {
      bindFav("tol");
      let feature = "hole";
      const fill = () => {
        const letters = feature === "hole" ? C.holeLetters : C.shaftLetters;
        document.getElementById("letter").innerHTML = letters.map((letter) => `<option ${letter === (feature === "hole" ? "H" : "h") ? "selected" : ""}>${letter}</option>`).join("");
      };
      const go = () => {
        const grade = Number(document.getElementById("grade").value.replace("IT", ""));
        const zone = C.isoZone(num("dia"), feature, document.getElementById("letter").value, grade);
        const sign = (v) => v > 0 ? `+${fmt(v, 4)}` : fmt(v, 4);
        document.getElementById("out").innerHTML = zone.error ? `<p class="empty">${esc(zone.error)}</p>` : `<h2 style="margin:0 0 8px">${feature === "hole" ? "孔" : "轴"} ${fmt(zone.nominal, 1)} ${zone.letter}${zone.grade}</h2><div class="rowline"><span>上偏差</span><b>${sign(zone.upper)}</b></div><div class="rowline"><span>下偏差</span><b>${sign(zone.lower)}</b></div><div class="rowline"><span>最大 / 最小</span><b>${fmt(zone.maximum, 4)} / ${fmt(zone.minimum, 4)}</b></div><div class="rowline"><span>公差</span><b>${zone.itMicrometres} μm</b></div>`;
      };
      fill();
      document.querySelectorAll("[data-f]").forEach((btn) => btn.addEventListener("click", () => {
        feature = btn.dataset.f;
        document.querySelectorAll("[data-f]").forEach((b) => b.classList.toggle("on", b === btn));
        fill(); go();
      }));
      document.getElementById("dia").addEventListener("input", go);
      document.getElementById("letter").addEventListener("change", go);
      document.getElementById("grade").addEventListener("change", go);
      go();
    },
  },
  across: {
    html: () => page("across", "对角计算", `<section class="card"><div class="seg"><button data-k="hex" class="on" type="button">六角</button><button data-k="sq" type="button">四方</button><button data-k="poly" type="button">多边形</button></div>${field("flats", "对边", "mm", "24")}<div id="out"></div>${field("sides", "边数", "边", "6")}</section>`, "正六角对角 = 对边 × 2/√3。正四方对角 = 对边 × √2。"),
    bind() {
      bindFav("across");
      let kind = "hex";
      const go = () => {
        const flats = num("flats"), sides = num("sides");
        let html = "";
        if (kind === "hex") html = `<div class="rowline"><span>对角</span><b>${fmt(C.hexagonCorners(flats))}</b></div>`;
        else if (kind === "sq") html = `<div class="rowline"><span>对角</span><b>${fmt(C.squareCorners(flats))}</b></div>`;
        else {
          const poly = C.polygonFromFlats(sides, flats);
          html = poly ? `<div class="rowline"><span>对角 / 边长</span><b>${fmt(poly.acrossCorners)} / ${fmt(poly.sideLength)}</b></div>` : `<p class="empty">偶数边才有平行对边。</p>`;
        }
        document.getElementById("out").innerHTML = html;
      };
      document.querySelectorAll("[data-k]").forEach((btn) => btn.addEventListener("click", () => { kind = btn.dataset.k; document.querySelectorAll("[data-k]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      document.querySelectorAll("input").forEach((el) => el.addEventListener("input", go));
      go();
    },
  },
  weight: {
    html: () => page("weight", "材料重量", `<div class="split"><section class="card"><div class="seg" id="shapes"><button data-k="round" class="on" type="button">圆棒</button><button data-k="tube" type="button">管</button><button data-k="hex" type="button">六角</button><button data-k="square" type="button">方</button><button data-k="plate" type="button">板</button></div><label class="field"><span>材料</span><select id="mat">${C.materials.map((m) => `<option value="${m.id}">${esc(m.name)} ${m.density}</option>`).join("")}</select><em>g/cm³</em></label><div id="dims"></div></section><section class="card" id="out"></section></div>`, "密度是 20°C 附近的估重值。尺寸按毫米，重量是千克。"),
    bind() {
      bindFav("weight");
      let kind = "round";
      const dims = () => {
        if (kind === "tube") return field("a", "外径", "mm", "50") + field("b", "内径", "mm", "40") + field("l", "长度", "mm", "1000");
        if (kind === "plate") return field("a", "厚", "mm", "10") + field("b", "宽", "mm", "100") + field("l", "长", "mm", "200");
        return field("a", kind === "hex" ? "对边" : kind === "square" ? "边长" : "直径", "mm", "50") + field("l", "长度", "mm", "1000");
      };
      const go = () => {
        const mat = C.materials.find((m) => m.id === document.getElementById("mat").value);
        const shape = { kind, d: num("a"), outer: num("a"), inner: num("b"), s: num("a"), side: num("a"), t: num("a"), w: num("b"), l: num("l") };
        const kg = C.kilograms(shape, mat.density);
        document.getElementById("out").innerHTML = kg == null ? `<p class="empty">尺寸要为正数。管的内径要小于外径。</p>` : `<div class="rowline"><span>重量</span><b>${fmt(kg)} kg</b></div><p class="muted">${esc(mat.source)}</p>`;
      };
      const rebuild = () => { document.getElementById("dims").innerHTML = dims(); document.querySelectorAll("#dims input").forEach((el) => el.addEventListener("input", go)); go(); };
      document.querySelectorAll("#shapes button").forEach((btn) => btn.addEventListener("click", () => { kind = btn.dataset.k; document.querySelectorAll("#shapes button").forEach((b) => b.classList.toggle("on", b === btn)); rebuild(); }));
      document.getElementById("mat").addEventListener("change", go);
      rebuild();
    },
  },
  gcode: {
    html: () => page("gcode", "常用代码", `<div class="seg"><button data-s="FANUC" class="on" type="button">FANUC</button><button data-s="华中" type="button">华中</button></div><div class="seg"><button data-k="G" class="on" type="button">G</button><button data-k="M" type="button">M</button></div><input class="block" id="q" placeholder="搜索代码或说明" style="width:100%;margin-bottom:10px"><div class="lab-layout"><section class="card list" id="list"></section><section class="card" id="out"></section></div>`, "FANUC 按系统 A。华中的 G80/G81/G82 对应 FANUC 的 G90/G94/G92，G92 在华中多半是坐标系。"),
    bind() {
      bindFav("gcode");
      let system = "FANUC", kind = "G", current = null;
      const go = () => {
        const rows = C.filterGCode(system, kind, document.getElementById("q").value);
        document.getElementById("list").innerHTML = rows.map((item) => `<div class="item"><button class="link" data-id="${item.id}" type="button"><b>${esc(item.code)}</b> ${esc(item.title)}</button></div>`).join("") || `<p class="empty">没有匹配的代码。</p>`;
        document.querySelectorAll("[data-id]").forEach((btn) => btn.addEventListener("click", () => { current = rows.find((item) => item.id === btn.dataset.id); show(); }));
        if (!current || !rows.includes(current)) current = rows[0];
        show();
      };
      const show = () => { document.getElementById("out").innerHTML = current ? `<h2 style="margin:0 0 8px">${esc(current.code)} ${esc(current.title)}</h2><p>${esc(current.detail || "—")}</p>` : ""; };
      document.querySelectorAll("[data-s]").forEach((btn) => btn.addEventListener("click", () => { system = btn.dataset.s; document.querySelectorAll("[data-s]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      document.querySelectorAll("[data-k]").forEach((btn) => btn.addEventListener("click", () => { kind = btn.dataset.k; document.querySelectorAll("[data-k]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      document.getElementById("q").addEventListener("input", go);
      go();
    },
  },
  threads: {
    html: () => page("threads", "螺纹对照表", `<div class="seg"><button data-k="coarse" class="on" type="button">粗牙</button><button data-k="fine" type="button">细牙</button><button data-k="un" type="button">UN</button><button data-k="g" type="button">G</button><button data-k="npt" type="button">NPT</button></div><div id="out"></div>`, "米制底孔按 d−P。G 的常用钻头大于基本小径。NPT 小径是小端基本小径。"),
    bind() {
      bindFav("threads");
      let kind = "coarse";
      const go = () => {
        let html = "";
        if (kind === "coarse" || kind === "fine") {
          html = (kind === "coarse" ? C.metricCoarse : C.metricFine).map((size) => {
            const p = C.metricThread(size.diameter, size.pitch);
            return `<div class="rowline"><span>${esc(size.label)}</span><b>中径 ${fmt(p.pitchDiameter)} · 底孔 ${fmt(p.tapDrill, 2)}</b></div>`;
          }).join("");
        } else if (kind === "un") {
          html = C.unc.concat(C.unf).map((size) => {
            const p = C.unifiedThread(size.majorMM, size.tpi);
            return `<div class="rowline"><span>${esc(size.label)}</span><b>${fmt(p.pitchDiameter)} / 底孔 ${fmt(p.tapDrill)}</b></div>`;
          }).join("");
        } else if (kind === "g") {
          html = C.pipeG.map((pipe) => `<div class="rowline"><span>${esc(pipe.designation)}</span><b>${fmt(pipe.major)} / ${fmt(pipe.pitchDiameter)} / ${fmt(pipe.minor)}</b></div>`).join("");
        } else {
          html = C.npt.map((size) => `<div class="rowline"><span>NPT ${esc(size.designation)}</span><b>小端小径 ${fmt(size.minorAtEndInch * 25.4)}</b></div>`).join("");
        }
        document.getElementById("out").innerHTML = `<section class="card">${html}</section>`;
      };
      document.querySelectorAll("[data-k]").forEach((btn) => btn.addEventListener("click", () => { kind = btn.dataset.k; document.querySelectorAll("[data-k]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      go();
    },
  },
  trig: {
    html: () => page("trig", "三角函数表", `<section class="card">${field("deg", "角度", "°", "30")}<div id="out"></div>${field("val", "数值", "", "0.5")}<div id="inv"></div></section><section class="card" id="table"></section>`, "角度用度。tan 90° 无定义。"),
    bind() {
      bindFav("trig");
      const go = () => {
        const v = C.forwardTrig(num("deg") || 0);
        document.getElementById("out").innerHTML = `<div class="rowline"><span>sin / cos / tan</span><b>${fmt(v.sin, 6)} / ${fmt(v.cos, 6)} / ${v.tan == null ? "无定义" : fmt(v.tan, 6)}</b></div>`;
        const x = num("val");
        document.getElementById("inv").innerHTML = `<div class="rowline"><span>arcsin / arccos / arctan</span><b>${C.arcSinDegrees(x) == null ? "—" : fmt(C.arcSinDegrees(x), 3)}° / ${C.arcCosDegrees(x) == null ? "—" : fmt(C.arcCosDegrees(x), 3)}° / ${fmt(C.arcTanDegrees(x || 0), 3)}°</b></div>`;
      };
      document.getElementById("table").innerHTML = C.trigTable().map((row) => `<div class="rowline"><span>${row.degrees}°</span><b>${fmt(row.values.sin, 4)} ${fmt(row.values.cos, 4)} ${row.values.tan == null ? "—" : fmt(row.values.tan, 4)}</b></div>`).join("");
      document.querySelectorAll("input").forEach((el) => el.addEventListener("input", go));
      go();
    },
  },
  misc: {
    html: () => page("misc", "其他计算", `<div class="split"><section class="card">${field("vc", "Vc", "m/min", "150")}${field("dia", "直径", "mm", "50")}<div id="rpm"></div>${field("f", "每转进给", "mm/r", "0.2")}${field("nose", "刀尖半径", "mm", "0.8")}<div id="feed"></div></section><section class="card">${field("len", "长度", "mm", "100")}<div id="time"></div><p class="muted">n = 1000·Vc/(π·D)。Ra ≈ f²/(32r)·1000，单位 μm。</p></section></div>`, "理论粗糙度只含刀尖残留，不含振动。时间按单程长度除以进给速度。"),
    bind() {
      bindFav("misc");
      const go = () => {
        const n = C.rpm(num("vc"), num("dia"));
        document.getElementById("rpm").innerHTML = n ? `<div class="rowline"><span>转速</span><b>${Math.round(n)} r/min</b></div>` : "";
        const feed = n ? C.feedPerMinute(num("f"), n) : null;
        const ra = C.roughnessRa(num("f"), num("nose"));
        document.getElementById("feed").innerHTML = `${feed ? `<div class="rowline"><span>进给速度</span><b>${fmt(feed, 1)} mm/min</b></div>` : ""}${ra ? `<div class="rowline"><span>理论 Ra</span><b>${fmt(ra)} μm</b></div>` : ""}`;
        const minutes = feed ? C.machiningMinutes(num("len"), feed) : null;
        document.getElementById("time").innerHTML = minutes ? `<div class="rowline"><span>单程</span><b>${fmt(minutes, 2)} min / ${fmt(minutes * 60, 1)} s</b></div>` : "";
      };
      document.querySelectorAll("input").forEach((el) => el.addEventListener("input", go));
      go();
    },
  },
  notes: {
    html: () => page("notes", "工艺品", `<div class="craft-grid" id="gallery"></div>`, "十种原创参数化零件。改直径或总长后，图形、关键点和程序一起变。"),
    bind() {
      bindFav("notes");
      document.getElementById("gallery").innerHTML = CRAFTS.map((craft) => {
        const model = buildCraft(craft.id, craft.defaults);
        return `<a class="craft-tile" href="#/m/notes/${craft.id}">${drawSegmentsSVG(model, 180, 120)}<b>${esc(craft.name)}</b></a>`;
      }).join("");
    },
  },
  groove: {
    html: () => page("groove", "各种槽", `<div class="split"><section class="card"><h2 style="margin-top:0">螺纹退刀槽</h2>${field("pitch", "螺距", "mm", "2.5")}${field("major", "公称直径", "mm", "20")}<div id="relief"></div></section><section class="card"><h2 style="margin-top:0">O 形圈</h2><label class="field"><span>线径</span><select id="cs">${C.oRingSections.map(([d]) => `<option value="${d}">${d}</option>`).join("")}</select><em>mm</em></label>${field("bore", "缸径或杆径", "mm", "50")}<div id="oring"></div></section></div><section class="card"><h2 style="margin-top:0">切槽分刀</h2>${field("outer", "外径", "mm", "40")}${field("bottom", "槽底径", "mm", "36")}${field("width", "槽宽", "mm", "4")}${field("tool", "刀宽", "mm", "3")}${field("step", "每刀半径切深", "mm", "0.5")}${field("feed", "进给", "mm/r", "0.08")}<pre class="code" id="prog"></pre></section>`, "退刀槽按 GB/T 3-1997。O 形圈槽宽取 GB/T 3452.3 常用值，槽深按静密封 20% 压缩率计算。"),
    bind() {
      bindFav("groove");
      const go = () => {
        const relief = C.threadRelief(num("pitch"));
        document.getElementById("relief").innerHTML = relief ? `<div class="rowline"><span>外槽宽 g2</span><b>${fmt(relief.externalWidthMax)}</b></div><div class="rowline"><span>槽底径</span><b>${fmt(num("major") - relief.externalDepthOnDiameter)}</b></div>` : `<p class="empty">这个螺距不在 GB/T 3 的常用表里。</p>`;
        const ring = C.oRing(Number(document.getElementById("cs").value), num("bore"), false);
        document.getElementById("oring").innerHTML = ring ? `<div class="rowline"><span>槽宽 / 槽深</span><b>${fmt(ring.width)} / ${fmt(ring.depth)}</b></div><div class="rowline"><span>活塞槽底径</span><b>${fmt(ring.pistonGrooveDiameter)}</b></div>` : "";
        const prog = C.groovingProgram({ outerDiameter: num("outer"), grooveDiameter: num("bottom"), grooveWidth: num("width"), toolWidth: num("tool"), stepRadius: num("step"), feed: num("feed"), startZ: -10 });
        document.getElementById("prog").textContent = prog ? prog.program : "槽底径要小于外径。";
      };
      document.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", go));
      go();
    },
  },
  tri: {
    html: () => page("tri", "解三角形", `<section class="card">${field("a", "边 a", "mm", "3")}${field("b", "边 b", "mm", "4")}${field("c", "边 c", "mm", "5")}${field("A", "角 A", "°", "")}${field("B", "角 B", "°", "")}${field("C", "角 C", "°", "")}<div id="out"></div></section>`, "留空表示未知。需要三个已知量，而且至少一个是边。"),
    bind() {
      bindFav("tri");
      const go = () => {
        const val = (id) => { const v = num(id); return v > 0 ? v : undefined; };
        const solved = C.solveTriangle({ a: val("a"), b: val("b"), c: val("c"), A: val("A"), B: val("B"), C: val("C") });
        document.getElementById("out").innerHTML = solved ? `<div class="rowline"><span>边 a/b/c</span><b>${fmt(solved.a)} / ${fmt(solved.b)} / ${fmt(solved.c)}</b></div><div class="rowline"><span>角 A/B/C</span><b>${fmt(solved.angleA)}° / ${fmt(solved.angleB)}° / ${fmt(solved.angleC)}°</b></div><div class="rowline"><span>面积</span><b>${fmt(solved.area)} mm²</b></div><p class="muted">${esc(solved.note)}</p>` : `<p class="empty">这组数不能构成三角形，或已知量不够。</p>`;
      };
      document.querySelectorAll("input").forEach((el) => el.addEventListener("input", go));
      go();
    },
  },
  sim: {
    html: () => page("sim", "宏转G模拟", `<section class="card"><textarea id="src" rows="8">#1=0\nWHILE[#1 LT 3] DO1\nG01 X[2*#1] Z[-#1] F0.2\n#1=#1+1\nEND1</textarea></section><section class="card"><svg class="sketch" id="path" viewBox="0 0 320 180"></svg><pre class="code" id="out"></pre><p class="warn" id="err"></p></section>`, "支持 #变量、四则、SIN/COS/SQRT、WHILE/END、IF GOTO。X 按直径。第一条运动只定位。"),
    bind() {
      bindFav("sim");
      const go = () => {
        const result = C.expandMacro(document.getElementById("src").value);
        document.getElementById("out").textContent = result.lines.join("\n");
        document.getElementById("err").textContent = result.errors.join("\n");
        const segs = result.segments;
        const svg = document.getElementById("path");
        if (!segs.length) { svg.innerHTML = ""; return; }
        const zs = segs.flatMap((s) => [s.z0, s.z1]), xs = segs.flatMap((s) => [s.x0, s.x1]);
        const minZ = Math.min(...zs) - 1, maxZ = Math.max(...zs) + 1, minX = Math.min(0, ...xs) - 1, maxX = Math.max(...xs) + 1;
        const map = (x, z) => [16 + ((z - minZ) / (maxZ - minZ || 1)) * 288, 164 - ((x - minX) / (maxX - minX || 1)) * 148];
        svg.innerHTML = segs.map((seg) => {
          const a = map(seg.x0, seg.z0), b = map(seg.x1, seg.z1);
          return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${seg.rapid ? "#8a8178" : "#b8432f"}" stroke-width="${seg.rapid ? 1 : 2}" ${seg.rapid ? 'stroke-dasharray="3 3"' : ""}/>`;
        }).join("");
      };
      document.getElementById("src").addEventListener("input", go);
      go();
    },
  },
  lab: {
    html: () => page("lab", "切削参数", `<p class="muted" id="labstatus">正在读取用量表…</p><div id="lab"></div>`, "568 条车削和加工中心记录，来源写在每条下面。转速 n = 1000×Vc/(π×D)。铣削进给 vf = fz×z×n。球头按有效直径算转速。"),
    async bind() {
      bindFav("lab");
      if (!cutting) {
        try { cutting = await fetch("data/cutting.json").then((res) => { if (!res.ok) throw new Error("bad"); return res.json(); }); }
        catch { document.getElementById("labstatus").textContent = "用量表没有读出来。"; return; }
      }
      const data = cutting;
      const names = toolNames(data.records);
      document.getElementById("labstatus").textContent = `共 ${data.records.length} 条，数控车 ${data.records.filter((r) => r.machine === "lathe").length}，加工中心 ${data.records.filter((r) => r.machine === "mill").length}。`;
      document.getElementById("lab").innerHTML = `<div class="seg"><button data-m="all" class="on" type="button">全部</button><button data-m="lathe" type="button">数控车</button><button data-m="mill" type="button">加工中心</button></div><input class="block" id="q" placeholder="例如 45钢、麻花钻、立铣刀" style="width:100%;margin:8px 0"><div class="split"><label class="field"><span>材料</span><select id="mat"><option value="">全部</option>${data.materials.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join("")}</select><em></em></label><label class="field"><span>工序</span><select id="op"><option value="">全部</option>${data.ops.map((o) => `<option value="${o.id}">${esc(o.name)}</option>`).join("")}</select><em></em></label></div><div class="chip-row" id="tools"><button class="chip on" data-tool="" type="button">全部刀具</button>${names.map((name) => { const sample = data.records.find((row) => toolFace(row).name === name); return `<button class="chip" data-tool="${esc(name)}" type="button">${toolIcon(toolFace(sample).family)}<span>${esc(name)}</span></button>`; }).join("")}</div><section class="card" id="compare"></section><div class="lab-layout"><section class="card list" id="list"></section><section class="card" id="detail"></section></div>`;
      let machine = "all", toolName = "", selected = null, compared = [];
      const go = () => {
        const q = document.getElementById("q").value.trim().toLowerCase();
        let rows = C.filterRecords(data.records, { machine, op: document.getElementById("op").value, mat: document.getElementById("mat").value, tool: "", q: "" }, data.materials, data.ops);
        if (toolName) rows = rows.filter((row) => toolFace(row).name === toolName);
        if (q) rows = rows.filter((row) => {
          const face = toolFace(row);
          return [matName(row.mat), opName(row.op), face.name, face.suffix, row.tool, row.notes, row.source].join(" ").toLowerCase().includes(q);
        });
        document.getElementById("list").innerHTML = `<p class="muted">${rows.length} 条</p>` + rows.slice(0, 80).map((row) => {
          const face = toolFace(row);
          return `<div class="item"><button class="link" data-id="${row.id}" type="button"><span class="tool-line">${toolIcon(face.family)}<b>${esc(face.name)}</b>${face.suffix ? `<small>${esc(face.suffix)}</small>` : ""}</span><div class="muted">${esc(matName(row.mat))} · ${esc(opName(row.op))}</div></button><button class="btn sec cmp" data-cmp="${row.id}" type="button">${compared.includes(row.id) ? "移出对比" : "加入对比"}</button></div>`;
        }).join("");
        document.querySelectorAll("[data-id]").forEach((btn) => btn.addEventListener("click", () => { selected = data.records.find((row) => row.id === btn.dataset.id); show(); }));
        document.querySelectorAll("[data-cmp]").forEach((btn) => btn.addEventListener("click", () => {
          const id = btn.dataset.cmp;
          compared = compared.includes(id) ? compared.filter((item) => item !== id) : compared.length < 3 ? [...compared, id] : compared;
          paintCompare();
          go();
        }));
        if (!selected || !rows.some((row) => row.id === selected.id)) selected = rows[0] || null;
        show();
        paintCompare();
      };
      const paintCompare = () => {
        const rows = compared.map((id) => data.records.find((row) => row.id === id)).filter(Boolean);
        const box = document.getElementById("compare");
        if (!rows.length) { box.innerHTML = ""; return; }
        box.innerHTML = `<h2 style="margin:0 0 8px">对比（最多 3 条）</h2><div class="compare">${rows.map((row) => {
          const face = toolFace(row);
          const vc = row.vc ? row.vc.join("–") : "—";
          const feed = row.f ? row.f.join("–") + " mm/r" : row.fz ? row.fz.join("–") + " mm/z" : "—";
          return `<div class="item"><span class="tool-line">${toolIcon(face.family)}<b>${esc(face.name)}</b></span>${face.suffix ? `<small class="muted">${esc(face.suffix)}</small>` : ""}<div class="muted">${esc(matName(row.mat))} · ${esc(opName(row.op))}</div><div class="rowline"><span>Vc</span><b>${esc(vc)}</b></div><div class="rowline"><span>f / fz</span><b>${esc(feed)}</b></div></div>`;
        }).join("")}</div>`;
      };
      const matName = (id) => data.materials.find((m) => m.id === id)?.name || id;
      const opName = (id) => data.ops.find((o) => o.id === id)?.name || id;
      const show = () => {
        const row = selected;
        if (!row) { document.getElementById("detail").innerHTML = `<p class="empty">没有符合条件的记录。</p>`; return; }
        const vc = C.midRange(row.vc);
        const face = toolFace(row);
        document.getElementById("detail").innerHTML = `<h2 style="margin:0 0 6px">${esc(matName(row.mat))}</h2><p class="tool-line">${toolIcon(face.family)}<b>${esc(face.name)}</b>${face.suffix ? `<small>${esc(face.suffix)}</small>` : ""}</p><p class="muted">${esc(opName(row.op))}</p><div class="rowline"><span>Vc</span><b>${row.vc ? row.vc.join("–") : "—"} m/min</b></div><div class="rowline"><span>f / fz</span><b>${row.f ? row.f.join("–") + " mm/r" : row.fz ? row.fz.join("–") + " mm/z" : row.fzCode || "—"}</b></div><p class="muted">${esc(row.notes || "")}</p><p class="muted">来源：${esc(row.source)}</p>${field("dia", row.machine === "lathe" ? "工件直径" : "刀具直径", "mm", "50")}${field("vcin", "采用 Vc", "m/min", vc ?? "")}${row.feedType === "fz" ? field("teeth", "齿数 z", "", "4") : ""}${row.feedType === "pitch" ? field("pitchf", "螺距", "mm", "1.5") : ""}<div id="calc"></div>`;
        const recalc = () => {
          const d = num("dia"), v = num("vcin");
          const n = C.rpm(v, d);
          let feed = null, extra = "";
          if (row.feedType === "fz") {
            const teeth = num("teeth") || 1;
            const fz = row.fzCode ? C.lerp(data.fzDc, data.fzTable[row.fzCode], d) : C.midRange(row.fz);
            feed = fz != null && n ? fz * teeth * n : null;
            extra = fz != null ? `<div class="rowline"><span>fz</span><b>${fmt(fz, 3)} mm/z</b></div>` : "";
          } else if (row.feedType === "pitch") {
            const p = num("pitchf");
            feed = n && p > 0 ? p * n : null;
            extra = `<p class="muted">攻丝或车螺纹的进给必须等于螺距。</p>`;
          } else if (row.feedByD) {
            const f = C.lerp(row.feedByD.map((item) => item.d), row.feedByD.map((item) => item.f), d);
            feed = f != null && n ? f * n : null;
            extra = f != null ? `<div class="rowline"><span>f</span><b>${fmt(f, 3)} mm/r</b></div>` : "";
          } else if (row.f) {
            const f = C.midRange(row.f);
            feed = f != null && n ? f * n : null;
            extra = `<div class="rowline"><span>f</span><b>${fmt(f, 3)} mm/r</b></div>`;
          }
          document.getElementById("calc").innerHTML = `${n ? `<div class="rowline"><span>转速</span><b>${Math.round(n)} r/min</b></div>` : ""}${extra}${feed ? `<div class="rowline"><span>进给速度</span><b>${fmt(feed, 1)} mm/min</b></div>` : ""}`;
        };
        document.querySelectorAll("#detail input").forEach((el) => el.addEventListener("input", recalc));
        recalc();
      };
      document.querySelectorAll("[data-m]").forEach((btn) => btn.addEventListener("click", () => { machine = btn.dataset.m; document.querySelectorAll("[data-m]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      document.querySelectorAll("[data-tool]").forEach((btn) => btn.addEventListener("click", () => { toolName = btn.dataset.tool; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b === btn)); go(); }));
      ["q", "mat", "op"].forEach((id) => document.getElementById(id).addEventListener("input", go));
      go();
    },
  },
};

function fieldText(id, label) {
  return `<label class="field"><span>${label}</span><input id="${id}" value=""><em></em></label>`;
}
function copyText(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  else fallbackCopy(text);
}
function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  try { document.execCommand("copy"); } catch { /* 离线页面没有剪贴板权限时仍可手动选择程序文本 */ }
  area.remove();
}

function setTab(which) {
  document.getElementById("tab-home").classList.toggle("on", which === "home");
  document.getElementById("tab-mine").classList.toggle("on", which === "mine");
}
const CRAFT_FIELDS = {
  diameter: ["直径", "mm"], depth: ["铣深", "mm"], innerRatio: ["内接比", ""],
  acrossFlats: ["对边，0 表示用直径", "mm"], sides: ["边数", ""], length: ["总长", "mm"],
  nose: ["鼻长", "mm"], tail: ["尾锥长", "mm"], baseDiameter: ["尾端直径", "mm"],
};

function craftEditor(id) {
  const craft = CRAFTS.find((item) => item.id === id);
  const app = document.getElementById("app");
  if (!craft) { app.innerHTML = homeHTML(); setTab("home"); return; }
  const fields = Object.keys(craft.defaults).map((key) => {
    const meta = CRAFT_FIELDS[key] || [key, ""];
    return field(key, meta[0], meta[1], String(craft.defaults[key]));
  }).join("");
  app.innerHTML = page("notes", craft.name, `<p><a class="btn sec" href="#/m/notes">返回图库</a></p><div class="split"><section class="card" id="inputs">${fields}</section><section class="card" id="view"></section></div>`, "车削程序 X 为直径，Z 从前端面往卡盘为负。铣削外形在 G17，深度从上表面往下。");
  bindFav("notes");
  const paint = () => {
    const params = {};
    for (const key of Object.keys(craft.defaults)) params[key] = Number(document.getElementById(key).value);
    const model = buildCraft(id, params);
    const view = document.getElementById("view");
    if (model.error) { view.innerHTML = `<p class="warn">${esc(model.error)}</p>`; return; }
    const prog = programFor(model, params);
    const pts = profilePoints(model);
    const table = model.kind === "lathe"
      ? `<table class="pts"><tr><th>X 直径</th><th>Z</th></tr>${pts.map((p) => `<tr><td>${fmt(p.x)}</td><td>${fmt(p.z)}</td></tr>`).join("")}</table>`
      : `<table class="pts"><tr><th>X</th><th>Y</th></tr>${pts.map((p) => `<tr><td>${fmt(p.x)}</td><td>${fmt(p.y)}</td></tr>`).join("")}</table>`;
    view.innerHTML = `${drawSegmentsSVG(model, 360, 210)}${table}<pre class="code" id="prog">${esc(prog)}</pre><button class="btn" id="copy" type="button">复制程序</button>`;
    document.getElementById("copy").onclick = () => copyText(prog);
  };
  document.querySelectorAll("#inputs input").forEach((el) => el.addEventListener("input", paint));
  paint();
}

function notesPage() {
  return `<div class="page"><header class="page-head"><a href="#/mine" class="btn sec">返回</a><h1>我的工艺笔记</h1></header>
    <section class="card" id="editor">${fieldText("title", "名称")}${fieldText("material", "材料")}${fieldText("tool", "刀具")}${fieldText("cutting", "转速 / 进给")}<label class="field"><span>备注</span></label><textarea id="body" rows="4"></textarea><p><button class="btn" id="saveNote" type="button">保存</button></p></section>
    <section class="card" id="notes"></section>
    <p class="note">记在这台设备的浏览器里，不上传。</p></div>`;
}

function bindNotes() {
  const render = () => {
    const notes = loadNotes();
    document.getElementById("notes").innerHTML = notes.length ? notes.map((note) => `<div class="item"><b>${esc(note.title || "未命名")}</b><div class="muted">${esc([note.material, note.tool, note.cutting].filter(Boolean).join(" · "))}</div><p>${esc(note.body || "")}</p><button class="btn sec" data-del="${esc(note.id)}" type="button">删除</button></div>`).join("") : `<p class="empty">还没有工艺卡片。</p>`;
    document.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => { saveNotes(loadNotes().filter((note) => note.id !== btn.dataset.del)); render(); }));
  };
  document.getElementById("saveNote").onclick = () => {
    const note = { id: String(Date.now()), title: document.getElementById("title").value, material: document.getElementById("material").value, tool: document.getElementById("tool").value, cutting: document.getElementById("cutting").value, body: document.getElementById("body").value, updatedAt: new Date().toISOString() };
    if (!note.title && !note.body) return;
    saveNotes([note, ...loadNotes()]);
    ["title", "material", "tool", "cutting", "body"].forEach((id) => { document.getElementById(id).value = ""; });
    render();
  };
  render();
}

function route() {
  const hash = (location.hash || "#/").replace(/^#/, "");
  const app = document.getElementById("app");
  if (hash === "/mine/notes") { app.innerHTML = notesPage(); bindNotes(); setTab("mine"); return; }
  if (hash === "/mine") { app.innerHTML = mineHTML(); setTab("mine"); return; }
  if (hash.startsWith("/m/notes/")) { craftEditor(decodeURIComponent(hash.slice("/m/notes/".length))); setTab("home"); return; }
  if (hash.startsWith("/m/")) {
    const id = hash.slice(3);
    const screen = screens[id];
    const found = MODULES.find(([key]) => key === id);
    if (!screen || !found) { app.innerHTML = homeHTML(); setTab("home"); return; }
    app.innerHTML = screen.html();
    setTab("home");
    screen.bind();
    return;
  }
  app.innerHTML = homeHTML();
  setTab("home");
}
window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
}
