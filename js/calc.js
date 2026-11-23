/** 与 CheGongCore 相同的计算公式和标准表。纯函数，不访问网络。 */

const PI = Math.PI;
const sind = (d) => Math.sin(d * PI / 180);
const cosd = (d) => Math.cos(d * PI / 180);
const tand = (d) => Math.tan(d * PI / 180);
const asind = (v) => Math.asin(v) * 180 / PI;
const acosd = (v) => Math.acos(v) * 180 / PI;
const atand = (v) => Math.atan(v) * 180 / PI;
const atan2d = (y, x) => Math.atan2(y, x) * 180 / PI;
const hypot = (x, y) => Math.hypot(x, y);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

export function cncNumber(value) {
  if (!Number.isFinite(value)) return "0.";
  let rounded = Math.round(value * 10000) / 10000;
  if (Math.abs(rounded) < 5e-5) rounded = 0;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return `${Math.round(rounded)}.`;
  let text = rounded.toFixed(4);
  while (text.includes(".") && text.endsWith("0")) text = text.slice(0, -1);
  return text;
}

export function rpm(cuttingSpeed, diameter) {
  if (!(cuttingSpeed > 0) || !(diameter > 0)) return null;
  return (1000 * cuttingSpeed) / (PI * diameter);
}
export function cuttingSpeed(rev, diameter) {
  if (!(rev > 0) || !(diameter > 0)) return null;
  return (PI * diameter * rev) / 1000;
}
export function feedPerMinute(feedPerRev, rev) {
  if (!(feedPerRev > 0) || !(rev > 0)) return null;
  return feedPerRev * rev;
}
export function roughnessRa(feedPerRev, noseRadius) {
  if (!(feedPerRev > 0) || !(noseRadius > 0)) return null;
  return (feedPerRev * feedPerRev) / (32 * noseRadius) * 1000;
}
export function machiningMinutes(length, feedMin) {
  if (!(length > 0) || !(feedMin > 0)) return null;
  return length / feedMin;
}

