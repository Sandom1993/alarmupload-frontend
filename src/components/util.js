/**
 *将时间转换为带本地时区的格式
 *@param{String|Date}dt可以作为 new Date() 参数的字符串或 Date 对象
 */
export function toTimezoneString (dt) {
  const date = new Date(dt)
  if (date.toString() === 'Invalid Date') {
    return ''
  }
  // UTC+8 会返回 -480
  const tzo = date.getTimezoneOffset()
  const tzSign = tzo > 0 ? '-' : '+'
  const tzHour = String(Math.abs(tzo / 60) | 0)
  const tzMinute = String(Math.abs(tzo % 60) | 0)
  const timezone = tzo === 0 ? '+Z' : `${tzSign}${tzHour}:${tzMinute}`
  return `${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join(
    '-'
  )} ${[date.getHours(), date.getMinutes(), date.getSeconds()].join(
    ':'
  )}.${`000${date.getMilliseconds()}`.slice(-3)}${timezone}`
    .replace(/\b\d\b/g, '0$&')
    .replace(/\+Z/, 'Z')
    .replace(/\s/, 'T')
}

// 后台传回"2018-10-30T21:08:49.416+08:00"转正常展示格式'2018-10-30 21:08:49'
export function toTimeNormalString (str) {
  return str
    .split('.')[0]
    .split('T')
    .join(' ')
}
