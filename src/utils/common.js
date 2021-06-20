import { findIndex } from 'lodash'
// 获取语言参数
const isDev = process.env.NODE_ENV === 'development'
const getLanKey = () => {
  if (isDev) {
    return 'zh_CN'
  } else {
    // return document.querySelector('meta[name="lang"]').getAttribute('language');
    return 'zh_CN'
  }
}
// 获取皮肤参数
const getSkinKey = () => {
  if (isDev) {
    return 'blue'
  } else {
    // return document.querySelector('meta[name="skin"]').getAttribute('skin');
    return 'blue'
  }
}
// 获取csrftoken
const getToken = () => {
  let token = ''
  const metas = document.getElementsByTagName('meta')
  for (const meta of metas) {
    if (meta.getAttribute('name') === '_csrf') {
      token = meta.getAttribute('content')
    }
  }
  return token
}
// 数字四舍五入保留n位小数
const formatNumber = (value, length = 2) => {
  if (!value) {
    return value
  }
  const number = parseFloat(value)
  if (number.toString === 'NaN') {
    return value
  }
  return Math.round(number * Math.pow(10, length)) / Math.pow(10, length)
}
export { getLanKey, getSkinKey, getToken, formatNumber }

//  找到索引返回索引对象
export function findIndexObject (list, val) {
  return list[findIndex(list, val)]
}
