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

    if (process.env.NODE_ENV === 'production') {
      config.plugin('html').tap(args => {
        args[0].meta = {
          _csrf: {
            name: '_csrf',
            content: '${_csrf.token}' // eslint-disable-line
          }
        }
        return args
      })
    } else {
      // mutate for development...
      console.log('development building...')
      config.plugin('html').tap(args => {
        args[0].meta = {
          _csrf: {
            name: '_csrf',
            content: '17099c98-a35a-4074-9501-e19a1446c67e' // eslint-disable-line
          }
        }
        return args
      })
    }
   /* config.plugin('html').tap(args => {
      const meta = {
        _csrf: {
          name: '_csrf',
          content: '${_csrf.token}' // eslint-disable-line
        }
      }
      args[0].meta = meta
      return args
    })*/
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
        //target: 'http://10.196.44.13:17200',
        target: 'https://183.230.82.16', // 测试地址
        changeOrigin: true,
        onProxyReq(proxyReq, req, res) {
          proxyReq.setHeader(
            'Cookie',
            'JSESSIONID=pLvfGORPkgNLfoV3wyl_t2YXL2jgnaX18H4Gibdk; portal_locale_cookie=zh-cn; csrfToken=r0UonvyeDERj_hkbqKqYR8kw; CASTGC=TGT-68-YS9qatWrQeVMKGrbcvnHzz0pHovVqb70mxGmOz3SlhlHGgnUd7-cas; portal_sess=XSpoo4TuA3dmV0X1YBx70TUKTi8cb5non0PiGJIbPDg90khhafnBwTL6kKPXjpri'
          )
        }
      },
      '/alarmupload-web': {
        //target: 'http://10.196.44.13:17200',
        target: 'https://183.230.82.16', // 测试地址
        changeOrigin: true,
        onProxyReq(proxyReq, req, res) {
          proxyReq.setHeader(
            'Cookie',
            'JSESSIONID=V7B4nKVt_mFqsd3eG3NoZYaPd98IJQHcmHzRleNw; portal_locale_cookie=zh-cn; csrfToken=r0UonvyeDERj_hkbqKqYR8kw; CASTGC=TGT-70-X5G696JwPZs7iJzfd4fgtjUqMOE6Dco4uUqAkp7kirnpXV3ovG-cas; portal_sess=qr2NS1gfV6AkIhGBOhpyOVnO4Jb7NfjUf5Q5P5fbLsnW5QmNTJ-Ft3jlGRHP4Wn3'
          )
        }
      }
    }
  }
}
