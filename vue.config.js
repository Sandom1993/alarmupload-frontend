/** @type {import('@vue/cli-service').ProjectOptions} */
// eslint-disable-next-line no-unused-vars
const path = require('path')
const env = process.env.NODE_ENV
const isDev = env === 'development'
const page = isDev ? 'index.html' : '../templates/index.ftl'
module.exports = {
  indexPath: page,
  publicPath: isDev ? '/' : './',
  assetsDir: process.env.VUE_APP_ASSETS,
  outputDir: 'dist/static/',
  runtimeCompiler: true,
  // productionSourceMap: false,
  // 默认babel-loader会忽略node_modules中的文件
  // 但是dolphin-plugin-tools用了es6的语法, 配置对其显示转译
  // 配合babel sourceType: 'unambiguous'来使用 https://github.com/babel/babel/issues/9187,
  transpileDependencies: [
    'dolphin-plugin-tools',
    /@hui-pro/
  ],
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      // 打包的css如有必要加上@charset
      config.plugin('optimize-css').tap(args => {
        try {
          args[0].cssnanoOptions.preset[1].normalizeCharset = true
          return args
        } catch (_) {
          return args
        }
      })
    };
    config.plugin('html').tap(args => {
      const meta = {
        _csrf: {
          name: '_csrf',
          content: '${_csrf.token}' // eslint-disable-line
        }
      }
      args[0].meta = meta
      return args
    })
    // config.module
    //   .rule('svg')
    //   .exclude
    //   .add(path.resolve(__dirname, 'src/assets/icon')) // ${path} 为外部引入 svg 的文件夹路径
    //   .end()
    //   .use('file-loader')
    //   .end();

    // config.module.rule("svgicon")
    // .test(/\.(svg)(\?.*)?$/)
    // .include
    // .add(path.resolve(__dirname, 'src/assets/icon')) // ${path} 外部引入 svg 的文件夹路径
    // .end()
    // .use("raw-loader")
    // .loader("raw-loader")
    // .end()
  },
  // 用于开发环境下与后端联调
  // 如有需要, 还可以配合easy-proxy进行使用
  devServer: {
    // 如果改动node_modules内的代码, 不会触发热重载, 则取消下面的注释
    // watchOptions: {
    //   ignored: []
    // },
    proxy: {
      '^/api/': {
        target: 'http://localhost:8060',
        changeOrigin: true
      },
      '/alarmupload-web': {
        target: 'http://10.196.44.13:17100',
        changeOrigin: true
      }
    }
  }
}
