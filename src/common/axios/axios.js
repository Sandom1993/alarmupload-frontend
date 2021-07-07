import axios from 'axios'
import { Message, Loading } from 'hui'
import CONFIG from  './config'
// 请求超时设置
axios.defaults.timeout = CONFIG.TIMEOUT
// 请求拦截
axios.interceptors.request.use(config => {
  if (CONFIG.LOAD_ANIMATION) {
    Loading.service({fullscreen: true})
  }
  return config
})

// 响应拦截
axios.interceptors.response.use(response => {
  if (CONFIG.LOAD_ANIMATION) {
    Loading.service({fullscreen: true}).close()
  }
  if (response.data.code === CONFIG.CODE.SUCCESS) {
    Message({
      type: 'success',
      message: response.data.msg || '操作成功'
    })
    return response
  } else {
    Message({
      type: 'error',
      message: response.data.msg || '操作失败'
    })
    throw new Error('error')
  }
}, err => {
  // 服务器状态码情况
  if (CONFIG.LOAD_ANIMATION) {
    Loading.service({fullscreen: true}).close()
  }
  if (err.message.includes('timeout')) {
    Message({
      type: 'error',
      message: '请求超时'
    })
  } else {
    const { status, statusText = '请求出错' } = err.response
    Message({
      type: 'error',
      message: statusText
    })
  }
})
export default axios