export function externalFillet(diameter, radius, halfAngleDeg, cornerZ = 0) {
  if (!(diameter > 0) || !(radius > 0) || halfAngleDeg < 0 || halfAngleDeg >= 89) return null;
  const a = (halfAngleDeg * PI) / 180;
  const t = (radius * (1 + Math.sin(a))) / Math.cos(a);
  return {
    face: { x: diameter - 2 * t, z: cornerZ },
    surface: { x: diameter - 2 * t * Math.sin(a), z: cornerZ - t * Math.cos(a) },
    center: { x: diameter - 2 * t, z: cornerZ - radius },
    tangentLength: t,
    note: "凸圆角切点。端面切点直径变小，锥面切点沿母线离开尖点。",
  };
}
export function internalFillet(diameter, radius, halfAngleDeg, cornerZ = 0, smallDiameter = null) {
  if (!(diameter > 0) || !(radius > 0) || halfAngleDeg < 0 || halfAngleDeg >= 89) return null;
  const a = (halfAngleDeg * PI) / 180;
  const t = (radius * (1 - Math.sin(a))) / Math.cos(a);
  const face = { x: diameter - 2 * t, z: cornerZ };
  let note = "凹圆角切点。圆心在尖点内侧，两切点到圆心的距离都是 R。";
  if (smallDiameter != null && face.x < smallDiameter - 1e-9) note += " 端面切点直径已小于小径，圆角比台阶大。";
  return {
    face,
    surface: { x: diameter + 2 * t * Math.sin(a), z: cornerZ - t * Math.cos(a) },
    center: { x: diameter - 2 * t, z: cornerZ - radius },
    tangentLength: t,
    note,
  };
}
export function lineCircleIntersections(x1, z1, x2, z2, centerX, centerZ, radius) {
  if (!(radius > 0)) return [];
  const r1 = x1 / 2, r2 = x2 / 2, rc = centerX / 2;
  const dr = r2 - r1, dz = z2 - z1;
  const len2 = dr * dr + dz * dz;
  if (len2 <= 1e-18) return [];
  const fr = r1 - rc, fz = z1 - centerZ;
  const a = len2, b = 2 * (fr * dr + fz * dz), c = fr * fr + fz * fz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < -1e-9) return [];
  const root = disc <= 0 ? 0 : Math.sqrt(disc);
  const point = (t) => ({ x: 2 * (r1 + t * dr), z: z1 + t * dz });
  if (root === 0) return [point(-b / (2 * a))];
  return [point((-b - root) / (2 * a)), point((-b + root) / (2 * a))];
}
export function circleIntersections(x1, z1, r1, x2, z2, r2) {
  if (!(r1 > 0) || !(r2 > 0)) return [];
  const c1r = x1 / 2, c2r = x2 / 2;
  const dr = c2r - c1r, dz = z2 - z1;
  const d = hypot(dr, dz);
  if (d < 1e-12 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return [];
  const a = (d * d + r1 * r1 - r2 * r2) / (2 * d);
  const h2 = r1 * r1 - a * a;
  const h = h2 <= 0 ? 0 : Math.sqrt(h2);
  const mr = c1r + (a * dr) / d;
  const mz = z1 + (a * dz) / d;
  if (h === 0) return [{ x: 2 * mr, z: mz }];
  const pr = -dz * (h / d), pz = dr * (h / d);
  return [
    { x: 2 * (mr + pr), z: mz + pz },
    { x: 2 * (mr - pr), z: mz - pz },
  ];
}

export function metricThread(major, pitch, starts = 1) {
  if (!(major > 0) || !(pitch > 0) || starts < 1) return null;
  const H = (Math.sqrt(3) / 2) * pitch;
  const pitchDiameter = major - 2 * (3 / 8) * H;
  const basicMinor = major - 2 * (5 / 8) * H;
  const externalHeight = (17 / 24) * H;
  const externalMinor = major - 2 * externalHeight;
  const lead = starts * pitch;
  return {
    name: `M${pitchText(major)}×${pitchText(pitch)}`,
    pitch, major, pitchDiameter, basicMinor, externalMinor, externalHeight,
    internalHeight: (5 / 8) * H,
    leadAngleDeg: atand(lead / (PI * pitchDiameter)),
    tapDrill: major - pitch,
    note: "中径、基本小径按 ISO 68-1 / ISO 724。外螺纹牙高 17H/24 用于 G76/G92 半径进刀。推荐攻丝底孔按 d−P。",
  };
}
export function unifiedThread(majorMM, tpi, starts = 1) {
  if (!(majorMM > 0) || !(tpi > 0)) return null;
  const profile = metricThread(majorMM, 25.4 / tpi, starts);
  if (!profile) return null;
  return { ...profile, name: `UN ${majorMM} mm–${tpi} 牙/英寸`, tapDrill: majorMM - 25.4 / tpi, note: "牙型比例与米制 60° 相同（ASME B1.1）。底孔按大径减一个螺距估算。" };
}
export function whitworth(major, pitch, name) {
  if (!(major > 0) || !(pitch > 0)) return null;
  const half = (27.5 * PI) / 180;
  const H = pitch / (2 * Math.tan(half));
  const h = (H * 2) / 3;
  const pitchDiameter = major - h;
  return {
    name, pitch, major, pitchDiameter, basicMinor: major - 2 * h, externalMinor: major - 2 * h,
    externalHeight: h, internalHeight: h, leadAngleDeg: atand(pitch / (PI * pitchDiameter)),
    tapDrill: null, note: "55° 惠氏牙型，牙高 h = 0.640327·P。G 为圆柱管螺纹，密封不靠牙侧。",
  };
}
const TR_AC = [[1.5, 0.15], [2, 0.25], [3, 0.25], [4, 0.25], [5, 0.25], [6, 0.5], [7, 0.5], [8, 0.5], [9, 0.5], [10, 0.5], [12, 0.5], [14, 1], [16, 1], [18, 1], [20, 1], [22, 1], [24, 1], [28, 1], [32, 1], [36, 1], [40, 1], [44, 1]];
export function trapezoidClearance(pitch) {
  const hit = TR_AC.find(([p]) => Math.abs(p - pitch) < 1e-6);
  return hit ? hit[1] : null;
}
export function trapezoidal(major, pitch) {
  const ac = trapezoidClearance(pitch);
  if (!(major > 0) || !(pitch > 0) || ac == null) return null;
  return {
    major, pitch, clearance: ac, pitchDiameter: major - 0.5 * pitch,
    externalHeight: 0.5 * pitch + ac, externalMinor: major - pitch - 2 * ac,
    internalMinor: major - pitch, internalMajor: major + 2 * ac,
  };
}
export function worm(module, starts, pitchDiameter) {
  if (!(module > 0) || starts < 1 || !(pitchDiameter > 0)) return null;
  const axialPitch = PI * module;
  const lead = starts * axialPitch;
  return {
    module, starts, pitchDiameter, axialPitch, lead,
    tipDiameter: pitchDiameter + 2 * module,
    rootDiameter: pitchDiameter - 2.4 * module,
    toothHeight: 2.2 * module,
    leadAngleDeg: atand(lead / (PI * pitchDiameter)),
  };
}
export function infeedPasses(totalRadius, count) {
  if (!(totalRadius > 0) || !(count > 0)) return [];
  const passes = [];
  let previous = 0;
  for (let i = 1; i <= count; i++) {
    const cumulative = totalRadius * Math.sqrt(i / count);
    passes.push({ index: i, incrementalRadius: cumulative - previous, cumulativeRadius: cumulative });
    previous = cumulative;
  }
  return passes;
}
export function recommendedPasses(pitch) {
  if (pitch < 0.8) return 4;
  if (pitch < 1.25) return 5;
  if (pitch < 1.75) return 6;
  if (pitch < 2.5) return 8;
  if (pitch < 4) return 10;
  return 12;
}
export function pitchText(value) {
  if (Math.abs(value - Math.round(value)) < 1e-6) return String(Math.round(value));
  return value.toFixed(3).replace(/0+$/, "");
}

export const metricCoarse = [[1, 0.25], [1.2, 0.25], [1.6, 0.35], [2, 0.4], [2.5, 0.45], [3, 0.5], [3.5, 0.6], [4, 0.7], [5, 0.8], [6, 1], [7, 1], [8, 1.25], [10, 1.5], [12, 1.75], [14, 2], [16, 2], [18, 2.5], [20, 2.5], [22, 2.5], [24, 3], [27, 3], [30, 3.5], [33, 3.5], [36, 4], [39, 4], [42, 4.5], [45, 4.5], [48, 5], [52, 5], [56, 5.5], [60, 5.5], [64, 6], [68, 6]].map(([diameter, pitch]) => ({ diameter, pitch, label: `M${pitchText(diameter)}×${pitchText(pitch)}` }));
export const metricFine = [[4, 0.5], [5, 0.5], [6, 0.75], [8, 0.75], [8, 1], [10, 0.75], [10, 1], [10, 1.25], [12, 1], [12, 1.25], [12, 1.5], [14, 1.5], [16, 1], [16, 1.5], [18, 1.5], [18, 2], [20, 1], [20, 1.5], [20, 2], [22, 1.5], [24, 1.5], [24, 2], [27, 2], [30, 2], [36, 2], [36, 3], [42, 3], [48, 3], [56, 4], [64, 4]].map(([diameter, pitch]) => ({ diameter, pitch, label: `M${pitchText(diameter)}×${pitchText(pitch)}` }));
export const unc = [["1/4-20 UNC", 0.25, 20], ["5/16-18 UNC", 0.3125, 18], ["3/8-16 UNC", 0.375, 16], ["7/16-14 UNC", 0.4375, 14], ["1/2-13 UNC", 0.5, 13], ["9/16-12 UNC", 0.5625, 12], ["5/8-11 UNC", 0.625, 11], ["3/4-10 UNC", 0.75, 10], ["7/8-9 UNC", 0.875, 9], ["1-8 UNC", 1, 8], ["1 1/8-7 UNC", 1.125, 7], ["1 1/4-7 UNC", 1.25, 7], ["1 1/2-6 UNC", 1.5, 6], ["2-4 1/2 UNC", 2, 4.5]].map(([label, majorInch, tpi]) => ({ label, majorInch, tpi, majorMM: majorInch * 25.4 }));
export const unf = [["1/4-28 UNF", 0.25, 28], ["5/16-24 UNF", 0.3125, 24], ["3/8-24 UNF", 0.375, 24], ["7/16-20 UNF", 0.4375, 20], ["1/2-20 UNF", 0.5, 20], ["9/16-18 UNF", 0.5625, 18], ["5/8-18 UNF", 0.625, 18], ["3/4-16 UNF", 0.75, 16], ["7/8-14 UNF", 0.875, 14], ["1-12 UNF", 1, 12], ["1 1/8-12 UNF", 1.125, 12], ["1 1/4-12 UNF", 1.25, 12], ["1 1/2-12 UNF", 1.5, 12]].map(([label, majorInch, tpi]) => ({ label, majorInch, tpi, majorMM: majorInch * 25.4 }));
export const pipeG = [
  ["G1/16", 28, 0.907, 7.723, 7.142, 6.561, 6.8], ["G1/8", 28, 0.907, 9.728, 9.147, 8.566, 8.8],
  ["G1/4", 19, 1.337, 13.157, 12.301, 11.445, 11.8], ["G3/8", 19, 1.337, 16.662, 15.806, 14.95, 15.25],
  ["G1/2", 14, 1.814, 20.955, 19.793, 18.631, 19], ["G5/8", 14, 1.814, 22.911, 21.749, 20.587, 21],
  ["G3/4", 14, 1.814, 26.441, 25.279, 24.117, 24.5], ["G7/8", 14, 1.814, 30.201, 29.039, 27.877, null],
  ["G1", 11, 2.309, 33.249, 31.77, 30.291, null], ["G1 1/8", 11, 2.309, 37.897, 36.418, 34.939, null],
  ["G1 1/4", 11, 2.309, 41.91, 40.431, 38.952, null], ["G1 1/2", 11, 2.309, 47.803, 46.324, 44.845, null],
  ["G1 3/4", 11, 2.309, 53.746, 52.267, 50.788, null], ["G2", 11, 2.309, 59.614, 58.135, 56.656, null],
  ["G2 1/4", 11, 2.309, 65.71, 64.231, 62.752, null], ["G2 1/2", 11, 2.309, 75.184, 73.705, 72.226, null],
  ["G2 3/4", 11, 2.309, 81.534, 80.055, 78.576, null], ["G3", 11, 2.309, 87.884, 86.405, 84.926, null],
  ["G3 1/2", 11, 2.309, 100.33, 98.851, 97.372, null], ["G4", 11, 2.309, 113.03, 111.551, 110.072, null],
  ["G4 1/2", 11, 2.309, 125.73, 124.251, 122.772, null], ["G5", 11, 2.309, 138.43, 136.951, 135.472, null],
  ["G5 1/2", 11, 2.309, 151.13, 149.651, 148.172, null], ["G6", 11, 2.309, 163.83, 162.351, 160.872, null],
].map(([designation, tpi, pitch, major, pitchDiameter, minor, commonTapDrill]) => ({ designation, tpi, pitch, major, pitchDiameter, minor, commonTapDrill }));

export const npt = [
  ["1/16", 0.3125, 27, 0.16], ["1/8", 0.405, 27, 0.1615], ["1/4", 0.54, 18, 0.2278], ["3/8", 0.675, 18, 0.24],
  ["1/2", 0.84, 14, 0.32], ["3/4", 1.05, 14, 0.339], ["1", 1.315, 11.5, 0.4], ["1-1/4", 1.66, 11.5, 0.42],
  ["1-1/2", 1.9, 11.5, 0.42], ["2", 2.375, 11.5, 0.436], ["2-1/2", 2.875, 8, 0.682], ["3", 3.5, 8, 0.766],
  ["3-1/2", 4, 8, 0.821], ["4", 4.5, 8, 0.844], ["5", 5.563, 8, 0.937], ["6", 6.625, 8, 0.958],
  ["8", 8.625, 8, 1.063], ["10", 10.75, 8, 1.21], ["12", 12.75, 8, 1.36],
].map(([designation, outsideDiameterInch, tpi, handTightLengthInch]) => {
  const pitchInch = 1 / tpi;
  const pitchDiameterAtEndInch = outsideDiameterInch - (0.05 * outsideDiameterInch + 1.1) * pitchInch;
  const threadHeightInch = 0.8 * pitchInch;
  return {
    designation, outsideDiameterInch, tpi, handTightLengthInch, pitchInch,
    pitchDiameterAtEndInch,
    pitchDiameterAtHandTightInch: pitchDiameterAtEndInch + 0.0625 * handTightLengthInch,
    effectiveLengthInch: (0.8 * outsideDiameterInch + 6.8) * pitchInch,
    threadHeightInch,
    minorAtEndInch: pitchDiameterAtEndInch - threadHeightInch,
    majorAtEndInch: pitchDiameterAtEndInch + threadHeightInch,
  };
});

export function taper(large, small, length) {
  if (!(large > 0) || small < 0 || !(length > 0) || large < small) return null;
  const delta = large - small;
  return {
    includedAngleDeg: atand(delta / (2 * length)) * 2,
    halfAngleDeg: atand(delta / (2 * length)),
    ratio: delta / length,
    unitRatio: delta === 0 ? Infinity : length / delta,
  };
}
export function decimalToDMS(decimal) {
  const sign = decimal < 0 ? -1 : 1;
  let rest = Math.abs(decimal);
  let degrees = Math.trunc(rest);
  rest = (rest - degrees) * 60;
  let minutes = Math.trunc(rest);
  let seconds = (rest - minutes) * 60;
  if (seconds >= 59.9995) {
    seconds = 0;
    minutes += 1;
    if (minutes >= 60) { minutes = 0; degrees += 1; }
  }
  return { sign, degrees, minutes, seconds };
}
export function dmsToDecimal(sign, degrees, minutes, seconds) {
  const mag = Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600;
  return (sign < 0 ? -1 : 1) * mag;
}

const IT_UPPERS = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];
const IT_TABLE = [
  [3, 4, 6, 10, 14, 25, 40, 60], [4, 5, 8, 12, 18, 30, 48, 75], [4, 6, 9, 15, 22, 36, 58, 90],
  [5, 8, 11, 18, 27, 43, 70, 110], [6, 9, 13, 21, 33, 52, 84, 130], [7, 11, 16, 25, 39, 62, 100, 160],
  [8, 13, 19, 30, 46, 74, 120, 190], [10, 15, 22, 35, 54, 87, 140, 220], [12, 18, 25, 40, 63, 100, 160, 250],
  [14, 20, 29, 46, 72, 115, 185, 290], [16, 23, 32, 52, 81, 130, 210, 320], [18, 25, 36, 57, 89, 140, 230, 360],
  [20, 27, 40, 63, 97, 155, 250, 400],
];
const J_TABLE = [[-2, -4], [-2, -4], [-2, -5], [-3, -6], [-4, -8], [-5, -10], [-7, -12], [-9, -15], [-11, -18], [-13, -21], [-16, -26], [-18, -28], [-20, -32]];
const DEV_UPPERS = [3, 6, 10, 14, 18, 24, 30, 40, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];
const RAW_ROWS = [
  "-270,-140,-60,-20,-14,-6,-2,0|0,2,4,6,10,14,,18,,20,,26",
  "-270,-140,-70,-30,-20,-10,-4,0|1,4,8,12,15,19,,23,,28,,35",
  "-280,-150,-80,-40,-25,-13,-5,0|1,6,10,15,19,23,,28,,34,,42",
  "-290,-150,-95,-50,-32,-16,-6,0|1,7,12,18,23,28,,33,,40,,50",
  "-290,-150,-95,-50,-32,-16,-6,0|1,7,12,18,23,28,,33,39,45,,60",
  "-300,-160,-110,-65,-40,-20,-7,0|2,8,15,22,28,35,,41,47,54,63,73",
  "-300,-160,-110,-65,-40,-20,-7,0|2,8,15,22,28,35,41,48,55,64,75,88",
  "-310,-170,-120,-80,-50,-25,-9,0|2,9,17,26,34,43,48,60,68,80,94,112",
  "-320,-180,-130,-80,-50,-25,-9,0|2,9,17,26,34,43,54,70,81,97,114,136",
  "-340,-190,-140,-100,-60,-30,-10,0|2,11,20,32,41,53,66,87,102,122,144,172",
  "-360,-200,-150,-100,-60,-30,-10,0|2,11,20,32,43,59,75,102,120,146,174,210",
  "-380,-220,-170,-120,-72,-36,-12,0|3,13,23,37,51,71,91,124,146,178,214,258",
  "-410,-240,-180,-120,-72,-36,-12,0|3,13,23,37,54,79,104,144,172,210,254,310",
  "-460,-260,-200,-145,-85,-43,-14,0|3,15,27,43,63,92,122,170,202,248,300,365",
  "-520,-280,-210,-145,-85,-43,-14,0|3,15,27,43,65,100,134,190,228,280,340,415",
  "-580,-310,-230,-145,-85,-43,-14,0|3,15,27,43,68,108,146,210,252,310,380,465",
  "-660,-340,-240,-170,-100,-50,-15,0|4,17,31,50,77,122,166,236,284,350,425,520",
  "-740,-380,-260,-170,-100,-50,-15,0|4,17,31,50,80,130,180,258,310,385,470,575",
  "-820,-420,-280,-170,-100,-50,-15,0|4,17,31,50,84,140,196,284,340,425,520,640",
  "-920,-480,-300,-190,-110,-56,-17,0|4,20,34,56,94,158,218,315,385,475,580,710",
  "-1050,-540,-330,-190,-110,-56,-17,0|4,20,34,56,98,170,240,350,425,525,650,790",
  "-1200,-600,-360,-210,-125,-62,-18,0|4,21,37,62,108,190,268,390,475,590,730,900",
  "-1350,-680,-400,-210,-125,-62,-18,0|4,21,37,62,114,208,294,435,530,660,820,1000",
  "-1500,-760,-440,-230,-135,-68,-20,0|5,23,40,68,126,232,330,490,595,740,920,1100",
  "-1650,-840,-480,-230,-135,-68,-20,0|5,23,40,68,132,252,360,540,660,820,1000,1250",
];
const ES_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const EI_KEYS = ["k", "m", "n", "p", "r", "s", "t", "u", "v", "x", "y", "z"];
const DEV_ROWS = RAW_ROWS.map((line) => {
  const [esText, eiText] = line.split("|");
  const parse = (text) => text.split(",").map((token) => (token === "" ? null : Number(token)));
  const es = {}, ei = {};
  parse(esText).forEach((v, i) => { es[ES_KEYS[i]] = v; });
  parse(eiText).forEach((v, i) => { ei[EI_KEYS[i]] = v; });
  return { es, ei };
});
function bandIndex(nominal, uppers) {
  let lower = 0;
  for (let i = 0; i < uppers.length; i++) {
    if (nominal > lower && nominal <= uppers[i]) return i;
    lower = uppers[i];
  }
  return null;
}
function standardTolerance(nominal, grade) {
  const band = bandIndex(nominal, IT_UPPERS);
  if (band == null || grade < 4 || grade > 11) return null;
  return IT_TABLE[band][grade - 4];
}
export const holeLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "JS", "K", "M", "N", "P", "R", "S", "T", "U", "V", "X", "Y", "Z"];
export const shaftLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "js", "j", "k", "m", "n", "p", "r", "s", "t", "u", "v", "x", "y", "z"];
export function isoZone(nominal, feature, letter, grade) {
  if (!(nominal > 0) || nominal > 500) return { error: "直径要大于 0，并且不超过 500 mm。" };
  if (grade < 5 || grade > 11) return { error: "这里只算 IT5 到 IT11。" };
  const it = standardTolerance(nominal, grade);
  if (it == null) return { error: "直径要大于 0，并且不超过 500 mm。" };
  const key = String(letter).toUpperCase();
  const finish = (upperUm, lowerUm, shown) => ({
    nominal, feature, letter: shown, grade, upper: upperUm / 1000, lower: lowerUm / 1000,
    itMicrometres: it, maximum: nominal + upperUm / 1000, minimum: nominal + lowerUm / 1000,
  });
  if (key === "JS") {
    const half = it / 2;
    return finish(half, -half, feature === "hole" ? "JS" : "js");
  }
  if (key === "J") {
    if (feature !== "shaft" || grade < 5 || grade > 7) return { error: "孔 J 与轴 j 的 IT8 及以上没有统一基本偏差，请查 GB/T 1800.1。" };
    const band = bandIndex(nominal, IT_UPPERS);
    const ei = grade === 7 ? J_TABLE[band][1] : J_TABLE[band][0];
    return finish(ei + it, ei, "j");
  }
  const rowIndex = bandIndex(nominal, DEV_UPPERS);
  if (rowIndex == null) return { error: "直径要大于 0，并且不超过 500 mm。" };
  const row = DEV_ROWS[rowIndex];
  const shaftLetter = key.toLowerCase();
  if (feature === "shaft") {
    if (ES_KEYS.includes(shaftLetter)) {
      if (!(shaftLetter in row.es)) return { error: "没有这个偏差代号。" };
      const es = row.es[shaftLetter];
      if (es == null) return { error: `该尺寸段未规定偏差 ${shaftLetter}。` };
      return finish(es, es - it, shaftLetter);
    }
    if (shaftLetter === "k") {
      const ei = grade >= 4 && grade <= 7 ? (row.ei.k ?? 0) : 0;
      return finish(ei + it, ei, "k");
    }
    if (!(shaftLetter in row.ei)) return { error: "没有这个偏差代号。" };
    const ei = row.ei[shaftLetter];
    if (ei == null) return { error: `该尺寸段未规定偏差 ${shaftLetter}。` };
    return finish(ei + it, ei, shaftLetter);
  }
  if (["A", "B", "C", "D", "E", "F", "G", "H"].includes(key)) {
    const es = row.es[key.toLowerCase()];
    if (es === undefined) return { error: "没有这个偏差代号。" };
    if (es == null) return { error: `该尺寸段未规定偏差 ${key}。` };
    const ei = -es;
    return finish(ei + it, ei, key);
  }
  if (key === "K" && grade > 8 && nominal > 3) return { error: "公称尺寸大于 3 mm 时，K 在 IT9 及更粗没有标准基本偏差。" };
  if (key === "N" && grade > 8 && nominal > 3) return finish(0, -it, "N");
  const shaftKey = key.toLowerCase();
  let baseEI;
  if (shaftKey === "k") baseEI = row.ei.k ?? 0;
  else {
    if (!(shaftKey in row.ei)) return { error: "没有这个偏差代号。" };
    if (row.ei[shaftKey] == null) return { error: `该尺寸段未规定偏差 ${key}。` };
    baseEI = row.ei[shaftKey];
  }
  let es = -baseEI;
  const early = ["K", "M", "N"].includes(key) && grade <= 8;
  const late = ["P", "R", "S", "T", "U", "V", "X", "Y", "Z"].includes(key) && grade <= 7;
  if (nominal > 3 && (early || late)) {
    const prev = standardTolerance(nominal, grade - 1);
    if (prev != null) es += it - prev;
  }
  if (key === "M" && grade === 6 && nominal > 250 && nominal <= 315) es = -9;
  return finish(es, es - it, key);
}

