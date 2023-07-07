/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-04 17:09:12
 * @LastEditTime: 2023-06-04 19:29:46
 */

module.exports = {
    root: true,
    extends: ["plugin:vue/essential", "eslint:recommended"],
    env: {
        node: true, // 启用node中全局变量
        browser: true, // 启用浏览器中全局变量
    },
    parserOptions: {
        parser: "@babel/eslint-parser"
    },
    rules: {
        "no-var": 2, // 不能使用 var 定义变量
        "no-async-promise-executor": 0,
        "no-dupe-keys": 0
    },
};