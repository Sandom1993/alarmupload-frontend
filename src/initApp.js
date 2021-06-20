import store from '@/store'
import { mountVueInstance, errorLoadPage } from 'dolphin-plugin-tools'
import router from './router'
import App from './App'
import ErrorPage from '@/components/ErrorPage'
import '@/style/index.scss'

async function initApp (Vue) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { userInfo } = await store.dispatch('setUserInfo')
    // 初始化vue实例
    mountVueInstance(Vue, App, {
      store,
      router
    })
  } catch (error) {
    errorLoadPage(Vue, ErrorPage)
  }
}

export default initApp
