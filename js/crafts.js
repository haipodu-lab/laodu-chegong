/** 工艺品轮廓。车削：X 为直径，Z 从右端面为 0 向卡盘为负。圆弧按相切构造。 */

const TAU = Math.PI * 2;

function num(v, d = 3) {
  if (!Number.isFinite(v)) return "NaN";
  return Number(v).toFixed(d);
}

function hypot(x, y) { return Math.hypot(x, y); }

function arcBetween(z0, r0, z1, r1, cz, cr) {
  const radius = hypot(z0 - cz, r0 - cr);
  const a0 = Math.atan2(r0 - cr, z0 - cz);
  const a1 = Math.atan2(r1 - cr, z1 - cz);
  let ccw = a1 - a0;
  while (ccw <= 0) ccw += TAU;
  while (ccw > TAU) ccw -= TAU;
  let cw = a1 - a0;
  while (cw >= 0) cw -= TAU;
  while (cw < -TAU) cw += TAU;
  const useCCW = ccw <= Math.abs(cw) + 1e-9;
  return {
    type: "arc", z0, r0, z1, r1, cz, cr, radius,
    ccw: useCCW, sweep: useCCW ? ccw : cw,
  };
}

function line(z0, r0, z1, r1) {
  return { type: "line", z0, r0, z1, r1 };
}

function sampleSegment(seg, n = 24) {
  if (seg.type === "line") return [[seg.z0, seg.r0], [seg.z1, seg.r1]];
  const a0 = Math.atan2(seg.r0 - seg.cr, seg.z0 - seg.cz);
  const pts = [];
  const steps = Math.max(4, n);
  for (let i = 0; i <= steps; i++) {
    const a = a0 + seg.sweep * (i / steps);
    pts.push([seg.cz + seg.radius * Math.cos(a), seg.cr + seg.radius * Math.sin(a)]);
  }
  return pts;
}

function tangentAtEnd(seg) {
  if (seg.type === "line") {
    return normalize(seg.z1 - seg.z0, seg.r1 - seg.r0);
  }
  const rz = seg.z1 - seg.cz;
  const rr = seg.r1 - seg.cr;
  return seg.ccw ? normalize(-rr, rz) : normalize(rr, -rz);
}

function tangentAtStart(seg) {
  if (seg.type === "line") return normalize(seg.z1 - seg.z0, seg.r1 - seg.r0);
  const rz = seg.z0 - seg.cz;
  const rr = seg.r0 - seg.cr;
  return seg.ccw ? normalize(-rr, rz) : normalize(rr, -rz);
}

function normalize(z, r) {
  const h = hypot(z, r) || 1;
  return [z / h, r / h];
}

function tangentsFromPoint(pz, pr, cz, cr, radius) {
  const vx = pz - cz;
  const vy = pr - cr;
  const dist2 = vx * vx + vy * vy;
  const dist = Math.sqrt(dist2);
  if (!(dist > radius + 1e-8)) return [];
  const a = (radius * radius) / dist2;
  const b = (radius * Math.sqrt(dist2 - radius * radius)) / dist2;
  const bx = cz + vx * a;
  const by = cr + vy * a;
  const tx = -vy * b;
  const ty = vx * b;
  return [
    { z: bx + tx, r: by + ty },
    { z: bx - tx, r: by - ty },
  ];
}

function finish(name, kind, length, maxDiameter, segments, extra = {}) {
  return { name, kind, length, maxDiameter, segments, ...extra };
}

export function bullet1(length, diameter, nose) {
  if (!(length > 0) || !(diameter > 0) || !(nose > 0) || nose >= length) return { error: "鼻长要大于 0，并且小于总长。" };
  const R = diameter / 2;
  const rho = (R * R + nose * nose) / (2 * R);
  const cz = -nose;
  const cr = R - rho;
  const arc = arcBetween(0, 0, -nose, R, cz, cr);
  return finish("子弹1", "lathe", length, diameter, [arc, line(-nose, R, -length, R)], { nose });
}

