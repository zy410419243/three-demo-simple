/*
 * @Author: zy9@github.com/zy410419243
 * @Date: 2018-05-20 13:48:08
 * @Last Modified by: zy9
 * @Last Modified time: 2018-08-11 16:40:24
 */
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
// const TohoLogPlugin = require('toho-log-plugin');
const TohoLogPlugin = require('./plugins/toho-log-plugin');
const { commonModule, commonPlugin } = require('./webpack.common');

let plugins = commonPlugin;

plugins.push(new webpack.HotModuleReplacementPlugin());
plugins.push(new webpack.NamedModulesPlugin());
plugins.push(new TohoLogPlugin());

const devServerOptions = {
	port: 9099,
	hot: true,
	host: 'localhost',
	noInfo: true,
	clientLogLevel: 'error',
	contentBase: path.join(__dirname, 'demo')
};

const webpackConfig = {
	mode: 'development',
	watch: false,
	devtool: 'source-map',
	entry: {
		demo: [
			'webpack-dev-server/client?http://' + devServerOptions.host + ':' + devServerOptions.port,
			'webpack/hot/only-dev-server',
			__dirname + '/demo',
		],
		// lib: [
		//     'webpack-dev-server/client?http://' + devServerOptions.host + ':' + devServerOptions.port,
		//     'webpack/hot/only-dev-server',
		//     __dirname + '/src/lib',
		// ]
	},
	output: {
		filename: 'dist/[name].[hash].js',
		chunkFilename: 'vendor/[name].[hash].js',
	},
	plugins,
	module: commonModule
};

const compiler = webpack(webpackConfig);

const server = new webpackDevServer(compiler, devServerOptions);

server.listen(devServerOptions.port, devServerOptions.host);