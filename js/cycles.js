const numField = (id, label, unit, def) => ({ id, label, unit, def: String(def), type: "num" });
const pick = (id, label, options, def) => ({ id, label, unit: "", def, type: "select", options });

export const CYCLES = [
  cycle("g90", "lathe", "G90", "外径/内径切削循环", "turn", [
    pick("side", "内外", [["out", "外径"], ["in", "内径"]], "out"),
    numField("xs", "起刀 X", "mm", 52), numField("zs", "起刀 Z", "mm", 2),
    numField("x", "终点 X", "mm", 40), numField("z", "终点 Z", "mm", -30),
    numField("taper", "R 锥度", "mm", 0), numField("f", "F 进给", "mm/r", 0.25), numField("s", "S 转速", "r/min", 800),
  ]),
  cycle("g94", "lathe", "G94", "端面切削循环", "face", [
    numField("xs", "起刀 X", "mm", 52), numField("zs", "起刀 Z", "mm", 2),
    numField("x", "终点 X", "mm", 16), numField("z", "终点 Z", "mm", -1.5),
    numField("taper", "R 锥度", "mm", 0), numField("f", "F 进给", "mm/r", 0.2), numField("s", "S 转速", "r/min", 700),
  ]),
  cycle("g92", "lathe", "G92", "螺纹切削循环", "thread", [
    numField("xs", "起刀 X", "mm", 22), numField("zs", "起刀 Z", "mm", 4),
    numField("x", "终点 X", "mm", 18.376), numField("z", "终点 Z", "mm", -28),
    numField("taper", "R 锥度", "mm", 0), numField("pitch", "F 螺距", "mm", 2.5), numField("s", "S 转速", "r/min", 400),
  ]),
  cycle("g71", "lathe", "G71", "外径粗车复合循环", "rough", [
    numField("xs", "起刀 X", "mm", 62), numField("zs", "起刀 Z", "mm", 2),
    numField("depth", "U 每次切深", "mm", 1.5), numField("retract", "R 退刀量", "mm", 0.5),
    numField("ns", "P 轮廓起点", "", 10), numField("nf", "Q 轮廓终点", "", 20),
    numField("uf", "U 精车 X 留量", "mm", 0.4), numField("wf", "W 精车 Z 留量", "mm", 0.1),
    numField("f", "F 进给", "mm/r", 0.25), numField("s", "S 转速", "r/min", 800),
    numField("x0", "轮廓起点 X", "mm", 20), numField("zc", "圆柱段 Z", "mm", -25),
    numField("x1", "台阶 X", "mm", 40), numField("z1", "轮廓终点 Z", "mm", -35),
  ]),
  cycle("g72", "lathe", "G72", "端面粗车复合循环", "faceRough", [
    numField("xs", "起刀 X", "mm", 62), numField("zs", "起刀 Z", "mm", 2),
    numField("depth", "W 每次切深", "mm", 1.2), numField("retract", "R 退刀量", "mm", 0.5),
    numField("ns", "P 轮廓起点", "", 10), numField("nf", "Q 轮廓终点", "", 20),
    numField("uf", "U 精车 X 留量", "mm", 0.2), numField("wf", "W 精车 Z 留量", "mm", 0.1),
    numField("f", "F 进给", "mm/r", 0.2), numField("s", "S 转速", "r/min", 600),
    numField("z0", "轮廓起点 Z", "mm", -8), numField("x1", "轮廓终点 X", "mm", 18),
  ]),
  cycle("g73", "lathe", "G73", "仿形循环", "profile", [
    numField("xs", "起刀 X", "mm", 62), numField("zs", "起刀 Z", "mm", 2),
    numField("reliefU", "U 径向退刀", "mm", 8), numField("reliefW", "W 轴向退刀", "mm", 2),
    numField("passes", "R 循环次数", "", 6),
    numField("ns", "P 轮廓起点", "", 10), numField("nf", "Q 轮廓终点", "", 20),
    numField("uf", "U 精车 X 留量", "mm", 0.4), numField("wf", "W 精车 Z 留量", "mm", 0.1),
    numField("f", "F 进给", "mm/r", 0.25), numField("s", "S 转速", "r/min", 700),
    numField("x0", "轮廓起点 X", "mm", 20), numField("z1", "轮廓终点 Z", "mm", -35), numField("x1", "轮廓终点 X", "mm", 40),
  ]),
  cycle("g70", "lathe", "G70", "精车循环", "finish", [
    numField("xs", "起刀 X", "mm", 62), numField("zs", "起刀 Z", "mm", 2),
    numField("ns", "P 轮廓起点", "", 10), numField("nf", "Q 轮廓终点", "", 20),
    numField("s", "S 转速", "r/min", 1000),
  ]),
  cycle("g74", "lathe", "G74", "端面啄钻", "peck", [
    numField("x", "钻孔 X", "mm", 0), numField("zs", "起刀 Z", "mm", 2),
    numField("z", "孔底 Z", "mm", -30), numField("retract", "R 退刀量", "mm", 0.5),
    numField("peck", "Q 每次切深", "mm", 3), numField("f", "F 进给", "mm/r", 0.1), numField("s", "S 转速", "r/min", 500),
  ]),
  cycle("g75", "lathe", "G75", "外径切槽循环", "groove", [
    numField("xs", "起刀 X", "mm", 42), numField("zs", "起刀 Z", "mm", -8),
    numField("x", "槽底 X", "mm", 30), numField("z", "槽终点 Z", "mm", -20),
    numField("retract", "R 退刀量", "mm", 0.5),
    numField("peckX", "P 径向每次", "mm", 2), numField("peckZ", "Q 轴向错开", "mm", 3),
    numField("f", "F 进给", "mm/r", 0.08), numField("s", "S 转速", "r/min", 400),
  ]),
  cycle("g76", "lathe", "G76", "螺纹复合循环", "g76", [
    numField("xs", "起刀 X", "mm", 22), numField("zs", "起刀 Z", "mm", 4),
    numField("x", "终点 X", "mm", 18.376), numField("z", "终点 Z", "mm", -30),
    numField("taper", "R 锥螺纹", "mm", 0),
    numField("m", "精车次数 m", "", 2), numField("chamfer", "牙倒角 r", "", 0), numField("angle", "牙型角 a", "°", 60),
    numField("qmin", "最小切深", "mm", 0.1), numField("finish", "精车余量", "mm", 0.05),
    numField("height", "牙高 k", "mm", 0.812), numField("first", "第一次切深", "mm", 0.3),
    numField("pitch", "F 螺距", "mm", 2.5), numField("s", "S 转速", "r/min", 400),
  ]),
  cycle("g32", "lathe", "G32", "单行程螺纹", "g32", [
    numField("xs", "起刀 X", "mm", 22), numField("zs", "起刀 Z", "mm", 4),
    numField("x", "终点 X", "mm", 22), numField("z", "终点 Z", "mm", -32),
    numField("pitch", "F 螺距", "mm", 2.5), numField("s", "S 转速", "r/min", 400),
  ]),
  cycle("nlathe", "lathe", "n", "转速 n＝1000×Vc/(πD)", "rpm", [
    numField("d", "D 直径", "mm", 50), numField("vc", "Vc 切削速度", "m/min", 150),
  ], true),
  cycle("vflathe", "lathe", "vf", "进给速度 vf＝f×n", "vf", [
    numField("f", "f 每转进给", "mm/r", 0.2), numField("n", "n 转速", "r/min", 800),
  ], true),
  cycle("taper", "lathe", "锥度", "锥度与两端直径", "taper", [
    numField("big", "大端直径", "mm", 40), numField("small", "小端直径", "mm", 30), numField("length", "锥长 L", "mm", 20),
  ], true),
  cycle("arcik", "lathe", "I/K", "圆弧起点到圆心的 I、K", "ik", [
    pick("dir", "方向", [["G03", "G03 逆时针"], ["G02", "G02 顺时针"]], "G03"),
    numField("xs", "起点 X", "mm", 40), numField("zs", "起点 Z", "mm", 0),
    numField("xe", "终点 X", "mm", 30), numField("ze", "终点 Z", "mm", -5),
    numField("xc", "圆心 X", "mm", 30), numField("zc", "圆心 Z", "mm", 0),
  ], true),
  cycle("leadin", "lathe", "导入", "螺纹导入长度", "lead", [
    numField("pitch", "螺距 P", "mm", 2.5),
  ], true),
  cycle("g81", "mill", "G81", "钻孔循环", "hole", holeFields()),
  cycle("g82", "mill", "G82", "锪孔（孔底暂停）", "hole", holeFields([numField("pause", "P 暂停", "ms", 500)])),
  cycle("g83", "mill", "G83", "深孔啄钻", "peckHole", holeFields([numField("peck", "Q 每次切深", "mm", 5)])),
  cycle("g73mill", "mill", "G73", "高速深孔啄钻", "peckHole", holeFields([numField("peck", "Q 每次切深", "mm", 3)])),
  cycle("g84", "mill", "G84", "右旋攻丝", "tap", tapFields()),
  cycle("g74mill", "mill", "G74", "左旋攻丝", "tap", tapFields()),
  cycle("g85", "mill", "G85", "镗孔", "hole", holeFields()),
  cycle("g86", "mill", "G86", "镗孔主轴停", "hole", holeFields()),
  cycle("g76mill", "mill", "G76", "精镗", "shift", holeFields([
    numField("shift", "Q 让刀量", "mm", 0.3), numField("pause", "P 暂停", "ms", 500),
  ])),
  cycle("g87", "mill", "G87", "背镗", "shift", holeFields([numField("shift", "Q 让刀量", "mm", 0.5)])),
  cycle("g80", "mill", "G80", "取消固定循环", "cancel", []),
  cycle("nmill", "mill", "n", "转速 n＝1000×Vc/(πD)", "rpm", [
    numField("d", "D 刀具直径", "mm", 10), numField("vc", "Vc 切削速度", "m/min", 80),
  ], true),
  cycle("vfmill", "mill", "vf", "进给 vf＝fz×z×n", "vfz", [
    numField("fz", "fz 每齿进给", "mm/z", 0.08), numField("teeth", "z 齿数", "", 4), numField("n", "n 转速", "r/min", 2500),
  ], true),
  cycle("tapfeed", "mill", "F", "攻丝进给 F＝n×P", "tapf", [
    numField("n", "n 转速", "r/min", 400), numField("pitch", "P 螺距", "mm", 1.5),
  ], true),
  cycle("arcij", "mill", "I/J", "圆弧起点到圆心的 I、J", "ij", [
    pick("dir", "方向", [["G03", "G03 逆时针"], ["G02", "G02 顺时针"]], "G03"),
    numField("x0", "起点 X", "mm", 0), numField("y0", "起点 Y", "mm", 0),
    numField("x1", "终点 X", "mm", 20), numField("y1", "终点 Y", "mm", 0),
    numField("cx", "圆心 X", "mm", 10), numField("cy", "圆心 Y", "mm", 0),
  ], true),
];

