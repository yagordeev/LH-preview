// Webpack v4
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
require('babel-polyfill');


module.exports = (env, argv) => {
	const isDevelopment = argv.mode !== 'production';
	return {
		entry: {
			app: ['babel-polyfill', './src/index.jsx']
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			publicPath: '/',
			filename: 'app.js'
		},
		devtool: false,
		devServer: {
			historyApiFallback: true,
			inline: true,
			port: 3000,
		},
		optimization: !isDevelopment ? {
			'minimize': true,
			minimizer: [new TerserPlugin({
				terserOptions: {
					compress: {
						pure_funcs: [
							'console.log',
							'console.info',
							'console.debug',
							'console.warn'
						]
					}
				}
			})],
		} : {},
		module: {
			rules: [{
					test: /\.(js|jsx)$/,
					include: path.join(__dirname, '/src'),
					exclude: /node_modules/,
					loader: 'babel-loader',
					query: {
						presets: ["@babel/preset-env", "@babel/preset-react"],
						plugins: ["transform-es2015-destructuring", "transform-object-rest-spread"]
					}
				},
				{
					test: /\.(css|scss)$/,
					use: [
						'style-loader',
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'sass-loader',
							options: { sourceMap: true }
						},
						{
							loader: 'postcss-loader',
							options: { sourceMap: true, config: { path: './public/js/postcss.config.js' } }
						}
					]
				},
				{
					test: /\.(png|jpe?g|gif|svg)$/i,
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						publicPath: 'img',
						outputPath: 'img'
					}
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/,
					loader: "file-loader",
					options: {
						outputPath: 'fonts'
					}
				}
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: 'style.css',
			}),
			new HtmlWebpackPlugin({
				inject: true,
				hash: true,
				template: './public/index.html',
				filename: 'index.html'
			}),
		],
	}
}