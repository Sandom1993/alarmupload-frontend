import Vue from 'vue'
import hui from 'hui'
import './huiPro' // equals to require('./huiPro')
import initApp from './initApp'
import '@hui/svg-icon/lib/svg-icon.css'
import icons from '@hui/svg-icon'

// import axios from './common/axios/axios'
import axios from 'axios'
import TimeSelector from '@hui-pro/time-selector'
import '@hui-pro/time-selector/theme/index.scss'
Vue.use(TimeSelector)

for (const icon of icons) {
  Vue.component(icon.name, icon)
}
Vue.prototype.$axios = axios

axios.interceptors.request.use(config => {
  config.headers['X-CSRF-TOKEN'] = getToken()
  return config
})

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

Vue.use(hui)

// 全局混合，对面包屑的多语言进行处理
Vue.mixin({
  computed: {
    i18nBreadcrumb () {
      if (this.breadcrumbObj && Array.isArray(this.$store.state.userInfo.breadcrumb[this.breadcrumbObj.menuCode])) {
        const breadcrumbList = this.$store.state.userInfo.breadcrumb[this.breadcrumbObj.menuCode]
        return breadcrumbList.map(item => ({
          title: item
        })).concat(this.breadcrumbObj.content ? this.breadcrumbObj.content.map(bd => ({
          title: this.$t ? this.$t(bd) : bd
        })) : [])
      } else {
        return []
      }
    }
  }
})

Vue.filter('formatSeconds', function (value) {
  if (!value) {
    return value
  }
  let theTime = parseInt(value) // 需要转换的时间秒
  let theTime1 = 0 // 分
  let theTime2 = 0 // 小时
  let theTime3 = 0 // 天
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60)
    theTime = parseInt(theTime % 60)
    if (theTime1 >= 60) {
      theTime2 = parseInt(theTime1 / 60)
      theTime1 = parseInt(theTime1 % 60)
      if (theTime2 >= 24) {
        // 大于24小时
        theTime3 = parseInt(theTime2 / 24)
        theTime2 = parseInt(theTime2 % 24)
      }
    }
  }

  var result = ''
  if (theTime > 0) {
    result = '' + parseInt(theTime) + '秒'
  }
  if (theTime1 > 0) {
    result = '' + parseInt(theTime1) + '分' + result
  }
  if (theTime2 > 0) {
    result = '' + parseInt(theTime2) + '小时' + result
  }
  if (theTime3 > 0) {
    result = '' + parseInt(theTime3) + '天' + result
  }
  return result
})
initApp(Vue)