export function hexagonCorners(acrossFlats) {
  return acrossFlats > 0 ? (acrossFlats * 2) / Math.sqrt(3) : null;
}
export function hexagonFlats(acrossCorners) {
  return acrossCorners > 0 ? (acrossCorners * Math.sqrt(3)) / 2 : null;
}
export function squareCorners(acrossFlats) {
  return acrossFlats > 0 ? acrossFlats * Math.SQRT2 : null;
}
export function polygonFromFlats(sides, acrossFlats) {
  if (sides < 3 || !(acrossFlats > 0) || sides % 2) return null;
  return {
    sides, acrossFlats,
    sideLength: acrossFlats * tand(180 / sides),
    acrossCorners: acrossFlats / cosd(180 / sides),
  };
}
export function polygonFromSide(sides, sideLength) {
  if (sides < 3 || !(sideLength > 0)) return null;
  return {
    sides, sideLength,
    acrossCorners: sideLength / sind(180 / sides),
    acrossFlats: sides % 2 === 0 ? sideLength / tand(180 / sides) : null,
  };
}

export const materials = [
  { id: "steel", name: "碳钢", density: 7.85, source: "碳钢估重常用 7.85 g/cm³" },
  { id: "stainless", name: "不锈钢 304", density: 7.93, source: "06Cr19Ni10 常用 7.93 g/cm³" },
  { id: "aluminum", name: "铝", density: 2.7, source: "纯铝及 6061 一类常用 2.70 g/cm³" },
  { id: "brass", name: "黄铜", density: 8.5, source: "普通黄铜估重常用 8.50 g/cm³" },
  { id: "copper", name: "紫铜", density: 8.96, source: "纯铜 8.96 g/cm³" },
  { id: "iron", name: "灰铸铁", density: 7.2, source: "灰铸铁估重常用 7.20 g/cm³" },
  { id: "titanium", name: "钛", density: 4.51, source: "工业纯钛常用 4.51 g/cm³" },
];
export function volumeMM3(shape) {
  const { kind } = shape;
  if (kind === "round") return shape.d > 0 && shape.l > 0 ? (PI / 4) * shape.d * shape.d * shape.l : null;
  if (kind === "tube") return shape.outer > shape.inner && shape.inner >= 0 && shape.l > 0 ? (PI / 4) * (shape.outer ** 2 - shape.inner ** 2) * shape.l : null;
  if (kind === "hex") return shape.s > 0 && shape.l > 0 ? (Math.sqrt(3) / 2) * shape.s * shape.s * shape.l : null;
  if (kind === "square") return shape.side > 0 && shape.l > 0 ? shape.side * shape.side * shape.l : null;
  if (kind === "plate") return shape.t > 0 && shape.w > 0 && shape.l > 0 ? shape.t * shape.w * shape.l : null;
  return null;
}
export function kilograms(shape, density) {
  const volume = volumeMM3(shape);
  if (!(density > 0) || volume == null) return null;
  return (volume * density) / 1_000_000;
}