export function bullet2(length, diameter, nose, tail, baseDiameter) {
  if (!(length > nose + tail) || !(diameter > baseDiameter) || !(baseDiameter > 0) || !(nose > 0) || !(tail > 0)) {
    return { error: "鼻长加尾锥要小于总长，底径要小于最大直径。" };
  }
  const R = diameter / 2;
  const Rb = baseDiameter / 2;
  const rf = Math.min(diameter * 0.22, nose * 0.45);
  const cz = -nose;
  const cr = R - rf;
  if (hypot(cz, cr) <= rf) return { error: "圆角太大，锥面无法相切。" };
  const touches = tangentsFromPoint(0, 0, cz, cr, rf).filter((p) => p.r > 0.2 && p.z < -0.5 && p.z > -nose);
  if (!touches.length) return { error: "这段鼻长配不上相切圆角，请把鼻长加长或直径加大。" };
  const p = touches.sort((a, b) => b.r - a.r)[0];
  const shoulderZ = -nose;
  const tailZ = -(length - tail);
  if (!(tailZ < shoulderZ - 0.5)) return { error: "圆柱段没有长度了。" };
  return finish("子弹2", "lathe", length, diameter, [
    line(0, 0, p.z, p.r),
    arcBetween(p.z, p.r, shoulderZ, R, cz, cr),
    line(shoulderZ, R, tailZ, R),
    line(tailZ, R, -length, Rb),
  ], { nose, tail, baseDiameter });
}

function gourdSpheres(length, diameter, smallFrac) {
  const R = diameter / 2;
  const rs = diameter * smallFrac;
  const minL = 2 * rs + 2 * R + diameter * 0.08;
  if (!(length > minL)) return { error: `总长至少约 ${minL.toFixed(1)} mm，两球之间才留得下脖子。` };
  const gap = length - 2 * rs - 2 * R;
  const zs = -rs;
  const zb = zs - rs - gap - R;
  const rho = Math.max(diameter * 0.85, gap * 1.15);
  const k = (rho + rs) ** 2 - (rho + R) ** 2;
  const zc = (k / (zb - zs) + zs + zb) / 2;
  const rc2 = (rho + rs) ** 2 - (zc - zs) ** 2;
  if (rc2 <= 1) return { error: "脖子圆弧没有实解，请加大总长。" };
  const rc = Math.sqrt(rc2);
  const smallTouch = pointOnJoin(zs, 0, rs, zc, rc);
  const bigTouch = pointOnJoin(zb, 0, R, zc, rc);
  const front = { z: 0, r: 0 };
  const back = { z: -length, r: 0 };
  const segments = [
    arcBetween(front.z, front.r, smallTouch.z, smallTouch.r, zs, 0),
    arcBetween(smallTouch.z, smallTouch.r, bigTouch.z, bigTouch.r, zc, rc),
    arcBetween(bigTouch.z, bigTouch.r, back.z, back.r, zb, 0),
  ];
  return { R, rs, segments };
}

function pointOnJoin(cz, cr, radius, oz, or) {
  const dz = oz - cz;
  const dr = or - cr;
  const dist = hypot(dz, dr);
  return { z: cz + (dz / dist) * radius, r: cr + (dr / dist) * radius };
}

export function gourd1(length, diameter) {
  const built = gourdSpheres(length, diameter, 0.22);
  if (built.error) return built;
  return finish("葫芦1", "lathe", length, diameter, built.segments);
}

