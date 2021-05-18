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

import { getApi, stanfiAddress } from './kusama'

export const injectAccount = async (account) => {
  const injected = await web3FromSource(account.meta.source)
  const api = await getApi()
  api.setSigner(injected.signer)
  return api
}

export const getBalance = async () => {
  const api = await getApi()
  // cancel last
  let subBalance = store.state.kusama.subBalance
  let subLocked = store.state.kusama.subLocked
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
  }) => {
    store.commit('kusama/saveBalance', new BN(currentFree))
  })

  subLocked = await api.query.balances.locks(store.state.polkadot.account.address, (locked) => {
    if (!locked.toJSON() || locked.toJSON().length === 0){
      store.commit('kusama/saveLocked', new BN(0))
      return
    }
    store.commit('kusama/saveLocked', new BN(locked[0].amount))
    // console.log('lock', locked[0].amount.toHuman());
  })

  store.commit('kusama/saveSubLocked', subLocked)
  store.commit('kusama/saveSubBalance', subBalance)
}