export function forwardTrig(degrees) {
  const s = sind(degrees), c = cosd(degrees);
  return { sin: s, cos: c, tan: Math.abs(c) < 1e-12 ? null : s / c };
}
export function arcSinDegrees(value) { return value >= -1 && value <= 1 ? asind(value) : null; }
export function arcCosDegrees(value) { return value >= -1 && value <= 1 ? acosd(value) : null; }
export function arcTanDegrees(value) { return atand(value); }
export function trigTable() {
  const rows = [];
  for (let a = 0; a <= 90.0001; a += 5) rows.push({ degrees: a, values: forwardTrig(a) });
  return rows;
}

function packTriangle(a, b, c, A, B, C, note, alternate = null) {
  return { a, b, c, angleA: A, angleB: B, angleC: C, area: 0.5 * b * c * sind(A), note, alternate };
}
function solveSSS(a, b, c, note = "三边，余弦定理。") {
  if (!(a + b > c && a + c > b && b + c > a)) return null;
  const A = acosd(clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1));
  const B = acosd(clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1));
  return packTriangle(a, b, c, A, B, 180 - A - B, note);
}
export function solveTriangle({ a, b, c, A, B, C }) {
  const sides = [a, b, c].filter((v) => v > 0);
  const angles = [A, B, C].filter((v) => v > 0 && v < 180);
  if (sides.length + angles.length !== 3 || sides.length < 1) return null;
  if (a > 0 && b > 0 && c > 0) return solveSSS(a, b, c);
  if (b > 0 && c > 0 && A > 0 && !(B > 0) && !(C > 0)) {
    const opp2 = b * b + c * c - 2 * b * c * cosd(A);
    return opp2 > 0 ? solveSSS(Math.sqrt(opp2), b, c, "两边夹角，余弦定理。") : null;
  }
  if (a > 0 && c > 0 && B > 0 && !(A > 0) && !(C > 0)) {
    const opp2 = a * a + c * c - 2 * a * c * cosd(B);
    return opp2 > 0 ? solveSSS(a, Math.sqrt(opp2), c, "两边夹角，余弦定理。") : null;
  }
  if (a > 0 && b > 0 && C > 0 && !(A > 0) && !(B > 0)) {
    const opp2 = a * a + b * b - 2 * a * b * cosd(C);
    return opp2 > 0 ? solveSSS(a, b, Math.sqrt(opp2), "两边夹角，余弦定理。") : null;
  }
  if (angles.length === 2 && sides.length === 1) {
    let aa = A, bb = B, cc = C;
    const known = [aa, bb, cc].filter((v) => v > 0).reduce((s, v) => s + v, 0);
    if (!(aa > 0)) aa = 180 - known;
    else if (!(bb > 0)) bb = 180 - known;
    else cc = 180 - known;
    if (!(aa > 0 && bb > 0 && cc > 0)) return null;
    const scale = a > 0 ? a / sind(aa) : b > 0 ? b / sind(bb) : c / sind(cc);
    if (!(scale > 0)) return null;
    return packTriangle(scale * sind(aa), scale * sind(bb), scale * sind(cc), aa, bb, cc, "两角一边，先补第三角再用正弦定理。");
  }
  return null;
}

