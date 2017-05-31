import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'

import fastclick from 'fastclick'

// 解决点击事件300ms延时
fastclick.attach(document.body)

Vue.config.productionTip = false
import 'common/styl/index.styl'
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
