import BN from "bn.js"
import store from "@/store"
import {
  DECIMAL
} from '@/constant'
import {
  $t
} from '@/i18n'

import {
  createCrowdloanRemark
} from './remark'

import {
  stanfiAddress
} from './account'

import {
  handelBlockState
} from './transactionHandler'

export const withdraw = async (relaychain, paraId, toast, callback) => {
  const api = store.state[relaychain].api
  const from = store.state.polkadot.account?.address
  if (!from) {
    return false
  }
  const nonce = (await api.query.system.account(from)).nonce.toNumber()
  const unsub = await api.tx.crowdloan.withdraw(from, paraId).signAndSend(from, {
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
  }).catch((err) => {
    toast(err.message, {
      title: $t('tip.error'),
      variant: 'danger'
    })
    console.log(err);
    return false
  })
}


export const contribute = async (relaychain, paraId, amount, communityId, childId, trieIndex, toast, callback) => {
  const api = store.state[relaychain].api
  const from = store.state.polkadot.account && store.state.polkadot.account.address
  communityId = stanfiAddress(communityId)
  childId = stanfiAddress(childId)
  if (from === childId) {
    // 填写自己的地址无效
    childId = null
  }
  if (!from) {
    return false
  }
  const decimal = DECIMAL[relaychain]
  paraId = api.createType('Compact<u32>', paraId)
  amount = api.createType('Compact<BalanceOf>', new BN(amount * 1e6).mul(new BN(10).pow(decimal.sub(new BN(6)))))
  const nonce = (await api.query.system.account(from)).nonce.toNumber()
  const contributeTx = api.tx.crowdloan.contribute(paraId, amount, null)
  if (communityId) {
    const remark = createCrowdloanRemark(api, trieIndex, communityId, childId)
    const remarkTx = api.tx.system.remarkWithEvent(remark)
    const unsub = await api.tx.utility
      .batch([contributeTx, remarkTx]).signAndSend(from, {
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
      }).catch(err => {
        toast(err.message, {
          title: $t('tip.error'),
          variant: 'danger'
        })
        console.log(err);
        return false
      })
  }else{ // 没有社区id， 就是官方直接投票，不加remark
    const unsub = await contributeTx.signAndSend(from, {
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
    }).catch(err => {
      toast(err.message, {
        title: $t('tip.error'),
        variant: 'danger'
      })
      console.log(err);
      return false
    })
  }
}
