// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat');

    // config.module
    //   .rule('images')
    //   .use('file-loader')
    //   .loader('file-loader')
    //   .options({
    //     name: '[name].[ext]',
    //     outputPath: 'img/',
    //     publicPath: '/img/',
    //   });

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        };
      });
  },
};