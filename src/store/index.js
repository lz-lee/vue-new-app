import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 开发环境下为true,上线时关闭strict
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    strict: debug,
    plugins: debug ? [createLogger()] : []
})