/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-01 14:51:27
 * @LastEditTime: 2023-07-07 11:27:26
 */
const { defineConfig } = require('@vue/cli-service')
const { VantResolver } = require('unplugin-vue-components/resolvers');
const ComponentsPlugin = require('unplugin-vue-components/webpack');

module.exports = defineConfig({
	transpileDependencies: true,
	configureWebpack: {
		plugins: [
			ComponentsPlugin({
				resolvers: [VantResolver()],
			}),
		],
	},
	devServer: {
		allowedHosts: 'all'
	}
})
