import axios from 'axios'
import { Message } from 'hui'

const LOGIN_EXPIRE = -3 // 登录过期返回type为-3
const REQUEST_SUCCESS = 0 // 请求成功返回type为0

const http = axios.create({
  timeout: 60000, // 请求超时时间
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})
// 请求拦截器
http.interceptors.request.use(function (config) {
  if ((config.url).indexOf('.json') === -1 && (config.url).indexOf('.bicservice') === -1) {
    config.url = process.env.NODE_ENV === 'production' ? './' + config.url : './ctm01ttvm-web/' + config.url
  }
  // 在发送请求之前做某事
  config.method = (config.method).toUpperCase()
  if (config.method === 'POST') { } else if (config.method === 'GET') {
    // config.url += '?a=' + Date.parse(new Date());
  }
  if (process.env.NODE_ENV === 'production') {
    const token = document.querySelector('meta[name=\'_csrf\']').getAttribute('content')
    const header = document.querySelector('meta[name=\'_csrf_header\']').getAttribute('content')
    config.headers[header] = token
  }
  return config
}, function (error) {
  // 请求错误时做些事
  return Promise.reject(error)
})

// 相应拦截器
http.interceptors.response.use((response) => {
  // 请求多语言的json文件
  if (response.config.url.includes('json')) {
    return response
  }
  const { status, data } = response
  const type = data.type
  if (status && status === 200 && data) {
    // 对错误进行统一处理
    if (type !== REQUEST_SUCCESS && data.msg) {
      if (data.msg) {
        Message.error(data.msg)
      }
      return Promise.reject(response)
    }
    return Promise.resolve({
      msg: response.data.msg,
      data: response.data.data
    })
  } else {
    Message.error(response.statusText)
  }
}, (error) => {
  // 判断接口是否请求超时
  if (error.message.includes('timeout')) {
    Message.error('请求超时!')
    return Promise.reject(error)
  }
  // 根据响应数据判断是否登录过期
  if (error.response.data.type === LOGIN_EXPIRE) {
    window.location.reload()
    return false
  }
  // 后台返回错误信息展示错误信息
  if (error.response.data.msg) {
    Message.error(error.response.data.msg)
  } else {
    // 后台没有返回默认报错
    Message.error('请求失败!')
  }
  // 对响应错误做点什么
  return Promise.reject(error)
})

http.showError = (msg) => {
  Message.error(msg)
}
export default http