export function gourd2(length, diameter) {
  const R = diameter / 2;
  const rs = diameter * 0.16;
  const minL = 2 * rs + 2 * R + diameter * 0.35;
  if (!(length > minL)) return { error: `葫芦2 总长至少约 ${minL.toFixed(1)} mm。` };
  const stem = Math.min(diameter * 0.18, length * 0.08);
  const foot = Math.min(diameter * 0.22, length * 0.1);
  const stemR = rs * 0.45;
  const gap = length - stem - foot - 2 * rs - 2 * R;
  const zs = -Math.sqrt(Math.max(0, rs * rs - stemR * stemR));
  const zb = zs - rs - gap - R;
  const rho = Math.max(diameter * 1.15, gap * 1.3);
  const k = (rho + rs) ** 2 - (rho + R) ** 2;
  const zc = (k / (zb - zs) + zs + zb) / 2;
  const rc2 = (rho + rs) ** 2 - (zc - zs) ** 2;
  if (rc2 <= 1) return { error: "细脖子没有实解，请把总长再加大。" };
  const rc = Math.sqrt(rc2);
  const smallTouch = pointOnJoin(zs, 0, rs, zc, rc);
  const bigTouch = pointOnJoin(zb, 0, R, zc, rc);
  const footR = R * 0.62;
  const bigCos = 0.55;
  const bigFoot = { z: zb - R * bigCos, r: R * Math.sqrt(1 - bigCos * bigCos) };
  return finish("葫芦2", "lathe", length, diameter, [
    arcBetween(0, stemR, smallTouch.z, smallTouch.r, zs, 0),
    arcBetween(smallTouch.z, smallTouch.r, bigTouch.z, bigTouch.r, zc, rc),
    arcBetween(bigTouch.z, bigTouch.r, bigFoot.z, bigFoot.r, zb, 0),
    line(bigFoot.z, bigFoot.r, -length + foot * 0.45, footR * 0.72),
    line(-length + foot * 0.45, footR * 0.72, -length, footR),
  ]);
}

export function spinningTop(length, diameter) {
  if (!(length > diameter * 0.9) || !(diameter > 0)) return { error: "陀螺总长要大于直径。" };
  const R = diameter / 2;
  const diskZ = -length * 0.38;
  const nose = -diskZ;
  const rho = (R * R + nose * nose) / (2 * R);
  const handleR = R * 0.22;
  const cr = R - rho;
  const a0 = Math.atan2(0 - cr, 0 - diskZ);
  const target = Math.asin(clamp((handleR - cr) / rho, -1, 1));
  const zHandle = diskZ + rho * Math.cos(target < a0 ? target : Math.PI - target);
  let endZ = zHandle;
  let endR = handleR;
  const candidates = [Math.asin(clamp((handleR - cr) / rho, -1, 1))];
  let best = null;
  for (const base of candidates) {
    for (const ang of [base, Math.PI - base]) {
      const z = diskZ + rho * Math.cos(ang);
      const r = cr + rho * Math.sin(ang);
      if (z < diskZ - 0.5 && r > 0 && Math.abs(r - handleR) < 0.2) {
        if (!best || z < best.z) best = { z, r };
      }
    }
  }
  if (!best) {
    endZ = diskZ - nose * 0.35;
    endR = Math.max(handleR, cr + rho * Math.sin(a0 + 0.9));
  } else {
    endZ = best.z;
    endR = best.r;
  }
  if (endZ <= -length) return { error: "盘面太靠后，请把总长加长。" };
  return finish("陀螺", "lathe", length, diameter, [
    arcBetween(0, 0, diskZ, R, diskZ, cr),
    arcBetween(diskZ, R, endZ, endR, diskZ, cr),
    line(endZ, endR, -length, endR),
  ]);
}

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

export function wineCup(length, diameter) {
  if (!(length > diameter * 1.15)) return { error: "酒杯总长要明显大于杯口直径。" };
  const R = diameter / 2;
  const zb = -length * 0.22;
  if (zb <= -R) return { error: "杯肚放不下，请加大直径或总长。" };
  const rimR = Math.sqrt(Math.max(0, R * R - zb * zb));
  const stemR = R * 0.18;
  const footR = R * 0.78;
  const footZ = -length;
  const stemTopZ = -length * 0.62;
  const touches = tangentsFromPoint(stemTopZ, stemR, zb, 0, R).filter((p) => p.z < zb && p.r > stemR);
  if (!touches.length) return { error: "杯柄接不上杯肚。" };
  const touch = touches.sort((a, b) => a.z - b.z)[0];
  return finish("酒杯", "lathe", length, diameter, [
    arcBetween(0, rimR, zb, R, zb, 0),
    arcBetween(zb, R, touch.z, touch.r, zb, 0),
    line(touch.z, touch.r, stemTopZ, stemR),
    line(stemTopZ, stemR, -length * 0.86, stemR),
    line(-length * 0.86, stemR, footZ, footR),
  ]);
}

