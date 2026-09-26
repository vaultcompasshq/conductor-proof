import dayjs from "dayjs";

// The reports module. This is where the approved CSV export work lands.

export function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => String(row[key] ?? "")).join(","));
  }
  return lines.join("\n");
}

export function reportFilename(prefix, date = new Date()) {
  return `${prefix}-${dayjs(date).format("YYYY-MM-DD")}.csv`;
}
