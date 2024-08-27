const {
  override,
  addWebpackAlias,
  addWebpackExternals,
  addLessLoader
} = require('customize-cra')
const path = require('path')
const rewirePostcss = require('react-app-rewire-postcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')

// 定义路径变量
const demosPath = path.resolve(__dirname, 'demos')
const srcPath = path.resolve(demosPath, 'src')
const distPath = path.resolve(demosPath, 'dist')
const publicPath = path.resolve(demosPath, 'public')

// PostCSS 插件配置
const postcssPlugins = [
  autoprefixer,
  pxtorem({
    rootValue: 16,
    propList: ['*'],
    mediaQuery: true,
    exclude: '/node_modules/i',
  })
]

// Webpack 配置
module.exports = {
  webpack: override(
    // 添加路径别名
    addWebpackAlias({
      '@': srcPath,
    }),
    // 设置外部依赖
    addWebpackExternals({
      react: 'React',
      'react-dom': 'ReactDOM',
      axios: 'axios',
    }),
    // 添加 Less 支持
    addLessLoader({
      lessOptions: {
        javascriptEnabled: true,
      },
    }),
    // 自定义 Webpack 配置
    function (config, env) {
      rewirePostcss(config, { plugins: () => postcssPlugins })
      config.output.globalObject = 'this'
      return config
    }
  ),
  // 自定义路径配置
  paths: function (paths, env) {
    paths.appBuild = distPath
    paths.appPublic = publicPath
    paths.appHtml = path.resolve(publicPath, 'index.html')
    paths.appIndexJs = path.resolve(srcPath, 'main.jsx')
    paths.appSrc = demosPath
    return paths
  }
}