export function trophy(length, diameter) {
  if (!(length > diameter * 1.6)) return { error: "奖杯总长要更大一些。" };
  const R = diameter / 2;
  const zb = -length * 0.16;
  const rimR = Math.sqrt(Math.max(0, R * R - zb * zb));
  const stemR = R * 0.16;
  const knopR = R * 0.34;
  const knopZ = -length * 0.58;
  const knopHalf = length * 0.07;
  const rho = -(knopHalf ** 2 + (stemR - knopR) ** 2) / (2 * (stemR - knopR));
  const baseR = R * 0.82;
  const touchCandidates = tangentsFromPoint(knopZ + length * 0.1, stemR, zb, 0, R).filter((p) => p.z < zb - 0.5 && p.r > 0);
  const touch = touchCandidates.sort((a, b) => a.r - b.r)[0];
  if (!touch) return { error: "杯身和柄接不上。" };
  return finish("奖杯", "lathe", length, diameter, [
    arcBetween(0, rimR, zb, R, zb, 0),
    arcBetween(zb, R, touch.z, touch.r, zb, 0),
    line(touch.z, touch.r, knopZ + knopHalf, stemR),
    arcBetween(knopZ + knopHalf, stemR, knopZ, knopR, knopZ, knopR - rho),
    arcBetween(knopZ, knopR, knopZ - knopHalf, stemR, knopZ, knopR - rho),
    line(knopZ - knopHalf, stemR, -length * 0.84, stemR),
    line(-length * 0.84, stemR, -length * 0.84, baseR),
    line(-length * 0.84, baseR, -length, baseR),
  ]);
}

function scaleToCircle(segments, diameter) {
  let max = 0;
  for (const seg of segments) {
    const pts = seg.type === "line"
      ? [[seg.x0, seg.y0], [seg.x1, seg.y1]]
      : sampleXY(seg, 32);
    for (const [x, y] of pts) max = Math.max(max, hypot(x, y));
  }
  if (!(max > 0)) return segments;
  const s = (diameter / 2) / max;
  return segments.map((seg) => scaleSeg(seg, s));
}

function scaleSeg(seg, s) {
  const next = {
    ...seg,
    x0: seg.x0 * s, y0: seg.y0 * s, x1: seg.x1 * s, y1: seg.y1 * s,
  };
  if (seg.type === "arc") {
    next.cx = seg.cx * s;
    next.cy = seg.cy * s;
    next.radius = seg.radius * s;
  }
  return next;
}

function xyArc(x0, y0, x1, y1, cx, cy) {
  const radius = hypot(x0 - cx, y0 - cy);
  const a0 = Math.atan2(y0 - cy, x0 - cx);
  const a1 = Math.atan2(y1 - cy, x1 - cx);
  let ccw = a1 - a0;
  while (ccw <= 0) ccw += TAU;
  let cw = a1 - a0;
  while (cw >= 0) cw -= TAU;
  const useCCW = ccw <= Math.abs(cw);
  return { type: "arc", x0, y0, x1, y1, cx, cy, radius, ccw: useCCW, sweep: useCCW ? ccw : cw };
}

function xyLine(x0, y0, x1, y1) {
  return { type: "line", x0, y0, x1, y1 };
}

