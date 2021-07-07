// 获取报警标签
const getAlarmLabels = alarm => {
  if (!alarm || !alarm.label) {
    return []
  }
  const label = alarm.label.find(
    item => item.component === process.env.VUE_APP_COMPONENT_ID
  )
  if (label && label.labels) {
    return label.labels
  }
  return []
}

const getLabelByKey = (alarm, key) => {
  const labels = getAlarmLabels(alarm)
  return labels.find(item => item.key === key) || {}
}

const getLabelValueByKey = (alarm, key) => {
  const label = getLabelByKey(alarm, key)
  return label.value
}

const getAlarmDealStatus = alarm => {
  const broadcast = getLabelValueByKey(alarm, 'broadcast')
  return broadcast ? '已处警' : '未处警'
}

const formatAlarmSpeed = (alarm, length = 0) => {
  return Number(
    (alarm.averageSpeed || alarm.beginSpeed || alarm.endSpeed || 0) / 100000
  ).toFixed(length)
}

const formatSpeed = (value, length = 0) => {
  if (!value || isNaN(value)) {
    return value
  }
  return Number(value / 100000).toFixed(length)
}

const replaceLabels = (alarm, keys, label) => {
  if (!alarm.label) {
    alarm.label = [label]
  } else {
    const alarmLables = alarm.label.find(
      item => item.component === process.env.VUE_APP_COMPONENT_ID
    )
    if (alarmLables) {
      keys.forEach(key => {
        const index = alarmLables.labels.findIndex(item => item.key === key)
        if (index > -1) {
          alarmLables.labels.splice(index, 1)
        }
      })
      alarmLables.labels = [...alarmLables.labels, ...label.labels]
    } else {
      alarm.label.push(label)
    }
  }
}

export default {
  getAlarmDealStatus,
  getLabelValueByKey,
  formatAlarmSpeed,
  formatSpeed,
  replaceLabels
}
