module.exports = {
  output: {
    library: 'api-js',
    libraryTarget: 'commonjs2'
  },
  externals: ['machina','lodash'],
  module: {
    loaders: [
      {
        test: /\.(js|es6)$/,
//        exclude: /(node_modules)/,

        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
