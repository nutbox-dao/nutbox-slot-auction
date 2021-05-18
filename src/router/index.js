import Vue from 'vue'
import VueRouter from 'vue-router'

import Blog from '../views/Blog/Blog'
import CrowdStaking from '../views/CrowdStaking/CrowdStaking'
import Crowdloan from '../views/Crowdloan/Crowdloan'
import Polkadot from '../views/Crowdloan/Polkadot'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/crowdstaking'
  },
  {
    path: '/crowdloan',
    name: 'crowdloan',
    component: Crowdloan,
    children: [
      {
        path: '',
        name: 'kusama',
        component: Crowdloan
      },
      {
        path: 'polkadot',
        name: 'polkadot',
        component: Polkadot
      }
    ]
  },
  {
    path: '/crowdstaking',
    component: CrowdStaking,
  },
  {
    path: '/blog',
    component: Blog,
  }
]

const router = new VueRouter({
  linkActiveClass: 'active',
  routes
})

export default router
