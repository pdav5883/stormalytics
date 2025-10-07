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
    login: {
      import: require.resolve('blr-shared-frontend/dist/login.js'),
    },
    index: {
      import: './src/scripts/index.js',
      dependOn: 'shared'
    },
    navonly: {
      import: './src/scripts/navonly.js'
    },
    new: {
      import: './src/scripts/new.js',
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
      chunks: ['shared', 'index']
    }),
    new HtmlWebpack({
      title: "Login",
      filename: "login.html",
      template: require.resolve('blr-shared-frontend/src/login.html'),
      chunks: ["navonly", "login"],
      inject: true
    }),
    new HtmlWebpack({
      title: 'About Stormalytics',
      favicon: './src/images/favicon.ico',
      filename: 'about.html',
      template: './src/about.html',
      chunks: ['navonly']
    }),
    new HtmlWebpack({
      title: 'New Storm',
      favicon: './src/images/favicon.ico',
      filename: 'new.html',
      template: './src/new.html',
      chunks: ['shared', 'new']
    }),
    new HtmlWebpack({
      title: 'Stormalytics System',
      favicon: './src/images/favicon.ico',
      filename: 'system.html',
      template: './src/system.html',
      chunks: ['navonly']
    }),
    new CopyWebpack({
      patterns: [
        {
          from: './src/images',
          to: 'assets'
        },
        {
          from: require.resolve('blr-shared-frontend/dist/login.js'),
          to: 'scripts/login.bundle.js'
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
