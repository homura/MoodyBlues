const { override, fixBabelImports, addLessLoader } = require('customize-cra');
const hotReload = require('react-app-rewire-hot-loader');
const { default: darkTheme } = require('@ant-design/dark-theme');

module.exports = function(config, env) {
  config = override(
    fixBabelImports('formik-antd', {
      libraryName: 'formik-antd',
      libraryDirectory: 'es',
      style: true,
    }),
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }),
    addLessLoader({
      javascriptEnabled: true,
      modifyVars: darkTheme,
    }),
  )(config, env);

  config = hotReload(config, env);
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-dom': '@hot-loader/react-dom',
  };
  return config;
};
