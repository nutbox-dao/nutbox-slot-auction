import Vue from 'vue'
import VueRouter from 'vue-router'
import Wallet from '../components/Wallet/Wallet'
import SteemWallet from '../components/Wallet/SteemWallet'
import TronWallet from '../components/Wallet/TronWallet'
import Swap from '../components/Wallet/Swap'
import Stake from '../components/Stake/Stake'
import Farm from '../components/Farm/Farm'
import LiquidStaking from '../components/LiquidStaking/LiquidStaking'
import TSP from '../components/LiquidStaking/TSP'
import Nps from '../components/Nps/Nps'
import Vote from '../components/Vote/Vote'
import Admin from '../components/Admin/Admin'
import Blog from '../components/Blog/Blog'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/stake'
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: Wallet,
    children: [
      {
        path: '',
        name: 'steem',
        component: SteemWallet
      },
      {
        path: 'tron',
        name: 'tron',
        component: TronWallet
      },
      {
        path: 'swap',
        name: 'swap',
        component: Swap
      }
    ]
  },
  {
    path: '/stake',
    component: Stake,
  },
  {
    path: '/farm',
    component: Farm,
  },
  {
    path: '/liquid-staking',
    component: LiquidStaking,
    redirect: '/liquid-staking/tsp',
    children: [
      {
        path: 'tsp',
        component: TSP
      }
    ]
  },
  {
    path: '/blog',
    component: Blog,
  },
  {
    path: '/get-vote',
    component:Vote,
  },
  {
    path: '/nps',
    component: Nps
  },
  {
    path:'/admin',
    component: Admin,
  }
]

const router = new VueRouter({
  linkActiveClass: 'active',
  routes
})

export default router
