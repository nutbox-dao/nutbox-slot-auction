import store from '../store'
import {
  getApys,
  getPnutLpExchangeInfo,
  getTspLpExchangeInfo
} from "../apis/api"


export const firstToUpper = function (str) {
  if (!str) {
    return
  }
  if (str.trim().length === 0) {
    return str
  }
  return str.trim().replace(str[0], str[0].toUpperCase())
}

export const sleep = async function (interval = 6) {
  return new Promise(resolve => {
    setTimeout(resolve, interval * 1000) // 6秒
  })
}

export const retryMethod = async function (func, retries = 5, interval = 1) {
  return new Promise((resolve, reject) => {
    const exc = async (retries) => {
      try {
        const res = await func()
        resolve(res)
      } catch (e) {
        setTimeout(async () => {
          if (retries > 0) {
            // console.log('retry method', retries)
            await exc(retries - 1)
          } else {
            reject(e)
          }
        }, interval * 1000)
      }
    }
    exc(retries)
  })
}

export const formatBalance = function (value, digit = 3) {
  if (!value) return '0'
  const str =
    digit != null && digit >= 0 ?
    Number(value).toFixed(digit).toString() :
    value.toString()
  let integer = str
  let fraction = ''
  if (str.includes('.')) {
    integer = str.split('.')[0]
    fraction = '.' + str.split('.')[1]
  }
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + fraction
}

export function getDateString(now, timezone, extra = 0) {
  now = now || new Date()
  const offset = timezone != null ? timezone * 60 : 0
  now = new Date(now.getTime() + (offset + extra) * 60 * 1000)
  return now.toISOString().replace('T', ' ').substring(0, 19)
}

export const storeApy = async function () {
  const [apys, pnutLpInfo, tspLpInfo] = await Promise.all([getApys(), getPnutLpExchangeInfo(), getTspLpExchangeInfo()])
  // calculate pnut-trx exchange pool apy
  const {
    volume24H,
    totalLiquidity
  } = pnutLpInfo.data
  const pnutLpExchangePoolApy = parseFloat(volume24H) * 365 * 0.3 / parseFloat(totalLiquidity)
  // calculate tsp-trx exchange pool apy
  const data = tspLpInfo.data
  const tspVolume24 = data.volume24H;
  const tspTotalLiquidity = data.totalLiquidity;
  const tspLpExchengePoolApy = parseFloat(tspVolume24) * 365 * 0.3 / parseFloat(tspTotalLiquidity)
  // save to cache
  store.commit('saveApy', parseFloat(apys.spApy).toFixed(1) + "%")
  store.commit('saveTspLpApy', parseFloat(apys.spApy).toFixed(1) + "% + " + tspLpExchengePoolApy.toFixed(1) + "%")
  store.commit('savePnutLpApy', parseFloat(apys.pnutLpApy).toFixed(1) + "% + " + pnutLpExchangePoolApy.toFixed(1) + "%")
  store.commit('saveTsteemApy',parseFloat(apys.tsteemApy).toFixed(1) + "%")
}
