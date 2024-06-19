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

module.exports = {
  webpack: override(
    addWebpackAlias({
      '@': path.resolve(__dirname, './demos/src/')
    }),
    addWebpackExternals({
      'react': 'React',
      'react-dom': 'ReactDOM',
      'axios': 'axios'
    }),
    addLessLoader({
      lessOptions: {
        javascriptEnabled: true
      }
    }),
    (config, env) => {
      rewirePostcss(config, {
        plugins: () => [
          autoprefixer,
          pxtorem({
            rootValue: 16,
            propList: ['*'],
            mediaQuery: true,
            exclude: '/node_modules/i'
          })
        ]
      })

      config.output.globalObject = 'this'
      return config
    }
  ),
  paths: (paths, env) => {
    paths.appBuild = path.resolve(__dirname, 'demos/dist');
    paths.appPublic = path.resolve(__dirname, 'demos/public');
    paths.appHtml = path.resolve(__dirname, 'demos/public/index.html');
    paths.appIndexJs = path.resolve(__dirname, 'demos/src/main.jsx');
    paths.appSrc = path.resolve(__dirname, 'demos');
    return paths;
  }
}
