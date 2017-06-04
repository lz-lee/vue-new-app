import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import fastclick from 'fastclick'
import vueLazyLoad from 'vue-lazyload'

Vue.use(vueLazyLoad, {
    loading: require('common/image/default.png')
})
// 解决点击事件300ms延时
fastclick.attach(document.body)

Vue.config.productionTip = false
import 'common/styl/index.styl'
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
