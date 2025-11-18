const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('../../webpack.common');
const { merge } = require('webpack-merge');

const devConfig = {
  mode: 'development',
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
  },
  // Don't externalize any dependencies - bundle everything for standalone use
  externals: {},
  // Development-specific optimizations
  optimization: {
    minimize: false,
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
      // Don't minify in development for easier debugging
      minify: false,
    }),
    // Copy static assets
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/assets'),
          to: path.resolve(__dirname, 'dist-standalone/assets'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  // Development server configuration
  devServer: {
    port: 8082,
    hot: true,
    liveReload: true,
    static: {
      directory: path.join(__dirname, 'dist-standalone'),
    },
    // Open browser automatically
    open: true,
    // Enable history API fallback for SPA routing
    historyApiFallback: true,
    // Show compilation progress
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  // Source maps for debugging
  devtool: 'eval-cheap-module-source-map',
  // Performance warnings disabled in development
  performance: {
    hints: false,
  },
};

module.exports = merge(common, devConfig);
