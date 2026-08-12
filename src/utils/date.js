// 日期工具：统一以「本地时区」计算，避免跨时区 / 夏令时把一天算到前一天的边界问题。
// 各模块只依赖这里的纯函数，不耦合 AppContext 内部实现，便于复用与测试。

export function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function isSameDay(a, b) {
  return localDateStr(a) === localDateStr(b)
}

// 返回从「今天往前 n-1 天」到今天的日期串数组（旧 -> 新），用于周报 / 打卡窗。
export function lastNDates(n) {
  const out = []
  const base = startOfDay(new Date())
  for (let i = n - 1; i >= 0; i--) out.push(localDateStr(addDays(base, -i)))
  return out
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

// 当月 1 号是星期几（0=周日），用于月历补空白格。
export function firstWeekday(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay()
}

export function monthLabel(year, monthIndex) {
  return `${year}年${monthIndex + 1}月`
}
