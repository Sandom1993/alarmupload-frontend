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
  { value: null, label: '全部' },
  { value: 1, label: '已处置' },
  { value: 0, label: '未处置' }
]

export const ALLBY_TYPE = [
  { id: 12, messageContent: '按规定扣除违安全违约金', messageType: 0 },
  { id: 11, messageContent: '已进行下车学习', messageType: 0 },
  { id: 10, messageContent: '已进行批评教育', messageType: 0 }
]

/**
 * 报警级别
 * @ALARM_LEVEL
 */
export const ALARM_LEVEL = [
  { value: 'l', label: '一级', color: '#2080FC' },
  { value: 'm', label: '二级', color: '#FD9511' },
  { value: 'h', label: '三级', color: '#FA3239' },
  { value: 'w', label: '预警', color: '#a3a3a3' }
]