export function heart(diameter) {
  if (!(diameter > 0)) return { error: "直径要大于 0。" };
  const cx = 0.9;
  const cy = 0.85;
  const rr = 1.12;
  const lift = Math.sqrt(Math.max(0, rr * rr - cx * cx));
  const cleft = { x: 0, y: cy + lift };
  const theta = -0.55;
  const right = { x: cx + rr * Math.cos(theta), y: cy + rr * Math.sin(theta) };
  const bottom = { x: 0, y: -1.35 };
  const ux = (right.x - cx) / rr;
  const uy = (right.y - cy) / rr;
  const dzx = right.x - bottom.x;
  const dzy = right.y - bottom.y;
  const dist2 = dzx * dzx + dzy * dzy;
  const denom = 2 * (ux * dzx + uy * dzy);
  const s = -dist2 / denom;
  const lcx = right.x + s * ux;
  const lcy = right.y + s * uy;
  const raw = [
    xyArc(bottom.x, bottom.y, right.x, right.y, lcx, lcy),
    xyArc(right.x, right.y, cleft.x, cleft.y, cx, cy),
    xyArc(cleft.x, cleft.y, -right.x, right.y, -cx, cy),
    xyArc(-right.x, right.y, bottom.x, bottom.y, -lcx, lcy),
  ];
  if (raw.some((seg) => !Number.isFinite(seg.radius))) return { error: "心形圆弧没有实解。" };
  const segments = scaleToCircle(raw, diameter);
  return { name: "心形", kind: "mill", diameter, segments };
}

export function star(diameter, innerRatio = 0.382) {
  if (!(diameter > 0) || !(innerRatio > 0.15) || innerRatio >= 0.95) return { error: "内接比要在 0.15 和 0.95 之间。" };
  const R = diameter / 2;
  const inner = R * innerRatio;
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? R : inner;
    const a = -Math.PI / 2 + k * (Math.PI / 5);
    pts.push({ x: rad * Math.cos(a), y: rad * Math.sin(a) });
  }
  const segments = pts.map((p, i) => {
    const n = pts[(i + 1) % pts.length];
    return xyLine(p.x, p.y, n.x, n.y);
  });
  return { name: "五角星", kind: "mill", diameter, segments, outer: pts.filter((_, i) => i % 2 === 0) };
}

export function polygonShape(diameter, sides, acrossFlats) {
  const n = Math.round(sides);
  if (n < 3 || n > 24) return { error: "边数取 3 到 24。" };
  let R = diameter > 0 ? diameter / 2 : 0;
  let D = diameter;
  if (acrossFlats > 0) {
    R = (acrossFlats / 2) / Math.cos(Math.PI / n);
    D = R * 2;
  }
  if (!(R > 0)) return { error: "请填直径或对边。" };
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (k * TAU) / n;
    pts.push({ x: R * Math.cos(a), y: R * Math.sin(a) });
  }
  const segments = pts.map((p, i) => xyLine(p.x, p.y, pts[(i + 1) % n].x, pts[(i + 1) % n].y));
  return { name: "多边形", kind: "mill", diameter: D, sides: n, segments, vertices: pts };
}

export const CRAFTS = [
  { id: "heart", name: "心形", kind: "mill", defaults: { diameter: 40, depth: 1 } },
  { id: "star", name: "五角星", kind: "mill", defaults: { diameter: 40, innerRatio: 0.382, depth: 1 } },
  { id: "polygon", name: "多边形", kind: "mill", defaults: { diameter: 40, acrossFlats: 0, sides: 6, depth: 1 } },
  { id: "bullet1", name: "子弹1", kind: "lathe", defaults: { length: 48, diameter: 12, nose: 18 } },
  { id: "bullet2", name: "子弹2", kind: "lathe", defaults: { length: 56, diameter: 12, nose: 20, tail: 12, baseDiameter: 8 } },
  { id: "gourd1", name: "葫芦1", kind: "lathe", defaults: { length: 80, diameter: 36 } },
  { id: "gourd2", name: "葫芦2", kind: "lathe", defaults: { length: 96, diameter: 34 } },
  { id: "top", name: "陀螺", kind: "lathe", defaults: { length: 46, diameter: 28 } },
  { id: "cup", name: "酒杯", kind: "lathe", defaults: { length: 62, diameter: 32 } },
  { id: "trophy", name: "奖杯", kind: "lathe", defaults: { length: 90, diameter: 30 } },
];

