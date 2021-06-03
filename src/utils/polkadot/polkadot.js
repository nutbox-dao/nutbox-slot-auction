import {
  ApiPromise,
  WsProvider
} from "@polkadot/api"
import {
  isHex,
  hexToU8a,
  formatBalance as fb
} from "@polkadot/util"
import {
  encodeAddress,
  decodeAddress,
} from "@polkadot/util-crypto"
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import BN from "bn.js"
import {
  POLKADOT_WEB_SOCKET,
  NUTBOX_REMARK_TYPE
} from "../../config"
import store from "../../store"
import { POLKADOT_DECIMAL } from '@/constant'
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp'

export async function getApi() {
  if (store.state.polkadot.api) {
    return store.state.polkadot.api
  }
  store.commit('polkadot/saveIsConnected', false)

  console.log('connecting');
  await web3Enable('nutbox')
  const wsProvider = new WsProvider(POLKADOT_WEB_SOCKET)
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

  store.commit('polkadot/saveIsConnected', true)
  store.commit('polkadot/saveApi', api)
  console.log('save api');
  return api
}

export const formatBalance = (b) => {
  let uni = new BN(b)
  let unit = ' '
  if (uni >= 1e28) {
    uni = uni.div(new BN(1e24));
    unit = " E";
  } else if (uni >= 1e25) {
    uni = uni.div(new BN(1e21));
    unit = " P";
  } else if (uni >= 1e22) {
    uni = uni.div(new BN(1e18));
    unit = " T";
  } else if (uni >= 1e19) {
    uni = uni.div(new BN(1e15));
    unit = " B";
  } else if (uni >= 1e16) {
    uni = uni.div(new BN(1e12))
    unit = " M";
  } else if (uni >= 1e13) {
    uni = uni.div(new BN(1e9))
    unit = " K"
  } else if (uni >= 1e9) {
    uni = uni.div(new BN(1e6))
  } else if (uni >= 1e6) {
    uni = uni.div(new BN(1e3))
    unit = " milli "
  }
  uni = parseFloat(uni)
  uni = (uni / 1e4).toFixed(4)
  return uni + unit + 'DOT';
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
