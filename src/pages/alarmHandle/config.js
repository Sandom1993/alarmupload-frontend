/**
 * 报警类型
 * @ALARM_TYPE
 */
export const ALARM_TYPE = [
  { eventType: '132405', name: '超速' },
  { eventType: '132424', name: '夜间禁行时段行驶' },
  { eventType: '225442', name: '连续驾驶超时' }
]
/**
 * 处置
 * @VALID_TYPE
 */
export const HANDLE_TYPE = [
  { value: '0', label: '全部' },
  { value: '1', label: '已处置' },
  { value: '2', label: '未处置' }
]

export const ALLBY_TYPE = [
  { id: 12, messageContent: '按规定扣除违安全违约金', messageType: 0 },
  { id: 11, messageContent: '已进行下车学习', messageType: 0 },
  { id: 10, messageContent: '已进行批评教育', messageType: 0 }
]