function holeFields(extra = []) {
  return [
    numField("safe", "安全高度", "mm", 30), numField("r", "R 参考高度", "mm", 2),
    numField("z", "Z 孔底", "mm", -18), numField("f", "F 进给", "mm/min", 150), numField("s", "S 转速", "r/min", 1200),
    ...extra,
  ];
}
function tapFields() {
  return [
    numField("safe", "安全高度", "mm", 30), numField("r", "R 参考高度", "mm", 5),
    numField("z", "Z 孔底", "mm", -16), numField("pitch", "P 螺距", "mm", 1.5), numField("s", "S 转速", "r/min", 400),
  ];
}
function cycle(id, machine, code, title, diagram, fields, formula = false) {
  return { id, machine, code, title, diagram, fields, formula, holes: diagram === "hole" || diagram === "peckHole" || diagram === "tap" || diagram === "shift" };
}

export const CYCLE_GROUPS = [
  { title: "数控车", sections: [
    { title: "循环", ids: ["g90", "g94", "g92", "g71", "g72", "g73", "g70", "g74", "g75", "g76", "g32"] },
    { title: "编程公式", ids: ["nlathe", "vflathe", "taper", "arcik", "leadin"] },
  ]},
  { title: "加工中心", sections: [
    { title: "循环", ids: ["g81", "g82", "g83", "g73mill", "g84", "g74mill", "g85", "g86", "g76mill", "g87", "g80"] },
    { title: "编程公式", ids: ["nmill", "vfmill", "tapfeed", "arcij"] },
  ]},
];

export function cycleById(id) {
  return CYCLES.find((item) => item.id === id) || null;
}
export function defaultValues(item) {
  const values = {};
  for (const field of item.fields) values[field.id] = field.def;
  return values;
}
export function defaultHoles() {
  return [{ x: "10", y: "10" }];
}

