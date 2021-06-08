import {
  ApiPromise,
  WsProvider
} from "@polkadot/api"
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import BN from "bn.js"
import {
  KUSAMA_WEB_SOCKET,
  NUTBOX_REMARK_TYPE
} from "@/config"
import store from "@/store"
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp'

export async function getApi() {
  if (store.state.kusama.api) {
    return store.state.kusama.api
  }
  store.commit('kusama/saveIsConnected', false)

  console.log('connecting');
  await web3Enable('nutbox')
  const wsProvider = new WsProvider(KUSAMA_WEB_SOCKET)
  const api = await ApiPromise.create({
    provider: wsProvider,
    rpc: jsonrpc,
    types: {
      PalletId: 'Raw',
      NutboxRemark: NUTBOX_REMARK_TYPE
    }
  })
  const injected = await web3FromSource('polkadot-js')
  api.setSigner(injected.signer)
  console.log('connected');

  store.commit('kusama/saveIsConnected', true)
  store.commit('kusama/saveApi', api)
  console.log('save api');
  return api
}
export const formatBalance = (b) => {
  let uni = new BN(b)
  let unit = ' '
  if (uni >= 1e30) {
    uni = uni.div(new BN(1e26));
    unit = " E";
  } else if (uni >= 1e27) {
    uni = uni.div(new BN(1e23));
    unit = " P";
  } else if (uni >= 1e24) {
    uni = uni.div(new BN(1e20));
    unit = " T";
  } else if (uni >= 1e21) {
    uni = uni.div(new BN(1e17));
    unit = " B";
  } else if (uni >= 1e18) {
    uni = uni.div(new BN(1e14))
    unit = " M";
  } else if (uni >= 1e15) {
    uni = uni.div(new BN(1e11))
    unit = " K"
  } else if (uni >= 1e11) {
    uni = uni.div(new BN(1e8))
  } else if (uni >= 1e8) {
    uni = uni.div(new BN(1e5))
    unit = " milli "
  }
  uni = parseFloat(uni)
  uni = (uni / 1e6).toFixed(4)
  return uni + unit + 'KSM';
}

/**
 * 估计交易的手续费
 * @param {object} tx 待执行的交易 
 */
export async function getTxPaymentInfo(tx) {
  const info = await tx.paymentInfo(store.state.polkadot.account.address)
  console.log(info.partialFee.toHuman());
  return info.partialFee.toNumber()
}