const RELIEF = [
  [0.5, 1.25, 0.7, 1.5, 2, 1, 1.5, 0.8, 0.8, 0.2, 2, 1, 0.3, 0.2],
  [0.75, 1.9, 1, 2.25, 3, 1.5, 2.25, 1.2, 1.2, 0.4, 3, 1.5, 0.3, 0.4],
  [1, 2.5, 1.25, 3, 4, 2, 3, 1.6, 1.6, 0.6, 4, 2, 0.5, 0.5],
  [1.25, 3.2, 1.6, 4, 5, 2.5, 3.75, 2, 2, 0.6, 5, 2.5, 0.5, 0.6],
  [1.5, 3.8, 1.9, 4.5, 6, 3, 4.5, 2.5, 2.3, 0.8, 6, 3, 0.5, 0.8],
  [1.75, 4.3, 2.2, 5.3, 7, 3.5, 5.25, 3, 2.6, 1, 7, 3.5, 0.5, 0.9],
  [2, 5, 2.5, 6, 8, 4, 6, 3.4, 3, 1, 8, 4, 0.5, 1],
  [2.5, 6.3, 3.2, 7.5, 10, 5, 7.5, 4.4, 3.6, 1.2, 10, 5, 0.5, 1.2],
  [3, 7.5, 3.8, 9, 12, 6, 9, 5.2, 4.4, 1.6, 12, 6, 0.5, 1.5],
  [4, 10, 5, 12, 16, 8, 12, 7, 5.7, 2, 16, 8, 0.5, 2],
  [5, 12.5, 6.3, 15, 20, 10, 15, 9, 7, 2.5, 20, 10, 0.5, 2.5],
  [6, 15, 7.5, 18, 24, 12, 18, 11, 8.3, 3.2, 24, 12, 0.5, 3],
].map(([pitch, runoutGeneral, runoutShort, shoulderGeneral, shoulderLong, shoulderShort, externalWidthMax, externalWidthMin, externalDepthOnDiameter, externalRootRadius, internalWidthGeneral, internalWidthShort, internalDepthOnDiameter, internalRootRadius]) => ({
  pitch, runoutGeneral, runoutShort, shoulderGeneral, shoulderLong, shoulderShort, externalWidthMax, externalWidthMin, externalDepthOnDiameter, externalRootRadius, internalWidthGeneral, internalWidthShort, internalDepthOnDiameter, internalRootRadius,
}));
export function threadRelief(pitch) {
  return RELIEF.find((row) => Math.abs(row.pitch - pitch) < 1e-6) || null;
}
export const oRingSections = [[1.8, 2.4], [2.65, 3.6], [3.55, 4.8], [5.3, 7.1], [7, 9.5]];
export function oRing(crossSection, boreOrRod, dynamic, compression = null) {
  const section = oRingSections.find(([d]) => Math.abs(d - crossSection) < 1e-6);
  if (!section || !(boreOrRod > 0)) return null;
  const ratio = compression == null ? (dynamic ? 0.12 : 0.2) : compression;
  if (!(ratio > 0) || ratio >= 0.5) return null;
  const depth = crossSection * (1 - ratio);
  return { crossSection, width: section[1], depth, compression: ratio, pistonGrooveDiameter: boreOrRod - 2 * depth, rodGrooveDiameter: boreOrRod + 2 * depth };
}
export function groovingProgram({ outerDiameter, grooveDiameter, grooveWidth, toolWidth, stepRadius, retract = 0.5, feed, startZ }) {
  if (!(outerDiameter > grooveDiameter) || !(grooveWidth > 0) || !(toolWidth > 0) || !(stepRadius > 0) || !(feed > 0)) return null;
  const radial = Math.ceil((outerDiameter - grooveDiameter) / 2 / stepRadius);
  const axial = Math.ceil(grooveWidth / toolWidth);
  const endZ = startZ - Math.max(grooveWidth - toolWidth, 0);
  const peckUm = Math.round(stepRadius * 2 * 1000);
  const lines = [
    `(切槽 D${outerDiameter.toFixed(3)} 至 ${grooveDiameter.toFixed(3)} 宽 ${grooveWidth.toFixed(3)})`,
    `G00 X${(outerDiameter + 2).toFixed(3)} Z${startZ.toFixed(3)}`,
    `G75 R${Math.max(retract, 0.1).toFixed(3)}`,
    `G75 X${grooveDiameter.toFixed(3)} Z${endZ.toFixed(3)} P${peckUm} Q0 F${feed.toFixed(3)}`,
    `G00 X${(outerDiameter + 2).toFixed(3)}`,
  ];
  return { radialPasses: Math.max(radial, 1), axialPasses: Math.max(axial, 1), program: lines.join("\n") };
}

function macroProgram(title, dialect, lines) {
  const head = dialect === "huazhong" ? `O8001 (${title} 华中)` : `O8001 (${title} FANUC)`;
  return [head, ...lines, "M30"].join("\n");
}
function macroLoop(dialect, condition, body) {
  const open = dialect === "huazhong" ? `WHILE [${condition}]` : `WHILE[${condition}] DO1`;
  const close = dialect === "huazhong" ? "ENDW" : "END1";
  return [open, ...body, close].join("\n");
}
export function macroEllipse(a, b, step, dialect = "fanuc") {
  const start = Math.abs(a), end = -Math.abs(a);
  const dz = step === 0 ? -0.2 : -Math.abs(step);
  return macroProgram("椭圆", dialect, [
    `#1=${cncNumber(a)} (A 沿 Z 的半轴)`,
    `#2=${cncNumber(b)} (B 沿半径的半轴)`,
    `#3=${cncNumber(dz)} (Z 步距，含方向)`,
    `#4=${cncNumber(start)}`,
    `G00 X0 Z[${cncNumber(start + 2)}]`,
    "G01 Z#4 F0.15",
    macroLoop(dialect, `#4 GE [${cncNumber(end)}]`, [
      "#5=#2*SQRT[1-[#4*#4]/[#1*#1]]",
      "G01 X[2*#5] Z#4 F0.15",
      "#4=#4+#3",
    ]),
  ]);
}
export function macroParabola(focal, zStart, zEnd, step, dialect = "fanuc") {
  const dz = step === 0 ? 0.2 : Math.abs(step) * (zEnd < zStart ? -1 : 1);
  const compare = dz < 0 ? "GE" : "LE";
  return macroProgram("抛物线", dialect, [
    `#1=${cncNumber(focal)} (焦距 p)`,
    `#3=${cncNumber(dz)}`,
    `#4=${cncNumber(zStart)}`,
    macroLoop(dialect, `#4 ${compare} [${cncNumber(zEnd)}]`, ["#5=SQRT[2*#1*#4]", "G01 X[2*#5] Z#4 F0.15", "#4=#4+#3"]),
  ]);
}
export function macroSphere(radius, startAngle, endAngle, stepDeg, dialect = "fanuc") {
  const step = stepDeg === 0 ? 2 : Math.abs(stepDeg) * (endAngle < startAngle ? -1 : 1);
  const compare = step < 0 ? "GE" : "LE";
  return macroProgram("球面", dialect, [
    `#1=${cncNumber(radius)} (球半径)`,
    `#3=${cncNumber(step)} (角度步距)`,
    `#4=${cncNumber(startAngle)}`,
    macroLoop(dialect, `#4 ${compare} [${cncNumber(endAngle)}]`, ["#5=#1*SIN[#4]", "#6=#1*COS[#4]", "G01 X[2*#5] Z#6 F0.12", "#4=#4+#3"]),
  ]);
}
export function macroSpiral(startDiameter, endDiameter, lead, turns, dialect = "fanuc") {
  const n = 36;
  const dz = lead / n;
  const total = Math.round(Math.abs(turns) * n);
  return macroProgram("等导程螺旋", dialect, [
    `#1=${cncNumber(startDiameter)}`,
    `#2=${cncNumber(endDiameter)}`,
    `#3=${cncNumber(dz)}`,
    `#7=${total}.`,
    "#4=0",
    "G00 X#1 Z0",
    macroLoop(dialect, "#4 LT #7", ["#5=#1+[#2-#1]*#4/#7", "#6=0-#3*#4", "G01 X#5 Z#6 F0.15", "#4=#4+1"]),
  ]);
}

