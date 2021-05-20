import Vue from 'vue'
import VueRouter from 'vue-router'

import Blog from '../views/Blog/Blog'
import CrowdStaking from '../views/CrowdStaking/CrowdStaking'
import Crowdloan from '../views/Crowdloan/Crowdloan'
import Polkadot from '../views/Crowdloan/Polkadot'
import Kusama from '../views/Crowdloan/Kusama'
import Wallet from '../views/Wallet/Wallet'
import PolkadotWallet from '../views/Wallet/Polkadot'
import KusamaWallet from '../views/Wallet/Kusama'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/crowdloan'
  },
  {
    path:'/wallet',
    component: Wallet,
    children: [
      {
        path:'',
        component: PolkadotWallet
      },
      {
        path:'kusama',
        component: KusamaWallet
      }
    ]
  },
  {
    path: '/crowdloan',
    name: 'crowdloan',
    component: Crowdloan,
    children: [
      {
        path: '',
        name: 'kusama',
        component: Kusama
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