export function buildCraft(id, params) {
  switch (id) {
    case "heart": return heart(params.diameter);
    case "star": return star(params.diameter, params.innerRatio);
    case "polygon": return polygonShape(params.diameter, params.sides, params.acrossFlats);
    case "bullet1": return bullet1(params.length, params.diameter, params.nose);
    case "bullet2": return bullet2(params.length, params.diameter, params.nose, params.tail, params.baseDiameter);
    case "gourd1": return gourd1(params.length, params.diameter);
    case "gourd2": return gourd2(params.length, params.diameter);
    case "top": return spinningTop(params.length, params.diameter);
    case "cup": return wineCup(params.length, params.diameter);
    case "trophy": return trophy(params.length, params.diameter);
    default: return { error: "没有这个零件。" };
  }
}

export function profilePoints(model) {
  if (!model || model.error) return [];
  if (model.kind === "lathe") {
    const pts = [{ z: model.segments[0].z0, x: model.segments[0].r0 * 2 }];
    for (const seg of model.segments) pts.push({ z: seg.z1, x: seg.r1 * 2 });
    return pts;
  }
  const pts = [{ x: model.segments[0].x0, y: model.segments[0].y0 }];
  for (const seg of model.segments) pts.push({ x: seg.x1, y: seg.y1 });
  return pts;
}

export function programFor(model, params) {
  if (!model || model.error) return "";
  if (model.kind === "lathe") return latheProgram(model);
  return millProgram(model, params.depth || 1);
}

function latheProgram(model) {
  const lines = [
    `(${model.name} 车削精车)`,
    `(总长 ${num(model.length)} 最大直径 ${num(model.maxDiameter)})`,
    "G21 G99",
    "G50 S3000",
    "G96 S80 M03",
    "T0101",
    `G00 X${num(model.maxDiameter + 4)} Z2.`,
    `G00 X${num(model.segments[0].r0 * 2)} Z${num(model.segments[0].z0)}`,
  ];
  for (const seg of model.segments) {
    if (seg.type === "line") lines.push(`G01 X${num(seg.r1 * 2)} Z${num(seg.z1)} F0.08`);
    else {
      const g = seg.ccw ? "G03" : "G02";
      const i = seg.cr - seg.r0;
      const k = seg.cz - seg.z0;
      lines.push(`${g} X${num(seg.r1 * 2)} Z${num(seg.z1)} I${num(i)} K${num(k)} F0.08`);
    }
  }
  lines.push(`G00 X${num(model.maxDiameter + 4)}`, "G00 Z2.", "M30");
  return lines.join("\n");
}

function millProgram(model, depth) {
  const first = model.segments[0];
  const ax = first.x0 * 0.82;
  const ay = first.y0 * 0.82;
  const lines = [
    `(${model.name} 铣外形)`,
    `(包络直径 ${num(model.diameter)} 深度 ${num(Math.abs(depth))})`,
    "G21 G17 G90 G94",
    "G00 Z5.",
    "T01 M06",
    "S3000 M03",
    `G00 X${num(ax)} Y${num(ay)}`,
    `G01 Z${num(-Math.abs(depth))} F80`,
    "G41 D01",
    `G01 X${num(first.x0)} Y${num(first.y0)} F120`,
  ];
  for (const seg of model.segments) {
    if (seg.type === "line") lines.push(`G01 X${num(seg.x1)} Y${num(seg.y1)} F120`);
    else {
      const g = seg.ccw ? "G03" : "G02";
      const i = seg.cx - seg.x0;
      const j = seg.cy - seg.y0;
      lines.push(`${g} X${num(seg.x1)} Y${num(seg.y1)} I${num(i)} J${num(j)} F120`);
    }
  }
  lines.push("G40", "G00 Z5.", "M30");
  return lines.join("\n");
}

