const path = require('path')
const HtmlWebpack = require('html-webpack-plugin')
const CopyWebpack = require('copy-webpack-plugin')
const { execSync } = require('child_process')

// Get CloudFormation parameters
const cfParams = Object.fromEntries(
  execSync('bash get-cf-params.sh', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .map(line => {
      const [key, value] = line.split('=')
      return [key, JSON.stringify(value.trim())]
    })
)

console.log('CloudFormation parameters:', cfParams)

module.exports = {
  entry: {
    navonly: {
      import: './src/scripts/navonly.js',
      dependOn: 'shared'
    },
    shared: './src/scripts/shared.js'
  },
  
  mode: 'development',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/[name].bundle.js'
  },
  
  plugins: [
    new HtmlWebpack({
      title: 'Stormalytics',
      favicon: './src/images/favicon.ico',
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['shared', 'navonly']
    }),
    new HtmlWebpack({
      title: 'About Stormalytics',
      favicon: './src/images/favicon.ico',
      filename: 'about.html',
      template: './src/about.html',
      chunks: ['shared', 'navonly']
    }),
    new HtmlWebpack({
      title: 'New Storm',
      favicon: './src/images/favicon.ico',
      filename: 'new.html',
      template: './src/new.html',
      chunks: ['shared', 'navonly']
    }),
    new HtmlWebpack({
      title: 'Stormalytics System',
      favicon: './src/images/favicon.ico',
      filename: 'system.html',
      template: './src/system.html',
      chunks: ['shared', 'navonly']
    }),
    new CopyWebpack({
      patterns: [
        {
          from: "./src/nav.html",
          to: "assets",
        },
        {
          from: './src/images',
          to: 'assets'
        }
      ]
    })
  ],
  
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'string-replace-loader',
          options: {
            multiple: Object.entries(cfParams).map(([key, value]) => ({
              search: key,
              replace: value,
              flags: 'g'
            }))
          }
        }]
      }
    ]
  }
}
