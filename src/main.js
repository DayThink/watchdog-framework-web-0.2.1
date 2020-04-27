// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import Print from 'print-js'
import Print from 'vue-print-nb'
import App from './App'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import config from '@/config'
import importDirective from '@/directive'
import 'view-design/dist/styles/iview.css'
import './index.less'
import '@/assets/icons/iconfont.css'
import './libs/iview-cfg'
// import '@/mock'
// 实际打包时应该不引入mock
/* eslint-disable */
if (process.env.NODE_ENV !== 'production') require('@/mock')

Vue.use(ViewUI);
Vue.use(Print);
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/**
 * 注册指令
 */
importDirective(Vue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
