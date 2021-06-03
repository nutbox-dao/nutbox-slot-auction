import {
  web3Accounts,
  web3Enable,
  web3FromSource
} from '@polkadot/extension-dapp'

import BN from "bn.js"
import store from "@/store"

import {
  getApi,
  stanfiAddress,
  token2Uni
} from './rococo'
import {
  $t
} from '@/i18n'

export const getBalance = async () => {
  const api = await getApi()
  // cancel last
  let subBalance = store.state.rococo.subBalance
  try {
    subBalance()
  } catch (e) {}

  subBalance = await api.query.system.account(store.state.polkadot.account.address, ({
    data: {
      free: currentFree
    },
  }) => {
    store.commit('rococo/saveBalance', new BN(currentFree))
  })

  store.commit('rococo/saveSubBalance', subBalance)
}


/**
 * 转账ksm
 * @param {String} to 转账对象
 * @param {Number} amount 转账数目 单位为ksm
 */
export const transfer = async (to, amount, toast, callback) => {
  const api = await getApi()
  const decimal = new BN(12)
  const from = store.state.polkadot.account.address
  console.log('api', api);
  amount = api.createType('Compact<BalanceOf>', new BN(amount * 1e6).mul(new BN(10).pow(decimal.sub(new BN(6)))))
  const nonce = (await api.query.system.account(from)).nonce.toNumber()
  const unsub = await api.tx.balances.transfer(to, amount).signAndSend(from, {
    nonce
  }, ({
    status,
    dispatchError
  }) => {
    try {
      handelBlockState(api, status, dispatchError, toast, callback, unsub)
    } catch (e) {
      toast(e.message, {
        title: $t('tip.error'),
        variant: 'danger'
      })
    }
  })
}


/**
 *  绑定KSM
 * @param {number} amount 要绑定的KSM数量， 以KSM为单位
 * @param {function} toast toast
 * @param {function} callback callback
 */
export const bond = async (amount, toast, callback) => {
  const from = store.state.polkadot.account && store.state.polkadot.account.address
  if (!from) {
    reject('no account')
  }
  const api = await getApi()
  const uni = api.createType('Compact<BalanceOf>', token2Uni(amount))
  const bonded = store.state.rococo.bonded
  console.log('bonded', bonded);
  const bondTx = bonded ? api.tx.staking.bondExtra(uni) : api.tx.staking.bond(from, uni, {
    Staked: null
  })
  const nonce = (await api.query.system.account(from)).nonce.toNumber()

  const unsub = await bondTx.signAndSend(from, {
    nonce
  }, ({
    status,
    dispatchError
  }) => {
    try {
      handelBlockState(api, status, dispatchError, toast, callback, unsub)
    } catch (e) {
      toast(e.message, {
        title: $t('tip.error'),
        variant: 'danger'
      })
    }
  })
}

/**
 *  解绑绑KSM
 * @param {number} amount 要解绑的KSM数量， 以KSM为单位
 * @param {function} toast toast
 * @param {function} callback callback
 */
export const unBond = async (amount, toast, callback) => {
  const from = store.state.polkadot.account && store.state.polkadot.account.address
  if (!from) {
    reject('no account')
  }
  const api = await getApi()
  const uni = api.createType('Compact<BalanceOf>', token2Uni(amount))
  const nonce = (await api.query.system.account(from)).nonce.toNumber()
  console.log('unbond');
  const unsub = await api.tx.staking.unbond(uni).signAndSend(from, {
    nonce
  }, ({
    status,
    dispatchError
  }) => {
    try{
      handelBlockState(api, status, dispatchError, toast, callback, unsub)
    }catch (e){
      toast(e.message, {
        title: $t('tip.error'),
        variant: 'danger'
      })
    }
  })
}

/**
 * 内部方法， 处理交易的block状态
 * @param {*} status 交易状态
 * @param {*} dispatchError 交易错误信息
 * @param {*} toast toast
 * @param {*} callback callback
 * @param {*} unsub unsub
 * @returns 
 */
function handelBlockState(api, status, dispatchError, toast, callback, unsub) {
  if (status.isInBlock || status.isFinalized) {
    if (dispatchError) {
      let errMsg = ''
      if (dispatchError.isModule) {
        // for module errors, we have the section indexed, lookup
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        const {
          documentation,
          name,
          section
        } = decoded;
        errMsg = `${section}.${name}: ${documentation.join(' ')}`
        console.log(`${section}.${name}: ${documentation.join(' ')}`);
      } else {
        // Other, CannotLookup, BadOrigin, no extra info
        console.log(dispatchError.toString());
        errMsg = dispatchError.toString()
      }
      toast(errMsg, {
        title: $t('tip.error'),
        variant: 'danger'
      })
      unsub()
      return false
    }
  }
  if (status.isBroadcast) {
    if (callback) callback()
    setTimeout(() => {
      toast($t('transaction.broadcasting'), {
        title: $t('tip.tips'),
        autoHideDelay: 5000,
        variant: 'warning'
      })
    }, 700);
  } else if (status.isInBlock) {
    console.log("Transaction included at blockHash.", status.asInBlock.toJSON());
    toast($t('transaction.inBlock'), {
      title: $t('tip.tips'),
      autoHideDelay: 6000,
      variant: 'warning'
    })
  } else if (status.isFinalized) {
    unsub()
    toast($t('transaction.transactionOk'), {
      title: $t('tip.success'),
      autoHideDelay: 5000,
      variant: "success",
    });
    // 上传daemon
    return true
  }
}