function stripComments(source) {
  let out = "", depth = 0;
  for (const ch of source) {
    if (ch === "(") { depth++; continue; }
    if (ch === ")" && depth > 0) { depth--; continue; }
    if (depth === 0) out += ch;
  }
  return out;
}
const FUNCS = ["SQRT", "ASIN", "ACOS", "ATAN", "SIN", "COS", "TAN", "ABS", "ROUND", "FIX", "FUP"];
class Reader {
  constructor(text) { this.text = text; this.i = 0; this.failed = false; }
  peek() { return this.i < this.text.length ? this.text[this.i] : ""; }
  adv() { this.i++; }
  skip() { while (this.peek() === " ") this.adv(); }
  parseExpr(stop) { return this.parseAdd(stop); }
  parseAdd(stop) {
    let left = this.parseMul(stop);
    if (!left) return null;
    while (true) {
      this.skip();
      const c = this.peek();
      if (c !== "+" && c !== "-") break;
      this.adv();
      const right = this.parseMul(stop);
      if (!right) return null;
      left = { t: "bin", op: c, l: left, r: right };
    }
    return left;
  }
  parseMul(stop) {
    let left = this.parseUnary(stop);
    if (!left) return null;
    while (true) {
      this.skip();
      const c = this.peek();
      if (c !== "*" && c !== "/") break;
      this.adv();
      const right = this.parseUnary(stop);
      if (!right) return null;
      left = { t: "bin", op: c, l: left, r: right };
    }
    return left;
  }
  parseUnary(stop) {
    this.skip();
    if (this.peek() === "+") { this.adv(); return this.parseUnary(stop); }
    if (this.peek() === "-") { this.adv(); const v = this.parseUnary(stop); return v ? { t: "neg", v } : null; }
    return this.parsePrimary();
  }
  parsePrimary() {
    this.skip();
    if (this.peek() === "[") {
      this.adv();
      const inner = this.parseExpr(false);
      this.skip();
      if (this.peek() !== "]") return null;
      this.adv();
      return inner;
    }
    if (this.peek() === "#") {
      this.adv();
      if (this.peek() === "[") {
        this.adv();
        const inner = this.parseExpr(false);
        if (!inner || this.peek() !== "]") return null;
        this.adv();
        return { t: "vdyn", v: inner };
      }
      const n = this.readInt();
      return n == null ? null : { t: "var", n };
    }
    const name = this.readFunc();
    if (name) {
      this.skip();
      if (this.peek() !== "[") return null;
      this.adv();
      const arg = this.parseExpr(false);
      this.skip();
      if (!arg || this.peek() !== "]") return null;
      this.adv();
      if (name === "ATAN") {
        const saved = this.i;
        this.skip();
        if (this.peek() === "/") {
          this.adv(); this.skip();
          if (this.peek() === "[") {
            this.adv();
            const arg2 = this.parseExpr(false);
            if (arg2 && this.peek() === "]") { this.adv(); return { t: "atan2", y: arg, x: arg2 }; }
          }
        }
        this.i = saved;
      }
      return { t: "call", name, arg };
    }
    const num = this.readNumber();
    return num == null ? null : { t: "num", n: num };
  }
  readFunc() {
    for (const name of FUNCS) {
      if (this.text.startsWith(name, this.i)) { this.i += name.length; return name; }
    }
    return null;
  }
  readInt() {
    const s = this.i;
    while (/\d/.test(this.peek())) this.adv();
    if (this.i === s) return null;
    return Number(this.text.slice(s, this.i));
  }
  readNumber() {
    const s = this.i;
    if (this.peek() === "+" || this.peek() === "-") this.adv();
    let saw = false;
    while (/\d/.test(this.peek())) { saw = true; this.adv(); }
    if (this.peek() === ".") {
      this.adv();
      while (/\d/.test(this.peek())) { saw = true; this.adv(); }
    }
    if (!saw) { this.i = s; return null; }
    return Number(this.text.slice(s, this.i));
  }
  parseWords() {
    const words = [];
    while (true) {
      this.skip();
      const c = this.peek();
      if (!/[A-Z]/.test(c)) break;
      this.adv();
      const expr = this.parseExpr(true);
      if (!expr) { this.failed = true; break; }
      words.push({ letter: c, expr });
    }
    return words;
  }
  parseCondition() {
    const left = this.parseExpr(false);
    if (!left) return null;
    this.skip();
    const ops = [["EQ", "eq"], ["NE", "ne"], ["GE", "ge"], ["GT", "gt"], ["LE", "le"], ["LT", "lt"]];
    const found = ops.find(([name]) => this.text.startsWith(name, this.i));
    if (!found) return null;
    this.i += found[0].length;
    const right = this.parseExpr(false);
    return right ? { left, op: found[1], right } : null;
  }
}
function matchingBracket(line, open) {
  let depth = 0;
  for (let i = open; i < line.length; i++) {
    if (line[i] === "[") depth++;
    if (line[i] === "]") { depth--; if (depth === 0) return i; }
  }
  return -1;
}
function parseAssign(text) {
  if (!text.startsWith("#")) return null;
  const reader = new Reader(text.slice(1));
  const indexExpr = reader.parseExpr(false);
  reader.skip();
  if (!indexExpr || reader.peek() !== "=") return null;
  reader.adv();
  const value = reader.parseExpr(false);
  return value ? { t: "assign", indexExpr, value } : null;
}
function parseProgram(rawLines) {
  const instructions = [];
  const errors = [];
  const whileStack = [];
  for (let raw0 of rawLines) {
    const raw = raw0.trim();
    if (!raw || raw === "%") continue;
    let line = raw.toUpperCase();
    if (/^O\d+$/.test(line)) continue;
    if (line.startsWith("END")) {
      const start = whileStack.pop();
      if (start == null) { errors.push(`${line} 没有对应的 WHILE`); continue; }
      instructions.push({ t: "end", start });
      instructions[start].end = instructions.length - 1;
      continue;
    }
    if (line.startsWith("WHILE")) {
      const open = line.indexOf("[");
      const close = open >= 0 ? matchingBracket(line, open) : -1;
      const reader = new Reader(close > open ? line.slice(open + 1, close) : "");
      const cond = reader.parseCondition();
      if (!cond) { errors.push(`无法识别 WHILE：${raw}`); continue; }
      whileStack.push(instructions.length);
      instructions.push({ t: "while", cond, end: instructions.length });
      continue;
    }
    if (line.startsWith("IF")) {
      const open = line.indexOf("[");
      const close = open >= 0 ? matchingBracket(line, open) : -1;
      if (close < 0) { errors.push(`无法识别 IF：${raw}`); continue; }
      const reader = new Reader(line.slice(open + 1, close));
      const cond = reader.parseCondition();
      const rest = line.slice(close + 1).trim();
      if (!cond) { errors.push(`无法识别 IF：${raw}`); continue; }
      if (rest.startsWith("GOTO")) {
        const n = Number(rest.slice(4).replace(/\D/g, "")) || -1;
        instructions.push({ t: "goto", cond, target: n });
      } else if (rest.startsWith("THEN")) {
        const assign = parseAssign(rest.slice(4).trim());
        if (assign) instructions.push({ t: "ifthen", cond, indexExpr: assign.indexExpr, value: assign.value });
        else errors.push(`无法识别 IF：${raw}`);
      } else errors.push(`无法识别 IF：${raw}`);
      continue;
    }
    if (line.startsWith("N")) {
      const m = /^N(\d+)\s*(.*)$/.exec(line);
      if (m) {
        instructions.push({ t: "label", n: Number(m[1]) });
        line = m[2].trim();
        if (!line) continue;
      }
    }
    if (line.startsWith("#")) {
      const assign = parseAssign(line);
      if (assign) instructions.push(assign);
      else errors.push(`无法识别赋值：${raw}`);
      continue;
    }
    const reader = new Reader(line);
    const words = reader.parseWords();
    if (reader.failed) errors.push(`无法识别程序段：${raw}`);
    else if (words.length) instructions.push({ t: "block", words });
  }
  if (whileStack.length) errors.push("WHILE 没有 END");
  const labels = {};
  instructions.forEach((inst, pc) => { if (inst.t === "label") labels[inst.n] = pc; });
  return { instructions, labels, errors };
}
function evalExpr(expr, vars) {
  if (!expr) return 0;
  if (expr.t === "num") return expr.n;
  if (expr.t === "var") return vars[expr.n] ?? 0;
  if (expr.t === "vdyn") return vars[Math.round(evalExpr(expr.v, vars))] ?? 0;
  if (expr.t === "neg") return -evalExpr(expr.v, vars);
  if (expr.t === "bin") {
    const a = evalExpr(expr.l, vars), b = evalExpr(expr.r, vars);
    if (expr.op === "+") return a + b;
    if (expr.op === "-") return a - b;
    if (expr.op === "*") return a * b;
    return b === 0 ? 0 : a / b;
  }
  if (expr.t === "atan2") return atan2d(evalExpr(expr.y, vars), evalExpr(expr.x, vars));
  const v = evalExpr(expr.arg, vars);
  switch (expr.name) {
    case "SIN": return sind(v);
    case "COS": return cosd(v);
    case "TAN": return tand(v);
    case "SQRT": return v < 0 ? 0 : Math.sqrt(v);
    case "ABS": return Math.abs(v);
    case "ASIN": return asind(clamp(v, -1, 1));
    case "ACOS": return acosd(clamp(v, -1, 1));
    case "ATAN": return atand(v);
    case "ROUND": return Math.round(v);
    case "FIX": return Math.trunc(v);
    case "FUP": return v < 0 ? Math.floor(v) : Math.ceil(v);
    default: return 0;
  }
}
function truth(cond, vars) {
  const l = evalExpr(cond.left, vars), r = evalExpr(cond.right, vars);
  if (cond.op === "eq") return Math.abs(l - r) < 1e-9;
  if (cond.op === "ne") return Math.abs(l - r) >= 1e-9;
  if (cond.op === "gt") return l > r;
  if (cond.op === "ge") return l >= r - 1e-12;
  if (cond.op === "lt") return l < r;
  return l <= r + 1e-12;
}
function arcSamples(fromX, fromZ, toX, toZ, words, clockwise) {
  const r0 = fromX / 2, r1 = toX / 2;
  let cr, cz;
  if ("R" in words) {
    const radius = words.R;
    const dr = r1 - r0, dz = toZ - fromZ;
    const d = hypot(dr, dz);
    const ar = Math.abs(radius);
    if (d < 1e-9 || d > 2 * ar + 1e-6) return [{ x: toX, z: toZ }];
    const h = Math.sqrt(Math.max(0, ar * ar - (d / 2) ** 2));
    const len = Math.max(d, 1e-12);
    let ox = (dz / len) * h, oz = (-dr / len) * h;
    if (radius < 0) { ox = -ox; oz = -oz; }
    const mr = (r0 + r1) / 2, mz = (fromZ + toZ) / 2;
    cr = clockwise ? mr + ox : mr - ox;
    cz = clockwise ? mz + oz : mz - oz;
  } else if ("I" in words && "K" in words) {
    cr = r0 + words.I; cz = fromZ + words.K;
  } else return [{ x: toX, z: toZ }];
  const a0 = Math.atan2(fromZ - cz, r0 - cr);
  const a1 = Math.atan2(toZ - cz, r1 - cr);
  let sweep = a1 - a0;
  if (clockwise) { if (sweep > 0) sweep -= 2 * PI; }
  else if (sweep < 0) sweep += 2 * PI;
  const radius = hypot(r0 - cr, fromZ - cz);
  const count = Math.max(8, Math.ceil(Math.abs(sweep) / (PI / 12)));
  const points = [];
  for (let step = 1; step <= count; step++) {
    const a = a0 + sweep * (step / count);
    points.push({ x: 2 * (cr + radius * Math.cos(a)), z: cz + radius * Math.sin(a) });
  }
  points[points.length - 1] = { x: toX, z: toZ };
  return points;
}
export function expandMacro(source, maxSteps = 20000) {
  const parsed = parseProgram(stripComments(source).split(/\r?\n/));
  const vars = {};
  const lines = [];
  const segments = [];
  const errors = parsed.errors.slice();
  let x = 0, z = 0, has = false, steps = 0, pc = 0;
  const code = parsed.instructions;
  while (pc < code.length && steps < maxSteps) {
    steps++;
    const inst = code[pc];
    if (inst.t === "assign") { vars[Math.round(evalExpr(inst.indexExpr, vars))] = evalExpr(inst.value, vars); pc++; }
    else if (inst.t === "while") pc = truth(inst.cond, vars) ? pc + 1 : inst.end + 1;
    else if (inst.t === "end") pc = inst.start;
    else if (inst.t === "goto") {
      if (truth(inst.cond, vars)) {
        if (parsed.labels[inst.target] != null) pc = parsed.labels[inst.target];
        else { errors.push(`GOTO ${inst.target} 找不到 N${inst.target}`); pc++; }
      } else pc++;
    } else if (inst.t === "ifthen") {
      if (truth(inst.cond, vars)) vars[Math.round(evalExpr(inst.indexExpr, vars))] = evalExpr(inst.value, vars);
      pc++;
    } else if (inst.t === "label") pc++;
    else if (inst.t === "block") {
      const map = {};
      for (const word of inst.words) map[word.letter] = evalExpr(word.expr, vars);
      lines.push(inst.words.map((word) => word.letter + cncNumber(map[word.letter] ?? 0)).join(" "));
      const g = map.G;
      const codeN = g == null ? null : Math.round(g);
      if ([0, 1, 2, 3].includes(codeN)) {
        const nextX = map.X ?? x, nextZ = map.Z ?? z;
        if (!has) { x = nextX; z = nextZ; has = true; }
        else if (codeN === 0 || codeN === 1) {
          segments.push({ x0: x, z0: z, x1: nextX, z1: nextZ, rapid: codeN === 0 });
          x = nextX; z = nextZ;
        } else {
          let px = x, pz = z;
          for (const point of arcSamples(x, z, nextX, nextZ, map, codeN === 2)) {
            segments.push({ x0: px, z0: pz, x1: point.x, z1: point.z, rapid: false });
            px = point.x; pz = point.z;
          }
          x = nextX; z = nextZ;
        }
      }
      pc++;
    } else pc++;
  }
  if (steps >= maxSteps) errors.push(`超过最大展开步数 ${maxSteps}，已停止。`);
  return { lines, segments, variables: vars, errors };
}

