const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('../../webpack.common');
const { merge } = require('webpack-merge');

const standaloneConfig = {
  mode: 'production',
  target: 'web',
  entry: {
    editor: path.resolve(__dirname, './src/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist-standalone'),
    filename: 'editor-standalone.js',
    library: {
      name: 'WiseMappingEditorStandalone',
      type: 'umd',
      umdNamedDefine: true,
    },
    // Clean the output directory before emit
    clean: true,
    // Generate source maps for debugging
    devtoolModuleFilenameTemplate: 'editor-standalone.js.map',
  },
  // Don't externalize any dependencies - bundle everything for standalone use
  externals: {},
  // Handle font files as assets
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
  // Optimize for production
  optimization: {
    minimize: true,
    // Don't split chunks - create a single bundle for easy deployment
    splitChunks: false,
    // Export everything used by the entry point
    usedExports: true,
  },
  // Generate HTML template
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/template.html'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        useShortDoctype: true,
      },
    }),
    // Copy images, fonts, and CSS
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/assets/images'),
          to: path.resolve(__dirname, 'dist-standalone/assets/images'),
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, './src/assets/fonts'),
          to: path.resolve(__dirname, 'dist-standalone/assets/fonts'),
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, './src/assets/fonts.css'),
          to: path.resolve(__dirname, 'dist-standalone/assets/fonts.css'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  // Performance optimizations
  performance: {
    hints: false,
    maxEntrypointSize: 5120000, // 5MB
    maxAssetSize: 1024000, // 1MB
  },
};

module.exports = merge(common, standaloneConfig);
