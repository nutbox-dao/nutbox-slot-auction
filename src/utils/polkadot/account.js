import {
  web3Accounts,
  web3Enable,
  web3FromSource
} from '@polkadot/extension-dapp'
import keyring from '@polkadot/ui-keyring';

import {
  cryptoWaitReady
} from "@polkadot/util-crypto"
import BN from "bn.js"
import store from "../../store"
import { subBonded, subNominators } from './staking'
import { getBalance as getKusamaBalance } from '../kusama/account'

import { getApi, stanfiAddress } from './polkadot'

export const loadAccounts = async () => {
  try {
    await web3Enable('nutbox')
    let allAccounts = await web3Accounts()
    await cryptoWaitReady();
    keyring.loadAll({
      isDevelopment: false
    }, allAccounts)
    allAccounts = allAccounts.map(({address, meta}) => ({
      address: stanfiAddress(address),
      meta
    }))
    store.commit('polkadot/saveAllAccounts', allAccounts)
    let account = store.state.polkadot.account !== 'undefined' && store.state.polkadot.account? store.state.polkadot.account : allAccounts[0]
    store.commit('polkadot/saveAccount', account)
    getBalance(account)
    getKusamaBalance(account)
    subNominators()
    subBonded()
    // inject
    await injectAccount(account)
  } catch (e) {
    console.error('get all accounts fail:', e);
  }
}

export const injectAccount = async (account) => {
  const injected = await web3FromSource(account.meta.source)
  const api = await getApi()
  api.setSigner(injected.signer)
  return api
}

export const getBalance = async (account) => {
  const api = await getApi()
  // cancel last
  let subBalance = store.state.polkadot.subBalance
  let subLocked = store.state.polkadot.subLocked
  try {
    subBalance()
  } catch (e) {}
  try {
    subLocked()
  } catch (e) {}

  subBalance = await api.query.system.account(store.state.polkadot.account.address, ({
    data: {
      free: currentFree
    },
    nonce: currentNonce
  }) => {
    store.commit('polkadot/saveBalance', new BN(currentFree))
  })

  subLocked = await api.query.balances.locks(store.state.polkadot.account.address, (locked) => {
    if (!locked.toJSON() || locked.toJSON().length === 0){
      store.commit('polkadot/saveLocked', new BN(0))
      return
    }
    store.commit('polkadot/saveLocked', new BN(locked[0].amount))
    // console.log('lock', locked[0].amount.toHuman());
  })

  store.commit('polkadot/saveSubLocked', subLocked)
  store.commit('polkadot/saveSubBalance', subBalance)
}
