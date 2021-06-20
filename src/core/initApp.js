import store from '@/store';
import {
  mountVueInstance,
  renderThemeFromCssUrl,
  errorLoadPage,
  setLanguage as setLanguageInternal
} from 'dolphin-plugin-tools';
import router from '../router';
import App from '../App';
import i18n from '../i18n';
import ErrorPage from '@/components/errorPage/src/index.vue';
import huiLocale from 'hui/lib/locale';
import huiProLocale from '@hui-pro/locale';
import axios from 'axios';
import '../../temp/icons/rm-icons.css';

const assetsUrl = process.env.BASE_URL + process.env.VUE_APP_ASSETS;
const isDev = process.env.NODE_ENV === 'development';
async function initApp(Vue) {
  try {
    const { userInfo } = await store.dispatch('setUserInfo');
    // 设置主题,多语言
    if (!isDev) {
      await Promise.all([renderTheme(userInfo), setLanguage(userInfo)]);
    } else {
      await renderTheme({
        skin: 'blue'
      });
      await setLanguage({
        languageId: 'zh_CN'
      });
    }
    // 初始化vue实例
    mountVueInstance(Vue, App, {
      store,
      router,
      i18n
    });
  } catch (error) {
    // eslint-disable-next-line
    console.error(error);
    // 错误处理
    errorLoadPage(Vue, ErrorPage);
  }
}

async function renderTheme({ skin }) {
  // public/static/skin/xxx/skin.css
  const requestUrl = `${assetsUrl}/skin/${skin}/skin.css`;
  await renderThemeFromCssUrl(requestUrl);
}

async function setLanguage({ languageId }) {
  let i18nJson = { data: {} };
  if (isDev) {
    i18nJson.data = require(`@/i18n/${languageId}`);
  } else {
    // public/static/i18n/xxx/index.json
    const requestUrl = `${assetsUrl}/i18n/${languageId}/translate.json`;
    i18nJson = await axios.get(requestUrl);
  }
  await setLanguageInternal(
    i18nJson.data,
    languageId,
    [huiLocale, huiProLocale],
    i18n
  );
}

export default initApp;