export function maxRadiusOf(model) {
  let max = 0;
  if (!model?.segments) return 0;
  if (model.kind === "lathe") {
    for (const seg of model.segments) for (const [, r] of sampleSegment(seg)) max = Math.max(max, r);
    return max;
  }
  for (const seg of model.segments) {
    const pts = seg.type === "line"
      ? [[seg.x0, seg.y0], [seg.x1, seg.y1]]
      : sampleXY(seg);
    for (const [x, y] of pts) max = Math.max(max, hypot(x, y));
  }
  return max;
}

function sampleXY(seg, n = 24) {
  const a0 = Math.atan2(seg.y0 - seg.cy, seg.x0 - seg.cx);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + seg.sweep * (i / n);
    pts.push([seg.cx + seg.radius * Math.cos(a), seg.cy + seg.radius * Math.sin(a)]);
  }
  return pts;
}

export function feedsInsideEnvelope(program, model) {
  if (!program || program.includes("NaN") || !model?.segments) return false;
  const moves = cuttingMoves(program);
  const samples = [];
  let prev = { x: 0, y: 0, z: 0 };
  for (const move of moves) {
    if (move.g !== 0) samples.push(...sampleMove(prev, move, model.kind));
    prev = move;
  }
  if (!samples.length) return false;
  if (model.kind === "lathe") {
    const D = model.maxDiameter;
    const L = model.length;
    return samples.every(([x, , z]) => x >= -0.08 && x <= D + 0.08 && z <= 0.08 && z >= -L - 0.08);
  }
  const R = model.diameter / 2 + 0.15;
  return samples.every(([x, y]) => Math.hypot(x, y) <= R);
}

function sampleMove(prev, move, kind) {
  const end = [move.x, move.y, move.z];
  if ((move.g !== 2 && move.g !== 3) || (move.i == null && move.j == null && move.k == null)) return [end];
  const pts = [end];
  if (kind === "lathe") {
    const r0 = prev.x / 2;
    const z0 = prev.z;
    const cr = r0 + move.i;
    const cz = z0 + (move.k || 0);
    const radius = Math.hypot(z0 - cz, r0 - cr);
    const a0 = Math.atan2(r0 - cr, z0 - cz);
    const a1 = Math.atan2(move.x / 2 - cr, move.z - cz);
    const sweep = directedSweep(a0, a1, move.g === 3);
    for (let i = 1; i <= 16; i++) {
      const a = a0 + sweep * (i / 16);
      pts.push([(cr + radius * Math.sin(a)) * 2, 0, cz + radius * Math.cos(a)]);
    }
  } else {
    const cx = prev.x + (move.i || 0);
    const cy = prev.y + (move.j || 0);
    const radius = Math.hypot(prev.x - cx, prev.y - cy);
    const a0 = Math.atan2(prev.y - cy, prev.x - cx);
    const a1 = Math.atan2(move.y - cy, move.x - cx);
    const sweep = directedSweep(a0, a1, move.g === 3);
    for (let i = 1; i <= 16; i++) {
      const a = a0 + sweep * (i / 16);
      pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a), move.z]);
    }
  }
  return pts;
}

function directedSweep(a0, a1, ccw) {
  let sweep = a1 - a0;
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  while (sweep < -Math.PI) sweep += 2 * Math.PI;
  if (ccw && sweep < 0) sweep += 2 * Math.PI;
  if (!ccw && sweep > 0) sweep -= 2 * Math.PI;
  return sweep;
}

export function cuttingMoves(program) {
  const moves = [];
  let x = 0; let y = 0; let z = 0; let mode = null;
  for (const raw of program.split("\n")) {
    const words = {};
    for (const match of raw.matchAll(/([A-Z])\s*(-?\d+(?:\.\d+)?)/g)) words[match[1]] = Number(match[2]);
    if (words.G != null && [0, 1, 2, 3].includes(words.G)) mode = words.G;
    if (mode == null) continue;
    const nx = words.X ?? x;
    const ny = words.Y ?? y;
    const nz = words.Z ?? z;
    if (words.X != null || words.Y != null || words.Z != null) {
      moves.push({ g: mode, x: nx, y: ny, z: nz, i: words.I, j: words.J, k: words.K });
    }
    x = nx; y = ny; z = nz;
  }
  return moves;
}