function g(system, code, title, detail) { return { system, kind: "G", code, title, detail, id: system + code + kindSafe(detail) }; }
function m(system, code, title, detail) { return { system, kind: "M", code, title, detail, id: system + "M" + code }; }
function kindSafe() { return ""; }
export const gcodeEntries = [
  g("FANUC", "G00", "快速定位", "各轴以快移速度走到目标。车削里不要用 G00 切到材料。"),
  g("FANUC", "G01", "直线插补", "F 为进给。G99 时 F 是 mm/r，G98 时 F 是 mm/min。"),
  g("FANUC", "G02", "顺时针圆弧", "G18 平面。R 为半径；I、K 为圆心相对起点的增量，I 按半径写。"),
  g("FANUC", "G03", "逆时针圆弧", "方向按从 +Y 看 XZ 平面。走刀方向不同，G02/G03 会互换。"),
  g("FANUC", "G04", "暂停", "G04 X1. 或 G04 P1000。X 多为秒，P 多为毫秒，以机床参数为准。"),
  g("FANUC", "G18", "XZ 平面", "数控车床默认平面。"),
  g("FANUC", "G20", "英制", "与 G21 同组。不要和粗车循环 G71 搞混。"),
  g("FANUC", "G21", "公制", "毫米输入。国内车床绝大多数用 G21。"),
  g("FANUC", "G28", "回参考点", "G28 U0 W0 先经中间点再回零。"),
  g("FANUC", "G32", "单行程螺纹", "F 为导程。普通螺纹优先 G92 或 G76。"),
  g("FANUC", "G40", "取消刀尖补偿", "换刀前取消 G41/G42。"),
  g("FANUC", "G41", "刀尖半径左补偿", "沿进给方向看，刀尖在工件左侧。"),
  g("FANUC", "G42", "刀尖半径右补偿", "外圆从右往左车、后置刀架时常用 G42。"),
  g("FANUC", "G50", "坐标系 / 最高转速", "G50 X_ Z_ 设刀位；G50 S2000 限制恒线速最高转速。"),
  g("FANUC", "G54", "工件坐标系", "G54–G59。和 G50 不要重复叠加。"),
  g("FANUC", "G70", "精车循环", "系统 A：G70 P_ Q_，跟在 G71/G72 后面。"),
  g("FANUC", "G71", "轴向粗车循环", "系统 A：先纵向去除余量。"),
  g("FANUC", "G72", "端面粗车循环", "余量主要在端面上时用。"),
  g("FANUC", "G73", "封闭轮廓循环", "仿形、铸锻件。"),
  g("FANUC", "G74", "端面啄式钻孔", "也用于端面切槽。和铣床 G74 不是一回事。"),
  g("FANUC", "G75", "径向啄式切槽", "G75 R 退刀；下一行 X Z P Q F。P、Q 通常是 μm。"),
  g("FANUC", "G76", "螺纹复合循环", "牙高 P 是半径值，单位 μm。"),
  g("FANUC", "G90", "外圆/内孔单一循环", "系统 A。系统 B 里 G90 常常是绝对编程。"),
  g("FANUC", "G92", "螺纹单一循环", "系统 A：G92 X Z F。系统 B 的 G92 可能是坐标系。"),
  g("FANUC", "G94", "端面单一循环", "系统 A。锥端面用 R。"),
  g("FANUC", "G96", "恒线速", "G96 S120 表示 120 m/min。务必配 G50 S 限速。"),
  g("FANUC", "G97", "恒转速", "车螺纹必须用 G97。"),
  g("FANUC", "G98", "每分钟进给", "系统 A：F 为 mm/min。"),
  g("FANUC", "G99", "每转进给", "系统 A：F 为 mm/r。车床默认多用这个。"),
  m("FANUC", "M00", "程序停止", "按循环启动才继续。"),
  m("FANUC", "M01", "选择停止", "面板上的选择停止打开时才停。"),
  m("FANUC", "M03", "主轴正转", "方向以厂家为准。"),
  m("FANUC", "M04", "主轴反转", "左旋螺纹或反车时用。"),
  m("FANUC", "M05", "主轴停止", ""),
  m("FANUC", "M08", "切削液开", ""),
  m("FANUC", "M09", "切削液关", ""),
  m("FANUC", "M10", "卡盘夹紧", "有的机床相反，以梯形图为准。"),
  m("FANUC", "M11", "卡盘松开", "和 M10 成对。"),
  m("FANUC", "M30", "程序结束并复位", "回到程序头。"),
  m("FANUC", "M98", "调用子程序", "M98 P 子程序号。"),
  m("FANUC", "M99", "子程序结束", "在主程序里会回到开头。"),
  g("华中", "G00", "快速定位", "与 FANUC 相同。"),
  g("华中", "G01", "直线插补", "与 FANUC 相同。"),
  g("华中", "G02", "顺时针圆弧", "R 或 I、K。"),
  g("华中", "G03", "逆时针圆弧", "仍要按刀架方向确认。"),
  g("华中", "G04", "暂停", "G04 P 很多版本以毫秒计。"),
  g("华中", "G32", "螺纹切削", "单段螺纹，F 为导程。"),
  g("华中", "G40", "取消刀尖补偿", ""),
  g("华中", "G41", "刀尖半径左补偿", ""),
  g("华中", "G42", "刀尖半径右补偿", ""),
  g("华中", "G54", "工件坐标系", "G54–G59。华中的 G92 常常是坐标系，不是螺纹。"),
  g("华中", "G71", "轴向粗车复合循环", "参数顺序和 FANUC 不完全一样。"),
  g("华中", "G72", "径向粗车复合循环", "端面方向去除余量。"),
  g("华中", "G73", "闭环车削复合循环", "铸锻件仿形。"),
  g("华中", "G76", "螺纹复合循环", "有，但参数排列随版本变化。"),
  g("华中", "G80", "内/外圆切削循环", "相当于 FANUC 系统 A 的 G90。"),
  g("华中", "G81", "端面切削循环", "相当于 FANUC 系统 A 的 G94。"),
  g("华中", "G82", "螺纹切削循环", "相当于 FANUC 系统 A 的 G92。"),
  g("华中", "G90", "绝对编程", "华中的 G90 不是单一车削循环。"),
  g("华中", "G91", "增量编程", ""),
  g("华中", "G92", "设定工件坐标系", "螺纹循环用 G82。"),
  g("华中", "G94", "每分钟进给", "华中用 G94/G95，不是 FANUC 的 G98/G99。"),
  g("华中", "G95", "每转进给", "车削常用。"),
  g("华中", "G96", "恒线速", "配合限速使用。"),
  g("华中", "G97", "恒转速", "车螺纹用 G97。"),
  m("华中", "M00", "程序停止", ""),
  m("华中", "M03", "主轴正转", ""),
  m("华中", "M04", "主轴反转", ""),
  m("华中", "M05", "主轴停止", ""),
  m("华中", "M08", "切削液开", ""),
  m("华中", "M09", "切削液关", ""),
  m("华中", "M30", "程序结束", "复位到开头。"),
  m("华中", "M98", "调用子程序", ""),
  m("华中", "M99", "子程序返回", ""),
].map((item, index) => ({ ...item, id: `${item.system}-${item.kind}-${item.code}-${index}` }));

