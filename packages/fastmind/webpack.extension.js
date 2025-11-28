const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const extensionConfig = {
  mode: 'production',
  target: 'node',
  entry: {
    extension: path.resolve(__dirname, './src/extension.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
    clean: true,
  },
  // Externalize VS Code modules and dependencies
  externals: {
    vscode: 'commonjs vscode',
  },
  // Copy editor-standalone build artifacts
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../editor-standalone/dist-standalone'),
          to: path.resolve(__dirname, 'dist'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/index.html'], // We'll use our own template
          },
        },
      ],
    }),
  ],
  // Node.js specific optimizations
  node: {
    __dirname: false,
    __filename: false,
  },
  // Performance optimizations
  optimization: {
    minimize: false, // Keep readable for debugging
    splitChunks: false, // Single bundle for simplicity
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  },
};

module.exports = extensionConfig;
