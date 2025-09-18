const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    main: './src/main.ts',
  },
  target: 'node',
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'inline-source-map',
  watch: process.env.WEBPACK_WATCH === 'true',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Skip type checking
            },
          },
        ],
        exclude: /node_modules|test/, // Exclude test directory
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /test\/.*\.ts$/,
      message: /export .* was not found in/,
    },
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  externals: [nodeExternals()],
  plugins: [
    new CleanWebpackPlugin(),
  ],
  optimization: {
    minimize: false,
  },
};
