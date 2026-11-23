const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

const ICONS = {
  turn: `<path ${STROKE} d="M3 16h9"/><path ${STROKE} d="M12 16l2.2-3.2h5.3"/><path ${STROKE} d="M13.2 14.2l2.4-4.2 2.6 1.5-2.4 4.2z"/>`,
  groove: `<path ${STROKE} d="M3 16h12V9h4v7"/><path ${STROKE} d="M15 9V5.5"/>`,
  part: `<path ${STROKE} d="M3 16.5h11l1.5-8h5.5v8"/><path ${STROKE} d="M14.5 8.5h2"/>`,
  boring: `<path ${STROKE} d="M4 12h9"/><path ${STROKE} d="M13 12l6-3v6z"/><path ${STROKE} d="M8 9v6"/>`,
  drill: `<path ${STROKE} d="M12 3.5v13"/><path ${STROKE} d="M9.2 6.2 12 3.5l2.8 2.7"/><path ${STROKE} d="M10 9.5l2 1.4 2-1.4M10 12.2l2 1.4 2-1.4"/><path ${STROKE} d="M8.5 19.5h7"/>`,
  endmill: `<path ${STROKE} d="M9 3.5h6v9.5l-3 3.2-3-3.2z"/><path ${STROKE} d="M9 7.2h6M9 10.6h6"/>`,
  ball: `<path ${STROKE} d="M9 3.5h6V11a3 3 0 0 1-6 0z"/><path ${STROKE} d="M9 7.2h6"/>`,
  face: `<path ${STROKE} d="M3.5 9.5h17v4.2h-17z"/><path ${STROKE} d="M7 13.7v2.6M12 13.7v2.6M17 13.7v2.6"/><path ${STROKE} d="M6.2 9.5 7.2 6h2.2l1 3.5M13.4 9.5 14.4 6h2.2l1 3.5"/>`,
  tap: `<path ${STROKE} d="M10 3.5h4v2.2l-1 1.6v8.2l-1 2.8h-0"/><path ${STROKE} d="M10.2 8.2h3.6M10.4 11h3.2M10.6 13.6h2.8"/>`,
  chamfer: `<path ${STROKE} d="M8 4h8l-4 7z"/><path ${STROKE} d="M10.5 15h3M8 19h8"/>`,
  thread: `<path ${STROKE} d="M4 16.5h7.5L18 7"/><path ${STROKE} d="M11.5 16.5 16 9.2"/><path ${STROKE} d="M6 13.2h4"/>`,
};

export function toolFace(record) {
  const op = record.op || "";
  const cls = record.toolClass || "";
  const text = `${record.tool || ""} ${record.notes || ""}`;
  let family = "turn";
  let name = "外圆车刀";
  if (op === "groove") {
    family = "groove";
    name = cls === "carbide_coated" ? "涂层硬质合金切槽刀" : "硬质合金切槽刀";
  } else if (op === "part") {
    family = "part";
    name = cls === "carbide_coated" ? "涂层硬质合金切断刀" : "硬质合金切断刀";
  } else if (op === "drill_lathe" || op === "drill_mill") {
    family = "drill";
    name = cls === "hss_drill" ? "高速钢麻花钻" : "整体硬质合金钻头";
  } else if (op === "ball") {
    family = "ball";
    name = "整体硬质合金球头铣刀";
  } else if (op === "face") {
    family = "face";
    if (cls === "carbide_indexable") name = "可转位面铣刀";
    else if (cls === "hss") name = "高速钢面铣刀";
    else name = "硬质合金面铣刀";
  } else if (op === "chamfer") {
    family = "chamfer";
    name = "倒角铣刀";
  } else if (op === "tap" || op === "tap_form") {
    family = "tap";
    if (cls === "form_tap" || op === "tap_form") name = "挤压丝锥";
    else if (cls === "carbide_tap") name = "硬质合金切削丝锥";
    else name = "高速钢切削丝锥";
  } else if (op === "thread_turn") {
    family = "thread";
    name = "螺纹车刀";
  } else if (op === "end_rough" || op === "end_finish" || op === "side") {
    family = "endmill";
    if (cls === "hss") name = "高速钢立铣刀";
    else if (cls === "solid_carbide") name = "整体硬质合金立铣刀";
    else name = "硬质合金立铣刀";
  } else if (/镗|内孔/.test(text) && /车/.test(op + text)) {
    family = "boring";
    name = cls === "carbide_coated" ? "涂层硬质合金镗刀" : "硬质合金镗刀";
  } else if (cls === "cbn") {
    family = "turn";
    name = "CBN刀片";
  } else if (cls === "ceramic") {
    family = "turn";
    name = "陶瓷刀片";
  } else if (cls === "carbide_coated") {
    family = "turn";
    name = "涂层硬质合金外圆车刀";
  } else {
    family = "turn";
    name = "未涂层硬质合金外圆车刀";
  }
  const suffix = shortIso(record.isoTool);
  return { family, name, suffix, label: suffix ? `${name} ${suffix}` : name };
}

export function toolIcon(family) {
  return `<svg class="tool-ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[family] || ICONS.turn}</svg>`;
}

export function toolNames(records) {
  return [...new Set(records.map((record) => toolFace(record).name))].sort((a, b) => a.localeCompare(b, "zh"));
}

function shortIso(iso) {
  if (!iso) return "";
  return String(iso).replace(/\s+/g, " ").trim();
}
