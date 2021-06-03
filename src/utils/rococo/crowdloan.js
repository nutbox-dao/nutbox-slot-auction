import {
  u8aConcat,
  u8aToHex,
} from "@polkadot/util"
import {
  blake2AsU8a,
  encodeAddress,
} from "@polkadot/util-crypto"
import BN from "bn.js"
import {
  PARA_STATUS,
} from "@/config"
import store from "../../store"

import {
  getApi,
  uni2Token,
  getDecimal,
} from './rococo'
import { withdraw as w, contribute as c } from '@/utils/commen/crowdloan'

function createChildKey(trieIndex) {
  return u8aToHex(
    u8aConcat(
      ':child_storage:default:',
      blake2AsU8a(
        u8aConcat('crowdloan', trieIndex.toU8a())
      )
    )
  );
}

export const subscribeFundInfo = async (crowdloanCard) => {
  return;
  let unsubFund = store.state.rococo.subFund
  if (unsubFund) {
    try {
      unsubFund()
    } catch (e) {}
  } else {
    store.commit('rococo/saveLoadingFunds', true)
  }
  let paraId = crowdloanCard.map(c => parseInt(c.para.paraId))
  paraId = [...new Set(paraId)]
  const api = await getApi()
  try {
    unsubFund = (await api.query.crowdloan.funds.multi(paraId, async (unwrapedFunds) => {
      const bestBlockNumber = (await api.derive.chain.bestNumber()).toNumber()
      const decimal = await getDecimal()
      let funds = []
      for (let i = 0; i < unwrapedFunds.length; i++) {
        const fund = unwrapedFunds[i]
        const pId = paraId[i]
        if (!fund.toJSON()) {
          continue
        }
        const unwrapedFund = fund.unwrap()
        const {
          deposit,
          cap,
          depositor,
          end,
          firstSlot,
          lastSlot,
          raised,
          trieIndex
        } = unwrapedFund
        console.log('index', pId, trieIndex.toNumber());
        const childKey = createChildKey(trieIndex)
        const keys = await api.rpc.childstate.getKeys(childKey, '0x')
        const ss58keys = keys.map(k => encodeAddress(k, 0))
        const values = await Promise.all(keys.map(k => api.rpc.childstate.getStorage(childKey, k)))
        const contributions = values.map((v, idx) => ({
          contributor: ss58keys[idx],
          amount: BN(api.createType('(Balance, Vec<u8>)', v.unwrap())[0]),
          memo: api.createType('(Balance, Vec<u8>)', v.unwrap())[1].toHuman()
        }))
        const [status, statusIndex] = await calStatus(end, firstSlot, raised, cap, pId, bestBlockNumber)
        funds.push({
          paraId: pId,
          status,
          statusIndex,
          deposit: uni2Token(new BN(deposit), decimal),
          cap: new BN(cap),
          depositor,
          end: new BN(end),
          firstSlot: new BN(firstSlot),
          lastSlot: new BN(lastSlot),
          raised: new BN(raised),
          trieIndex,
          funds: contributions
        })
      }
      funds = funds.sort((a, b) => a.statusIndex - b.statusIndex)
      const idsSort = funds.map(f => f.paraId)
      if (funds.length > 0) {
        const showingcrowdloanCard = crowdloanCard.filter(c => idsSort.indexOf(parseInt(c.para.paraId)) !== -1).sort((a, b) => idsSort.indexOf(parseInt(a.para.paraId)) - idsSort.indexOf(parseInt(b.para.paraId)))
        store.commit('rococo/saveClProjectFundInfos', funds)
        store.commit('rococo/saveShowingCrowdloan', showingcrowdloanCard)
      } else {
        store.commit('rococo/saveSubFund', null);
      }
      store.commit('rococo/saveLoadingFunds', false)
    }));
    store.commit('rococo/saveSubFund', unsubFund);
  } catch (e) {
    console.error('error', e);
    store.commit('rococo/saveLoadingFunds', false)
  }
}

// 获取当前的status
export const calStatus = async (end, firstSlot, raised, cap, pId, bestBlockNumber) => {
  const api = await getApi()
  const auctionEnd = await getAuctionEnd()
  const leasePeriod = await getLeasePeriod()
  const currentPeriod = Math.floor(bestBlockNumber / leasePeriod)
  const leases = (await api.query.slots.leases(pId)).toJSON()
  const isWinner = leases.length > 0
  const isCapped = (new BN(raised)).gte(new BN(cap))
  const isEnded = bestBlockNumber >= end || bestBlockNumber >= auctionEnd
  const retiring = (isEnded || currentPeriod > firstSlot) && bestBlockNumber < auctionEnd
  let status = ''
  let statusIndex = 0
  if (retiring) {
    status = PARA_STATUS.RETIRED
    statusIndex = 1
  } else {
    if (!(isCapped || isEnded || isWinner) && currentPeriod <= firstSlot) {
      status = PARA_STATUS.ACTIVE
      statusIndex = 0
    } else {
      status = PARA_STATUS.COMPLETED
      statusIndex = 2
    }
  }
  return [status, statusIndex]
}

export const getAuctionEnd = async () => {
  if (store.state.auctionEnd) {
    return store.state.auctionEnd
  }
  const api = await getApi()
  const bestBlockHash = await api.rpc.chain.getBlockHash();
  const auctionInfo = (await api.query.auctions.auctionInfo.at(bestBlockHash)).toJSON();
  const auctionEnd = auctionInfo ? auctionInfo[1] : 0
  store.commit('rococo/saveAuctionEnd', auctionEnd)
  return auctionEnd
}

//  一个租赁周期
export const getLeasePeriod = async () => {
  if (store.state.rococo.clLeasePeriod > 0) {
    return store.state.rococo.clLeasePeriod
  }
  const api = await getApi()
  const leasePeriod = new BN(api.consts.slots.leasePeriod)
  store.commit('rococo/saveClLeasePeriod', leasePeriod)
  return leasePeriod
}

export const withdraw = async (paraId, toast, callback) => {
    w('rococo', paraId, toast, callback)
}


export const contribute = async (paraId, amount, communityId, childId, trieIndex, toast, callback) => {
    c('rococo', paraId, amount, communityId, childId, trieIndex, toast, callback)
}
