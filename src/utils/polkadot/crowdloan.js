import {
  u8aConcat,
  u8aToHex,
} from "@polkadot/util"
import {
  blake2AsU8a,
  decodeAddress
} from "@polkadot/util-crypto"
import BN from "bn.js"
import store from "@/store"

import {
  getApi,
} from './polkadot'
import {
  withdraw as w,
  contribute as c,
  calStatus
} from '@/utils/commen/crowdloan'


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
  let unsubFund = store.state.polkadot.subFund
  if (unsubFund) {
    try {
      unsubFund()
    } catch (e) {}
  } else {
    store.commit('polkadot/saveLoadingFunds', true)
  }
  let paraId = crowdloanCard.map(c => parseInt(c.para.paraId))
  paraId = [...new Set(paraId)]
  const api = await getApi()
  try {
    unsubFund = (await api.query.crowdloan.funds.multi(paraId, async (unwrapedFunds) => {
      const bestBlockNumber = (await api.derive.chain.bestNumber()).toNumber()
      let funds = []
      for (let i = 0; i < unwrapedFunds.length; i++) {
        const fund = unwrapedFunds[i]
        const pId = paraId[i]
        if (!fund.toJSON()) {
          continue
        }
        unwrapedFunds[i] = unwrapedFunds[i].unwrap()
        unwrapedFunds[i].pId = pId
      }
      const storedFunds = [...store.state.polkadot.clProjectFundInfos]
      funds = await Promise.all(unwrapedFunds.map(fund => {
        return new Promise(async (res) => {
          const {
            pId,
            cap,
            depositor,
            end,
            firstPeriod,
            lastPeriod,
            raised,
            trieIndex
          } = fund

          const [status, statusIndex] = await calStatus('polkadot', end, firstPeriod, lastPeriod, raised, cap, pId, bestBlockNumber)
          let contributions = []
          // 如果有缓存，先直接用已经缓存的contribution数据
          if (storedFunds && storedFunds.length > 0) {
            const f = storedFunds.filter(a => a.paraId === pId)
            if (f && f.length > 0) {
              contributions = f[0].funds || []
            }
          }
          res({
            paraId: pId,
            status,
            statusIndex,
            cap: new BN(cap),
            depositor,
            end: new BN(end),
            firstPeriod: new BN(firstPeriod),
            lastPeriod: new BN(lastPeriod),
            raised: new BN(raised),
            trieIndex,
            funds: contributions
          })
        })
      }))
      funds = funds.sort((a, b) => a.statusIndex - b.statusIndex)
      const idsSort = funds.map(f => f.paraId)
      if (funds.length > 0) {
        const showingcrowdloanCard = crowdloanCard.filter(c => idsSort.indexOf(parseInt(c.para.paraId)) !== -1).sort((a, b) => idsSort.indexOf(parseInt(a.para.paraId)) - idsSort.indexOf(parseInt(b.para.paraId)))
        store.commit('polkadot/saveClProjectFundInfos', funds)
        store.commit('polkadot/saveShowingCrowdloan', showingcrowdloanCard)
        // 异步加载投票数据
        handleContributors(api, funds)
      } else {
        store.commit('polkadot/saveSubFund', null);
      }
      store.commit('polkadot/saveLoadingFunds', false)
    }));
    store.commit('polkadot/saveSubFund', unsubFund);
  } catch (e) {
    console.log('sub crowdloan fail', e);
    store.commit('polkadot/saveLoadingFunds', false)
  }
}

// 此过程最慢，使用异步加载的方式
export const handleContributors = async (api, funds) => {
  try {
    let account = store.state.polkadot.account?.address
    if (!account) return;
    account = decodeAddress(account)
    account = u8aToHex(account)
    const updateFunds = await Promise.all(funds.map(fund => {
      return new Promise(async (res) => {
        const pid = fund.paraId
        const contributions = await api.derive.crowdloan.contributions(pid)
        const own = await api.derive.crowdloan.ownContributions(pid, [account])
        fund.funds = {
          count: contributions.contributorsHex.length,
          ownContribution: own[account]
        }
        res(fund)
      })
    }))
    store.commit('polkadot/saveClProjectFundInfos', updateFunds)
  } catch (e) {
    console.log('Handle contributions fail', e);
  }
}

/**
 * Handel crowdloan cards from backend
 * @param {*} res 
 */
export function loadFunds(res) {
  let funds = [];
  // 预先展示服务器请求的数据
  for (const crowdloan of res) {
    const fund = crowdloan.para
    funds.push({
      paraId: parseInt(fund.paraId),
      status: fund.status,
      statusIndex: fund.statusIndex,
      cap: new BN(fund.cap),
      end: new BN(fund.end),
      firstPeriod: new BN(fund.firstPeriod),
      lastPeriod: new BN(fund.lastPeriod),
      raised: new BN(fund.raised),
      trieIndex: new BN(fund.trieIndex),
      funds: [],
    });
  }
  // 调整显示顺序
  funds = funds.sort((a, b) => a.statusIndex - b.statusIndex)
  const idsSort = funds.map(f => f.paraId)
  const showingcrowdloanCard = res.filter(c => idsSort.indexOf(parseInt(c.para.paraId)) !== -1).sort((a, b) => idsSort.indexOf(parseInt(a.para.paraId)) - idsSort.indexOf(parseInt(b.para.paraId)))
  store.commit("polkadot/saveClProjectFundInfos", funds);
  store.commit("polkadot/saveShowingCrowdloan", showingcrowdloanCard);
  store.commit("polkadot/saveLoadingFunds", false)
  // 在去链上订阅数据
  subscribeFundInfo(res)
}

export const withdraw = async (paraId, toast, callback) => {
  return await w('polkadot', paraId, toast, callback)
}

export const contribute = async (paraId, amount, communityId, childId, trieIndex, toast, callback) => {
  return await c('polkadot', paraId, amount, communityId, childId, trieIndex, toast, callback)
}