export function gnum(value, digits = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  let text = n.toFixed(digits).replace(/\.?0+$/, "");
  if (text === "-0" || text === "") text = "0";
  if (!text.includes(".")) text += ".";
  return text;
}

export function cycleProgram(item, values, dialect = "fanuc", holes = defaultHoles()) {
  const built = build(item, values || {}, dialect === "huazhong" ? "huazhong" : "fanuc", holes);
  if (built.error) return { program: "", error: built.error };
  if (built.program.includes("NaN") || built.program.includes("null")) return { program: "", error: "有参数不是有效数字。" };
  return built;
}

export function cycleDiagram(item, values, active = "", holes = defaultHoles()) {
  const picture = draw(item, values || {}, active, holes);
  return picture.includes("NaN") ? "" : picture;
}

function build(item, values, dialect, holes) {
  const nums = {};
  for (const field of item.fields) {
    if (field.type === "select") {
      nums[field.id] = values[field.id] || field.def;
      continue;
    }
    const n = Number(values[field.id]);
    if (!Number.isFinite(n)) return { error: `「${field.label}」要填数字。` };
    nums[field.id] = n;
  }
  const fn = BUILD[item.id];
  if (!fn) return { error: "没有这个循环。" };
  return fn(nums, dialect, holes, values);
}

function word(letter, value) {
  const text = gnum(value);
  return text == null ? null : `${letter}${text}`;
}
function microns(mm) {
  if (!Number.isFinite(mm)) return null;
  return String(Math.round(mm * 1000));
}
function seq(n) {
  if (!Number.isFinite(n)) return null;
  return String(Math.round(n));
}
function positive(n, label) {
  if (!(n > 0)) return `${label}要大于 0。`;
  return "";
}

function latheOpen(title, dialect, note) {
  const system = dialect === "huazhong" ? "华中" : "FANUC 系统 A";
  return [`(${title})`, `(${system}。直径编程，X 是直径。G99 为每转进给)`, note, "G21 G99 G40"].filter(Boolean);
}
function latheClose(lines, x) {
  const clear = gnum(x);
  if (!clear) return { error: "退刀直径算不出来。" };
  lines.push(`G00 X${clear} Z50.`, "M05", "M30");
  return { program: lines.join("\n") };
}
function millOpen(title, dialect, note) {
  const system = dialect === "huazhong" ? "华中。此循环写法与 FANUC 相同" : "FANUC";
  return [`(${title})`, `(${system}。G90 绝对值，G98 返回起始平面)`, note, "G21 G17 G90 G94 G40 G80", "T01 M06"].filter(Boolean);
}
function readHoles(holes) {
  const list = (holes || []).map((hole) => ({ x: Number(hole.x), y: Number(hole.y) }));
  if (!list.length || list.some((hole) => !Number.isFinite(hole.x) || !Number.isFinite(hole.y))) {
    return { error: "每个孔的 X、Y 都要填数字。" };
  }
  return { holes: list };
}

