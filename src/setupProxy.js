const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    proxy({
      target: 'http://127.0.0.1:9200',
      changeOrigin: true,
      pathRewrite: path => path.replace('/api', ''),
    }),
  );
};