export function filterGCode(system, kind, query) {
  const q = query.trim().toLowerCase();
  return gcodeEntries.filter((item) => {
    if (system && item.system !== system) return false;
    if (kind && item.kind !== kind) return false;
    if (!q) return true;
    return (item.code + item.title + item.detail).toLowerCase().includes(q);
  });
}

export function lerp(xs, ys, x) {
  if (!xs?.length) return null;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1];
}
export function midRange(pair) {
  if (!pair || pair.length < 2 || pair[0] == null || pair[1] == null) return null;
  return (Number(pair[0]) + Number(pair[1])) / 2;
}
export function filterRecords(records, { machine = "all", op = "", mat = "", tool = "", q = "" } = {}, materials = [], ops = []) {
  const query = q.trim().toLowerCase();
  const matName = (id) => materials.find((m) => m.id === id);
  const opName = (id) => ops.find((o) => o.id === id);
  return records.filter((record) => {
    if (machine !== "all" && record.machine !== machine) return false;
    if (op && record.op !== op) return false;
    if (mat && record.mat !== mat) return false;
    if (tool && record.toolClass !== tool) return false;
    if (!query) return true;
    const material = matName(record.mat) || {};
    const operation = opName(record.op) || {};
    const hay = [material.name, material.aliases, material.equiv, material.iso, material.group, operation.name, record.tool, record.toolClass, record.isoTool, record.notes, record.stage, record.source].join(" ").toLowerCase();
    return hay.includes(query);
  });
}
export function suggestCutting(record, diameter, { teeth = 4, fzTable = null, fzDc = null } = {}) {
  const vc = midRange(record.vc);
  if (!(vc > 0) || !(diameter > 0)) return null;
  let useD = diameter;
  let deff = null;
  if (record.op === "ball" && record.ap) {
    const ap = Math.min(midRange(record.ap) || record.ap[0], diameter / 2);
    deff = 2 * Math.sqrt(ap * (diameter - ap));
    if (deff > 0) useD = deff;
  }
  const n = rpm(vc, useD);
  let feedRev = null;
  let fz = null;
  if (record.feedType === "fz") {
    if (record.fzCode && fzTable && fzDc) fz = lerp(fzDc, fzTable[record.fzCode], diameter);
    else if (record.fz) fz = midRange(record.fz);
    feedRev = fz != null ? fz * teeth : null;
  } else if (record.feedByD?.length) {
    feedRev = lerp(record.feedByD.map((item) => item.d), record.feedByD.map((item) => item.f), diameter);
  } else if (record.f) feedRev = midRange(record.f);
  return {
    vc, rpm: n, deff,
    feedPerRev: feedRev,
    fz,
    feedPerMinute: feedRev != null ? feedRev * n : null,
  };
}

export const standardsSummary = "公差：ISO 286-1 / GB/T 1800.1。普通螺纹：ISO 68-1、ISO 724。统一螺纹：ASME B1.1。G：ISO 228-1。Rc：ISO 7-1。NPT：ASME B1.20.1。梯形：GB/T 5796.1。退刀槽：GB/T 3-1997。切削用量见每条记录的来源。数值仅供参考，上车前必须实测。";
