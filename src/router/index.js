import Vue from 'vue'
import Router from 'vue-router'

import rank from 'components/rank/rank'
import search from 'components/search/search'
import singer from 'components/singer/singer'
import recommend from 'components/recommend/recommend'
import singerDetail from 'components/singer-detail/singer-detail'
import disc from 'components/disc/disc'
import topList from 'components/top-list/top-list'
Vue.use(Router)

export default new Router({
  routes: [
      {
        path: '/',
        redirect: '/recommend'
      },
      {
        path: '/recommend',
        component: recommend,
        children: [{
          path: ':id',
          component: disc
        }]
      },
      {
        path: '/singer',
        component: singer,
        children: [
            {
                path: ':id',
                component: singerDetail
            }
        ]
      },
      {
        path: '/search',
        component: search,
        children: [
            {
                path: ':id',
                component: singerDetail
            }
        ]
      },
      {
        path: '/rank',
        component: rank,
        children: [{
          path: ':id',
          component: topList
        }]
      }
  ]
})
