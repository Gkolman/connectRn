var path = require('path');
var SRC_DIR = path.join(__dirname, '/client/src');

module.exports = {
    entry:  path.resolve(__dirname,'client', 'src', 'index.jsx'),
    output: {
    path: path.resolve(__dirname,'client' , 'dist', ),
    filename: 'bundle.js',
  },
  module : {
    rules : [
      {
        test: /\.(js|jsx)$/,
        include :  path.resolve(__dirname,'client'),
        exclude: /node_modules/ && /dist/,
        use: [{
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-react', '@babel/preset-env']
            }
        }]
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/ && /dist/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
};