export function drawSegmentsSVG(model, width = 320, height = 180) {
  if (!model?.segments) return "";
  if (model.kind === "lathe") return drawLathe(model, width, height);
  return drawMill(model, width, height);
}

function drawLathe(model, width, height) {
  const pad = 28;
  const map = (z, r) => {
    const x = pad + ((z - (-model.length)) / model.length) * (width - pad * 2);
    const y = height - pad - (r / (model.maxDiameter / 2)) * (height - pad * 2);
    return [x, y];
  };
  const d = pathFrom(model.segments, (seg) => sampleSegment(seg).map(([z, r]) => map(z, r)));
  const yAxis = map(0, 0)[1];
  const x0 = map(-model.length, 0)[0];
  const x1 = map(0, 0)[0];
  const yMax = map(0, model.maxDiameter / 2)[1];
  return `<svg viewBox="0 0 ${width} ${height}" class="craft-svg">
    <line x1="${x0}" y1="${yAxis}" x2="${x1}" y2="${yAxis}" stroke="#6d645c"/>
    <path d="${d}" fill="none" stroke="#ff3b2f" stroke-width="2"/>
    <line x1="${x0}" y1="${yMax}" x2="${x1}" y2="${yMax}" stroke="#d9d0c4" stroke-dasharray="3 3"/>
    <text x="${(x0 + x1) / 2}" y="${height - 6}" fill="#f3ecdf" font-size="12" text-anchor="middle">总长 ${num(model.length)}</text>
    <text x="8" y="${(yMax + yAxis) / 2}" fill="#f3ecdf" font-size="12">直径 ${num(model.maxDiameter)}</text>
  </svg>`;
}

function drawMill(model, width, height) {
  const pad = 26;
  const R = model.diameter / 2;
  const map = (x, y) => [
    width / 2 + (x / R) * ((width - pad * 2) / 2),
    height / 2 - (y / R) * ((height - pad * 2) / 2),
  ];
  const d = pathFrom(model.segments, (seg) => (seg.type === "line"
    ? [[seg.x0, seg.y0], [seg.x1, seg.y1]]
    : sampleXY(seg)).map(([x, y]) => map(x, y)));
  const c = map(0, 0);
  const rad = (width - pad * 2) / 2;
  return `<svg viewBox="0 0 ${width} ${height}" class="craft-svg">
    <circle cx="${c[0]}" cy="${c[1]}" r="${rad}" fill="none" stroke="#d9d0c4" stroke-dasharray="4 3"/>
    <path d="${d}" fill="none" stroke="#ff3b2f" stroke-width="2"/>
    <text x="${width / 2}" y="${height - 4}" fill="#f3ecdf" font-size="12" text-anchor="middle">直径 ${num(model.diameter)}</text>
  </svg>`;
}

function pathFrom(segments, sampler) {
  let d = "";
  segments.forEach((seg, index) => {
    const pts = sampler(seg);
    pts.forEach(([x, y], i) => {
      if (index === 0 && i === 0) d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
      else d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
  });
  return d;
}

export function segmentsContinuous(segments, tol = 1e-4) {
  for (let i = 0; i < segments.length - 1; i++) {
    const a = segments[i];
    const b = segments[i + 1];
    const ax = a.z1 ?? a.x1;
    const ay = a.r1 ?? a.y1;
    const bx = b.z0 ?? b.x0;
    const by = b.r0 ?? b.y0;
    if (Math.abs(ax - bx) > tol || Math.abs(ay - by) > tol) return false;
  }
  return true;
}

export function closedLoop(segments, tol = 1e-3) {
  const a = segments[0];
  const b = segments[segments.length - 1];
  const x0 = a.x0 ?? a.z0;
  const y0 = a.y0 ?? a.r0;
  const x1 = b.x1 ?? b.z1;
  const y1 = b.y1 ?? b.r1;
  return Math.abs(x0 - x1) <= tol && Math.abs(y0 - y1) <= tol;
}