const BUILD = {
  g90(v, dialect) {
    const bad = positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const side = v.side === "in" ? "内径" : "外径";
    const lines = [
      ...latheOpen(`G90 ${side}切削循环`, dialect, dialect === "huazhong" ? "(G90 与 FANUC 相同。R 是锥面半径差，直车为 0)" : "(R 是锥面半径差，直车为 0。终点比起点细时 R 为负)"),
      "T0101", `${word("G97 S", v.s)?.replace("G97 S", "G97 S")}`,
    ];
    const spindle = `G97 S${Math.round(v.s)} M03`;
    const body = [`G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, `G90 ${word("X", v.x)} ${word("Z", v.z)} ${word("R", v.taper)} ${word("F", v.f)}`];
    if (body.some((line) => line.includes("null"))) return { error: "数值无效。" };
    const clear = v.side === "in" ? Math.min(v.xs, v.x) - 6 : Math.max(v.xs, v.x) + 12;
    return latheClose([lines[0], lines[1], lines[2], lines[3], "T0101", spindle, ...body], clear);
  },
  g94(v, dialect) {
    const bad = positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const lines = [...latheOpen("G94 端面切削循环", dialect, "(与 FANUC 相同。R 为端面锥度半径差)"), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, `G94 ${word("X", v.x)} ${word("Z", v.z)} ${word("R", v.taper)} ${word("F", v.f)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, Math.max(v.xs, v.x) + 12);
  },
  g92(v, dialect) {
    const bad = positive(v.pitch, "螺距") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const lines = [...latheOpen("G92 螺纹切削循环", dialect, "(F 是螺距。导入长度建议不小于 2～3 倍螺距，起刀 Z 留在工件外面)"), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, `G92 ${word("X", v.x)} ${word("Z", v.z)} ${word("R", v.taper)} ${word("F", v.pitch)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 8);
  },
  g71(v, dialect) {
    const bad = positive(v.depth, "每次切深") || positive(v.retract, "退刀量") || positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const ns = seq(v.ns); const nf = seq(v.nf);
    if (!ns || !nf) return { error: "P、Q 要填段号。" };
    const fanuc = [`G71 ${word("U", v.depth)} ${word("R", v.retract)}`, `G71 P${ns} Q${nf} ${word("U", v.uf)} ${word("W", v.wf)} ${word("F", v.f)} S${Math.round(v.s)}`];
    const hnc = [`G71 ${word("U", v.depth)} ${word("R", v.retract)} P${ns} Q${nf} ${word("X", v.uf)} ${word("Z", v.wf)} ${word("F", v.f)}`];
    const call = dialect === "huazhong" ? hnc : fanuc;
    const note = dialect === "huazhong"
      ? "(华中单行：X、Z 是精车留量，相当于 FANUC 第二行的 U、W)"
      : "(FANUC 两行：第一行 U 切深、R 退刀；第二行 U、W 是精车留量)";
    const lines = [
      ...latheOpen("G71 外径粗车复合循环", dialect, note),
      "T0101", `G97 S${Math.round(v.s)} M03`,
      `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`,
      ...call,
      `(N${ns}～N${nf} 是精加工轮廓示例，按零件改)`,
      `N${ns} G00 ${word("X", v.x0)}`,
      `G01 ${word("Z", v.zc)} F0.12`,
      `G01 ${word("X", v.x1)} ${word("Z", v.z1)}`,
      `N${nf} ${word("X", v.xs)}`,
    ];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 12);
  },
  g72(v, dialect) {
    const bad = positive(v.depth, "每次切深") || positive(v.retract, "退刀量") || positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const ns = seq(v.ns); const nf = seq(v.nf);
    const call = dialect === "huazhong"
      ? [`G72 ${word("W", v.depth)} ${word("R", v.retract)} P${ns} Q${nf} ${word("X", v.uf)} ${word("Z", v.wf)} ${word("F", v.f)}`]
      : [`G72 ${word("W", v.depth)} ${word("R", v.retract)}`, `G72 P${ns} Q${nf} ${word("U", v.uf)} ${word("W", v.wf)} ${word("F", v.f)} S${Math.round(v.s)}`];
    const note = dialect === "huazhong" ? "(华中单行，X、Z 为精车留量)" : "(FANUC 两行，第一行 W 是端面每次切深)";
    const lines = [...latheOpen("G72 端面粗车复合循环", dialect, note), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, ...call, `(N${ns}～N${nf} 是精加工轮廓示例，按零件改)`, `N${ns} G00 ${word("Z", v.z0)}`, `G01 ${word("X", v.x1)} F0.1`, `N${nf} ${word("Z", v.zs)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 12);
  },
  g73(v, dialect) {
    const bad = positive(v.passes, "循环次数") || positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const ns = seq(v.ns); const nf = seq(v.nf); const passes = seq(v.passes);
    const call = dialect === "huazhong"
      ? [`G73 ${word("U", v.reliefU)} ${word("W", v.reliefW)} R${passes} P${ns} Q${nf} ${word("X", v.uf)} ${word("Z", v.wf)} ${word("F", v.f)}`]
      : [`G73 ${word("U", v.reliefU)} ${word("W", v.reliefW)} R${passes}`, `G73 P${ns} Q${nf} ${word("U", v.uf)} ${word("W", v.wf)} ${word("F", v.f)} S${Math.round(v.s)}`];
    const note = dialect === "huazhong" ? "(华中单行。U、W 是毛坯相对轮廓的退刀量，R 是走刀次数)" : "(FANUC 两行。第一行 U、W 是退刀量，R 是走刀次数)";
    const lines = [...latheOpen("G73 仿形循环", dialect, note), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, ...call, `(N${ns}～N${nf} 是精加工轮廓示例，按零件改)`, `N${ns} G00 ${word("X", v.x0)}`, `G01 ${word("X", v.x1)} ${word("Z", v.z1)} F0.12`, `N${nf} ${word("X", v.xs)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 12);
  },
  g70(v, dialect) {
    const bad = positive(v.s, "转速");
    if (bad) return { error: bad };
    const ns = seq(v.ns); const nf = seq(v.nf);
    const lines = [...latheOpen("G70 精车循环", dialect, "(轮廓段要和粗车的 P、Q 一致，这里不重复展开)"), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, `G70 P${ns} Q${nf}`, `(N${ns} 到 N${nf} 用精车进给，写在本段之前)`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 12);
  },
  g74(v, dialect) {
    const bad = positive(v.peck, "每次切深") || positive(v.retract, "退刀量") || positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const q = microns(v.peck);
    const lines = [...latheOpen("G74 端面啄钻", dialect, `(Q${q} 表示每次 ${gnum(v.peck)} mm，单位 0.001 mm)`), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.x)} ${word("Z", v.zs)}`, `G74 ${word("R", v.retract)}`, `G74 ${word("Z", v.z)} Q${q} ${word("F", v.f)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, Math.abs(v.x) + 20);
  },
  g75(v, dialect) {
    const bad = positive(v.peckX, "径向每次") || positive(v.retract, "退刀量") || positive(v.f, "进给") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const lines = [...latheOpen("G75 外径切槽循环", dialect, `(P、Q 单位 0.001 mm。P${microns(v.peckX)} 为径向每次，Q${microns(v.peckZ)} 为轴向错开)`), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, `G75 ${word("R", v.retract)}`, `G75 ${word("X", v.x)} ${word("Z", v.z)} P${microns(v.peckX)} Q${microns(v.peckZ)} ${word("F", v.f)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 10);
  },
  g76(v, dialect) {
    const bad = positive(v.pitch, "螺距") || positive(v.height, "牙高") || positive(v.first, "第一次切深") || positive(v.s, "转速");
    if (bad) return { error: bad };
    if (v.m < 1 || v.m > 99 || v.chamfer < 0 || v.chamfer > 99 || v.angle < 0 || v.angle > 99) {
      return { error: "精车次数、牙倒角和牙型角要落在 0 到 99，精车次数至少 1。" };
    }
    const p = `${seq(v.m).padStart(2, "0")}${seq(v.chamfer).padStart(2, "0")}${seq(v.angle).padStart(2, "0")}`;
    const lines = [...latheOpen("G76 螺纹复合循环", dialect, dialect === "huazhong"
      ? "(华中常见单行：K 牙高、D 第一次切深都是毫米半径值，A 是牙型角)"
      : "(FANUC 两行。第一行 P 是精车次数、倒角、牙型角，Q、R 为最小切深和精车余量；第二行 P 牙高、Q 第一次切深，单位 0.001 mm。X 是螺纹终点直径)"),
    "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`];
    if (dialect === "huazhong") {
      lines.push(`G76 ${word("X", v.x)} ${word("Z", v.z)} ${word("I", v.taper)} ${word("K", v.height)} ${word("D", v.first)} ${word("F", v.pitch)} A${seq(v.angle)} ${word("P", v.qmin)} ${word("Q", v.finish)}`);
    } else {
      lines.push(`G76 P${p} Q${microns(v.qmin)} ${word("R", v.finish)}`);
      lines.push(`G76 ${word("X", v.x)} ${word("Z", v.z)} ${word("R", v.taper)} P${microns(v.height)} Q${microns(v.first)} ${word("F", v.pitch)}`);
    }
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, v.xs + 8);
  },
  g32(v, dialect) {
    const bad = positive(v.pitch, "螺距") || positive(v.s, "转速");
    if (bad) return { error: bad };
    const move = Math.abs(v.x - v.xs) < 0.0005 ? `G32 ${word("Z", v.z)} ${word("F", v.pitch)}` : `G32 ${word("X", v.x)} ${word("Z", v.z)} ${word("F", v.pitch)}`;
    const lines = [...latheOpen("G32 单行程螺纹", dialect, "(只走一刀。导入长度建议不小于 2～3 倍螺距)"), "T0101", `G97 S${Math.round(v.s)} M03`, `G00 ${word("X", v.xs)} ${word("Z", v.zs)}`, move, `G00 ${word("X", Math.max(v.xs, v.x) + 4)}`];
    if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
    return latheClose(lines, Math.max(v.xs, v.x) + 8);
  },
  nlathe(v) { return rpmText("车削转速", v.d, v.vc); },
  nmill(v) { return rpmText("铣削转速", v.d, v.vc); },
  vflathe(v) {
    const bad = positive(v.n, "转速");
    if (bad) return { error: bad };
    if (!(v.f > 0)) return { error: "每转进给要大于 0。" };
    const vf = v.f * v.n;
    return { program: `(进给速度)\n(vf = f × n)\nf = ${gnum(v.f)} mm/r\nn = ${Math.round(v.n)} r/min\nvf = ${gnum(vf, 1)} mm/min` };
  },
  vfmill(v) {
    const bad = positive(v.n, "转速") || positive(v.fz, "每齿进给") || positive(v.teeth, "齿数");
    if (bad) return { error: bad };
    const vf = v.fz * v.teeth * v.n;
    return { program: `(铣削进给)\n(vf = fz × z × n)\nfz = ${gnum(v.fz)} mm/z\nz = ${gnum(v.teeth, 0)}\nn = ${Math.round(v.n)} r/min\nvf = ${gnum(vf, 1)} mm/min` };
  },
  taper(v) {
    if (!(v.length > 0)) return { error: "锥长要大于 0。" };
    const diff = v.big - v.small;
    const taper = diff / v.length;
    const angle = Math.atan((diff / 2) / v.length) * 180 / Math.PI;
    const radius = diff / 2;
    return { program: `(锥度)\n大端 ${gnum(v.big)}  小端 ${gnum(v.small)}  锥长 ${gnum(v.length)}\n锥度 C = (D-d)/L = ${gnum(taper, 4)}\n斜角 ≈ ${gnum(angle, 3)} °\nG90 的 R（半径差）= (d-D)/2 = ${gnum(-radius)}` };
  },
  arcik(v) {
    const i = (v.xc - v.xs) / 2;
    const k = v.zc - v.zs;
    const dir = v.dir === "G02" ? "G02" : "G03";
    return { program: `(圆弧 I K)\n(I 是圆心相对起点的半径增量，不是直径增量。K 是 Z 增量)\n${dir} ${word("X", v.xe)} ${word("Z", v.ze)} ${word("I", i)} ${word("K", k)}` };
  },
  leadin(v) {
    if (!(v.pitch > 0)) return { error: "螺距要大于 0。" };
    const lead = v.pitch * 3;
    return { program: `(螺纹导入长度)\n螺距 ${gnum(v.pitch)} mm\n建议导入 ≥ 3P = ${gnum(lead)} mm\n起刀 Z 取正值，例如 Z${gnum(lead)}，让刀在空处升到螺距速度再吃牙。` };
  },
  g81(v, dialect, holes) { return millCycle("G81", "钻孔循环", v, dialect, holes, ""); },
  g82(v, dialect, holes) {
    if (!(v.pause >= 0)) return { error: "暂停不能为负。" };
    return millCycle("G82", "锪孔循环", v, dialect, holes, ` P${Math.round(v.pause)}`);
  },
  g83(v, dialect, holes) { return peckCycle("G83", "深孔啄钻", v, dialect, holes); },
  g73mill(v, dialect, holes) { return peckCycle("G73", "高速深孔啄钻", v, dialect, holes); },
  g84(v, dialect, holes) { return tapCycle("G84", "右旋攻丝", v, dialect, holes); },
  g74mill(v, dialect, holes) { return tapCycle("G74", "左旋攻丝", v, dialect, holes); },
  g85(v, dialect, holes) { return millCycle("G85", "镗孔循环", v, dialect, holes, ""); },
  g86(v, dialect, holes) { return millCycle("G86", "镗孔主轴停", v, dialect, holes, ""); },
  g76mill(v, dialect, holes) {
    const bad = positive(v.shift, "让刀量");
    if (bad) return { error: bad };
    return millCycle("G76", "精镗循环", v, dialect, holes, ` ${word("Q", v.shift)} P${Math.round(v.pause)}`);
  },
  g87(v, dialect, holes) {
    const bad = positive(v.shift, "让刀量");
    if (bad) return { error: bad };
    return millCycle("G87", "背镗循环", v, dialect, holes, ` ${word("Q", v.shift)}`);
  },
  g80(_v, dialect) {
    return { program: [...millOpen("G80 取消固定循环", dialect, "(写在孔循环后面，取消 G81～G89 的模态)"), "G80", "G00 Z30.", "M05", "M30"].join("\n") };
  },
  tapfeed(v) {
    const bad = positive(v.n, "转速") || positive(v.pitch, "螺距");
    if (bad) return { error: bad };
    const feed = v.n * v.pitch;
    return { program: `(攻丝进给)\n(G94 时 F = n × P，单位 mm/min)\nn = ${Math.round(v.n)} r/min\nP = ${gnum(v.pitch)} mm\nF = ${gnum(feed, 1)}` };
  },
  arcij(v) {
    const i = v.cx - v.x0;
    const j = v.cy - v.y0;
    const dir = v.dir === "G02" ? "G02" : "G03";
    return { program: `(圆弧 I J)\n(I、J 是圆心相对起点的坐标增量)\n${dir} ${word("X", v.x1)} ${word("Y", v.y1)} ${word("I", i)} ${word("J", j)}` };
  },
};

function rpmText(title, d, vc) {
  if (!(d > 0) || !(vc > 0)) return { error: "直径和切削速度都要大于 0。" };
  const n = (1000 * vc) / (Math.PI * d);
  return { program: `(${title})\n(n = 1000 × Vc / (π × D))\nD = ${gnum(d)} mm\nVc = ${gnum(vc, 1)} m/min\nn = ${Math.round(n)} r/min` };
}
function millCycle(code, title, v, dialect, holes, extra) {
  const bad = positive(v.f, "进给") || positive(v.s, "转速");
  if (bad) return { error: bad };
  const parsed = readHoles(holes);
  if (parsed.error) return parsed;
  const lines = holeBody(code, title, v, dialect, parsed.holes, extra, `(${code} ${title})`);
  return { program: lines.join("\n") };
}
function peckCycle(code, title, v, dialect, holes) {
  const bad = positive(v.peck, "每次切深") || positive(v.f, "进给") || positive(v.s, "转速");
  if (bad) return { error: bad };
  const parsed = readHoles(holes);
  if (parsed.error) return parsed;
  const lines = holeBody(code, title, v, dialect, parsed.holes, ` ${word("Q", v.peck)}`, `(${code} ${title}。Q 为每次切深，单位 mm)`);
  return { program: lines.join("\n") };
}
function tapCycle(code, title, v, dialect, holes) {
  const bad = positive(v.pitch, "螺距") || positive(v.s, "转速");
  if (bad) return { error: bad };
  const parsed = readHoles(holes);
  if (parsed.error) return parsed;
  const feed = v.s * v.pitch;
  const lines = [...millOpen(`${code} ${title}`, dialect, `(F = n × P = ${gnum(feed, 1)} mm/min。主轴转向和丝锥旋向要一致)`), `S${Math.round(v.s)} M03`, `G00 Z${gnum(v.safe)}`];
  const first = parsed.holes[0];
  lines.push(`G00 X${gnum(first.x)} Y${gnum(first.y)}`);
  lines.push(`G98 ${code} ${word("Z", v.z)} ${word("R", v.r)} ${word("F", feed)}`);
  for (const hole of parsed.holes.slice(1)) lines.push(`X${gnum(hole.x)} Y${gnum(hole.y)}`);
  lines.push("G80", `G00 Z${gnum(v.safe)}`, "M05", "M30");
  if (lines.some((line) => String(line).includes("null"))) return { error: "数值无效。" };
  return { program: lines.join("\n") };
}
function holeBody(code, title, v, dialect, holes, extra, note) {
  const lines = [...millOpen(`${code} ${title}`, dialect, note), `S${Math.round(v.s)} M03`, `G00 Z${gnum(v.safe)}`];
  lines.push(`G00 X${gnum(holes[0].x)} Y${gnum(holes[0].y)}`);
  lines.push(`G98 ${code} ${word("Z", v.z)} ${word("R", v.r)}${extra} ${word("F", v.f)}`);
  for (const hole of holes.slice(1)) lines.push(`X${gnum(hole.x)} Y${gnum(hole.y)}`);
  lines.push("G80", `G00 Z${gnum(v.safe)}`, "M05", "M30");
  return lines;
}

function draw(item, values, active, holes) {
  const v = mixed(item, values);
  if (item.diagram === "hole" || item.diagram === "peckHole" || item.diagram === "tap" || item.diagram === "shift") {
    return holeSvg(item, v, active, holes);
  }
  if (item.diagram === "rpm" || item.diagram === "vf" || item.diagram === "vfz" || item.diagram === "tapf") return formulaSvg(item, v, active);
  if (item.diagram === "taper") return taperSvg(v, active);
  if (item.diagram === "ik") return ikSvg(v, active, true);
  if (item.diagram === "ij") return ikSvg(v, active, false);
  if (item.diagram === "lead") return leadSvg(v, active);
  if (item.diagram === "cancel") return cancelSvg();
  return latheSvg(item, v, active);
}

function mixed(item, values) {
  const out = {};
  for (const field of item.fields) {
    if (field.type === "select") out[field.id] = values[field.id] || field.def;
    else {
      const n = Number(values[field.id]);
      out[field.id] = Number.isFinite(n) ? n : Number(field.def);
    }
  }
  return out;
}

function latheSvg(item, v, active) {
  const endZ = ["g72", "g74"].includes(item.id) ? (v.z ?? v.z0) : (v.z1 ?? v.z ?? -30);
  const startZ = v.zs ?? 2;
  const stockR = Math.abs(v.xs ?? v.x ?? 40) / 2;
  const finishR = Math.abs(v.x ?? v.x1 ?? v.x0 ?? 30) / 2;
  const smallR = Math.abs(v.x0 ?? finishR * 2) / 2;
  const midR = Math.abs(v.x1 ?? finishR * 2) / 2;
  const rMax = Math.max(stockR, finishR, smallR, midR, 8);
  const map = mapper(Math.min(startZ, endZ, v.zc ?? endZ, v.z ?? endZ), Math.max(startZ, 2), rMax);
  const parts = [openSvg(), axis(map), chuck(map)];
  const yStock = map.y(stockR);
  const xL = map.x(Math.min(startZ, endZ));
  const xR = map.x(Math.max(startZ, endZ, 0));
  parts.push(`<path d="M ${xL} ${map.y(0)} L ${xL} ${yStock} L ${xR} ${yStock} L ${xR} ${map.y(0)} Z" fill="#f7f4ee" stroke="#1c1714" stroke-width="1.4"/>`);
  if (item.id === "g71" || item.id === "g73") {
    const x0 = map.x(0);
    const xMid = map.x(v.zc ?? -25);
    const xEnd = map.x(v.z1 ?? endZ);
    parts.push(`<path d="M ${xR} ${map.y(smallR)} L ${x0} ${map.y(smallR)} L ${xMid} ${map.y(smallR)} L ${xMid} ${map.y(midR)} L ${xEnd} ${map.y(midR)}" fill="none" stroke="#1c1714" stroke-width="1.6"/>`);
    const cutPx = Math.max(map.y(Math.max(stockR - (v.depth || v.reliefU || 1.5), 0)) - map.y(stockR), 36);
    parts.push(dimV(map.x(v.zc ?? -25) + 18, map.y(stockR), map.y(stockR) + cutPx, "U 切深", "depth", active));
    parts.push(dimH(map.x((v.z1 ?? endZ) + (v.wf || 0.1)), map.x(v.z1 ?? endZ), map.y(0) + 22, "W 留量", "wf", active));
    parts.push(dimV(xEnd + 16, map.y(midR), map.y(midR + (v.uf || 0.4) / 2), "U 留量", "uf", active));
    parts.push(dimH(xEnd, xR, 22, "Z", "z1", active));
    parts.push(dimV(xMid + 8, map.y(0), map.y(midR), "X", "x1", active));
  } else if (item.id === "g72") {
    parts.push(dimV(xL + 20, map.y(0), yStock, "X", "xs", active));
    parts.push(dimH(map.x(v.z0 ?? -8), map.x(startZ), map.y(0) + 22, "W 切深", "depth", active));
    parts.push(dimH(xL, xR, 22, "Z", "z0", active));
  } else if (item.id === "g74") {
    parts.push(`<line x1="${map.x(startZ)}" y1="${map.y(0)}" x2="${map.x(endZ)}" y2="${map.y(0)}" stroke="#b8432f" stroke-width="2"/>`);
    const step = Math.max(v.peck || 3, 0.5);
    for (let z = startZ; z > endZ; z -= step) {
      parts.push(`<line x1="${map.x(z)}" y1="${map.y(0) - 8}" x2="${map.x(z)}" y2="${map.y(0) + 8}" stroke="${active === "peck" ? "#b8432f" : "#6b625a"}" stroke-width="${active === "peck" ? 2.4 : 1}"/>`);
    }
    parts.push(dimH(map.x(endZ), map.x(startZ), 28, "Z", "z", active));
    parts.push(label(map.x((startZ + endZ) / 2), map.y(stockR) - 8, "Q 每次", "peck", active));
  } else if (item.id === "g75") {
    const grooveTop = map.y(stockR);
    const grooveBot = map.y(finishR);
    parts.push(`<rect x="${map.x(endZ)}" y="${grooveTop}" width="${Math.max(8, map.x(startZ) - map.x(endZ))}" height="${grooveBot - grooveTop}" fill="#fff" stroke="${active === "x" ? "#b8432f" : "#1c1714"}" stroke-width="${active === "x" ? 2.6 : 1.4}"/>`);
    parts.push(dimV(map.x(endZ) - 16, grooveTop, grooveBot, "X 槽底", "x", active));
    parts.push(dimH(map.x(endZ), map.x(startZ), map.y(0) + 22, "Z", "z", active));
    parts.push(label((map.x(startZ) + map.x(endZ)) / 2, grooveTop - 8, "P / Q", active === "peckX" || active === "peckZ" ? active : "", active));
  } else if (item.id === "g76" || item.id === "g92" || item.id === "g32") {
    const crest = map.y(Math.abs(v.xs) / 2);
    const root = map.y(Math.abs(v.x) / 2);
    parts.push(`<path d="M ${xR - 10} ${crest} L ${xL + 16} ${crest}" fill="none" stroke="#1c1714" stroke-width="1.4"/>`);
    for (let i = 0; i < 8; i++) {
      const x = xR - 24 - i * ((xR - xL - 40) / 7);
      parts.push(`<path d="M ${x} ${crest} l 4 ${root - crest} l 4 ${crest - root}" fill="none" stroke="${active === "height" || active === "pitch" ? "#b8432f" : "#1c1714"}" stroke-width="${active === "height" || active === "pitch" ? 2.4 : 1.2}"/>`);
    }
    parts.push(dimV(xL + 8, root, crest, "牙高", "height", active));
    parts.push(dimH(xL, xR, map.y(0) + 22, "Z", "z", active));
    parts.push(dimV(xR - 8, map.y(0), root, "X", "x", active));
    parts.push(label(xR - 30, 24, "F 螺距", "pitch", active));
  } else {
    const cutStartR = finishR - (v.taper || 0);
    parts.push(`<path d="M ${map.x(startZ)} ${map.y(stockR)} L ${map.x(startZ)} ${map.y(Math.max(cutStartR, 0))} L ${map.x(endZ)} ${map.y(finishR)}" fill="none" stroke="${active === "f" ? "#b8432f" : "#1c1714"}" stroke-width="${active === "f" ? 2.8 : 1.8}"/>`);
    parts.push(dimV(map.x(endZ) - 14, map.y(0), map.y(finishR), "X", "x", active));
    parts.push(dimH(map.x(endZ), map.x(Math.max(startZ, 0)), map.y(0) + 22, "Z", "z", active));
    parts.push(label(map.x(startZ) - 8, map.y(stockR) - 8, "起刀", "xs", active, "end"));
    parts.push(label((map.x(startZ) + map.x(endZ)) / 2, map.y((cutStartR + finishR) / 2) - 8, "R", "taper", active));
  }
  parts.push(label(map.x(startZ), 18, "起刀 Z", "zs", active));
  parts.push("</svg>");
  return parts.join("");
}

function holeSvg(item, v, active, holes) {
  const list = (holes || []).map((hole, index) => ({
    x: Number.isFinite(Number(hole.x)) ? Number(hole.x) : 10 + index * 20,
    y: Number.isFinite(Number(hole.y)) ? Number(hole.y) : 10,
    index,
  }));
  const safe = v.safe ?? 30;
  const r = v.r ?? 2;
  const z = v.z ?? -18;
  const top = 36;
  const surface = 78;
  const bottom = 200;
  const span = Math.max(safe - z, 10);
  const yOf = (level) => surface - ((level - 0) / span) * (surface - top - 8);
  const yZ = Math.min(bottom - 16, surface + (Math.abs(Math.min(z, 0)) / span) * 110);
  const yR = surface - Math.max(8, (Math.max(r, 0) / span) * 40);
  const ySafe = Math.max(16, yOf(safe));
  const peck = v.peck || 0;
  const parts = [openSvg()];
  parts.push(`<path d="M 150 ${surface} H 250 V 210 H 150 Z" fill="#f7f4ee" stroke="#1c1714" stroke-width="1.4"/>`);
  parts.push(`<line x1="168" y1="${ySafe}" x2="232" y2="${ySafe}" stroke="${stroke("safe", active)}" stroke-width="${width("safe", active)}" stroke-dasharray="4 3"/>`);
  parts.push(label(128, ySafe + 4, "安全", "safe", active, "end"));
  parts.push(`<line x1="168" y1="${yR}" x2="246" y2="${yR}" stroke="${stroke("r", active)}" stroke-width="${width("r", active)}"/>`);
  parts.push(label(128, yR + 4, "R", "r", active, "end"));
  parts.push(`<line x1="176" y1="${surface}" x2="176" y2="${yZ}" stroke="${stroke("z", active)}" stroke-width="${width("z", active)}"/>`);
  parts.push(label(176, yZ + 16, "Z", "z", active));
  if (peck > 0) {
    const steps = Math.max(1, Math.min(6, Math.ceil(Math.abs(z) / peck)));
    for (let i = 1; i <= steps; i++) {
      const y = surface + ((yZ - surface) * i) / steps;
      parts.push(`<line x1="170" y1="${y}" x2="194" y2="${y}" stroke="${stroke("peck", active)}" stroke-width="${width("peck", active)}"/>`);
    }
    parts.push(label(210, (surface + yZ) / 2, "Q", "peck", active, "start"));
  }
  if (item.diagram === "tap") parts.push(label(210, (surface + yZ) / 2, "F＝n×P", "pitch", active, "start"));
  if (v.shift) parts.push(label(210, yZ - 10, "Q 让刀", "shift", active, "start"));
  parts.push(label(210, yR - 10, "F", "f", active, "start"));
  const xs = list.map((hole) => hole.x);
  const ys = list.map((hole) => hole.y);
  const minX = Math.min(...xs, 0); const maxX = Math.max(...xs, 10);
  const minY = Math.min(...ys, 0); const maxY = Math.max(...ys, 10);
  list.forEach((hole) => {
    const px = 36 + ((hole.x - minX) / (maxX - minX || 1)) * 70;
    const py = 168 - ((hole.y - minY) / (maxY - minY || 1)) * 70;
    const on = active === `hx${hole.index}` || active === `hy${hole.index}`;
    parts.push(`<circle cx="${px}" cy="${py}" r="${on ? 7 : 5}" fill="none" stroke="${on ? "#b8432f" : "#1c1714"}" stroke-width="${on ? 2.6 : 1.4}"/>`);
    parts.push(`<text x="${px + 8}" y="${py - 6}" font-size="11" fill="${on ? "#b8432f" : "#1c1714"}">${hole.index + 1}</text>`);
  });
  parts.push(`<text x="28" y="228" font-size="12" fill="#6b625a">孔位</text>`);
  parts.push("</svg>");
  return parts.join("");
}

function formulaSvg(item, v, active) {
  const parts = [openSvg()];
  parts.push(`<circle cx="150" cy="120" r="70" fill="none" stroke="${stroke(item.diagram === "rpm" ? "d" : "f", active)}" stroke-width="1.6"/>`);
  parts.push(label(150, 40, item.diagram === "rpm" ? "D" : "进给", item.diagram === "rpm" ? "d" : "f", active));
  parts.push(label(150, 210, item.diagram === "rpm" ? "Vc" : "n", item.diagram === "rpm" ? "vc" : "n", active));
  if (item.id === "vfmill") parts.push(label(250, 120, "z 齿数", "teeth", active, "start"));
  if (item.id === "tapfeed") {
    parts.push(label(250, 100, "n", "n", active, "start"));
    parts.push(label(250, 124, "P", "pitch", active, "start"));
  }
  parts.push(`<text x="150" y="124" text-anchor="middle" font-size="13" fill="#1c1714">${xml(item.title)}</text>`);
  parts.push("</svg>");
  return parts.join("");
}
function taperSvg(v, active) {
  const parts = [openSvg()];
  parts.push(`<path d="M 70 150 L 70 70 L 290 100 L 290 150 Z" fill="#f7f4ee" stroke="#1c1714" stroke-width="1.5"/>`);
  parts.push(dimV(58, 150, 70, "d", "small", active));
  parts.push(dimV(302, 150, 100, "D", "big", active));
  parts.push(dimH(70, 290, 176, "L", "length", active));
  parts.push("</svg>");
  return parts.join("");
}
function ikSvg(v, active, lathe) {
  const parts = [openSvg()];
  const x0 = 80; const y0 = 150; const x1 = 230; const y1 = 90; const cx = 230; const cy = 150;
  parts.push(`<path d="M ${x0} ${y0} A 70 70 0 0 1 ${x1} ${y1}" fill="none" stroke="#1c1714" stroke-width="1.8"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="${active === "xc" || active === "cx" || active === "zc" || active === "cy" ? "#b8432f" : "#1c1714"}"/>`);
  parts.push(label(x0 - 8, y0 + 16, lathe ? "起点 X Z" : "起点", lathe ? "xs" : "x0", active, "end"));
  parts.push(label(x1 + 8, y1, lathe ? "终点" : "终点", lathe ? "xe" : "x1", active, "start"));
  parts.push(label(cx, cy + 22, lathe ? "I  K" : "I  J", lathe ? "xc" : "cx", active));
  parts.push("</svg>");
  return parts.join("");
}
function leadSvg(v, active) {
  const parts = [openSvg()];
  parts.push(`<path d="M 40 120 H 140 V 70 H 320 V 170 H 140 V 120" fill="#f7f4ee" stroke="#1c1714"/>`);
  parts.push(dimH(40, 140, 150, "导入 ≥ 3P", "pitch", active));
  parts.push(label(200, 100, `P ${gnum(v.pitch) || ""}`, "pitch", active));
  parts.push("</svg>");
  return parts.join("");
}
function cancelSvg() {
  return `${openSvg()}<path d="M 150 40 V 150" stroke="#1c1714" stroke-width="1.6"/><polygon points="150,40 144,52 156,52" fill="#1c1714"/><text x="180" y="90" font-size="14" fill="#1c1714">G80 抬刀取消</text></svg>`;
}

function openSvg() {
  return `<svg viewBox="0 0 360 240" class="cycle-svg" role="img">`;
}
function mapper(zMin, zMax, rMax) {
  const padL = 46; const padR = 24; const padT = 28; const padB = 36;
  const zLo = Math.min(zMin, zMax) - 4;
  const zHi = Math.max(zMin, zMax) + 4;
  const zSpan = zHi - zLo || 1;
  const rSpan = Math.max(rMax, 1) * 1.35;
  return {
    x(z) { return padL + ((z - zLo) / zSpan) * (360 - padL - padR); },
    y(r) { return 240 - padB - (Math.max(r, 0) / rSpan) * (240 - padT - padB); },
  };
}
function axis(map) {
  return `<line x1="36" y1="${map.y(0)}" x2="336" y2="${map.y(0)}" stroke="#c8bfb4" stroke-dasharray="3 4"/>`;
}
function chuck(map) {
  const x = 40;
  return `<path d="M ${x} ${map.y(0) - 28} v 56" stroke="#c8bfb4" stroke-width="4"/>`;
}
function stroke(key, active) { return key && key === active ? "#b8432f" : "#1c1714"; }
function width(key, active) { return key && key === active ? 2.8 : 1.3; }
function label(x, y, text, key, active, anchor = "middle") {
  const on = key && key === active;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="12" font-weight="${on ? 700 : 500}" fill="${on ? "#b8432f" : "#1c1714"}">${xml(text)}</text>`;
}
function dimH(x1, x2, y, text, key, active) {
  const on = key === active;
  const left = Math.min(x1, x2); const right = Math.max(x1, x2);
  return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${stroke(key, active)}" stroke-width="${width(key, active)}"/>${label((left + right) / 2, y - 4, text, key, active)}`;
}
function dimV(x, y1, y2, text, key, active) {
  const top = Math.min(y1, y2); const bot = Math.max(y1, y2);
  return `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${stroke(key, active)}" stroke-width="${width(key, active)}"/>${label(x + 4, (top + bot) / 2, text, key, active, "start")}`;
}
function xml(value) {
  return String(value ?? "").replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}
