/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-01 14:51:27
 * @LastEditTime: 2023-07-07 11:01:28
 */
import Vue from 'vue'
// import Vue from 'vue/dist/vue.esm.js'
import { Toast, Dialog } from 'vant';
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import App from './new-app.vue'

Vue.config.productionTip = false
Vue.prototype.$toast = Toast;
Vue.prototype.$dialog = Dialog;

new Vue({
  render: h => h(App),
}).$mount('#app')
