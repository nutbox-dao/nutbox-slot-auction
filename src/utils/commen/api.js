import {
  ApiPromise,
  WsProvider
} from "@polkadot/api"
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import {
  POLKADOT_WEB_SOCKET,
  NUTBOX_REMARK_TYPE,
  KUSAMA_WEB_SOCKET,
  ROCOCO_WEB_SOCKET,
  DEBUG
} from "@/config"
import store from "@/store"
import {
  web3FromSource,
  web3Enable
} from '@polkadot/extension-dapp'

export async function initApis() {
  initApi('polkadot')
  initApi('rococo')
  await initApi('kusama')
}

async function initApi(chain) {
  if (chain === 'rococo' && !DEBUG){
    return;
  }
  const apis = {
    polkadot: store.state.polkadot.api,
    kusama: store.state.kusama.api,
    rococo: store.state.rococo.api,
  }
  const node = {
    polkadot: POLKADOT_WEB_SOCKET,
    kusama: KUSAMA_WEB_SOCKET,
    rococo: ROCOCO_WEB_SOCKET
  }
  if (apis[chain]) {
    return apis[chain]
  }
  console.log('connecting to', chain);
  store.commit(chain + '/saveIsConnected', false)

  const s = new Date().getTime()
  console.log('start init', chain, s);
  const wsProvider = new WsProvider(node[chain])
  const api = await ApiPromise.create({
    provider: wsProvider,
    rpc: jsonrpc,
    types: {
      PalletId: 'Raw',
      NutboxRemark: NUTBOX_REMARK_TYPE
    }
  })
  console.log((new Date().getTime() - s) / 1000, chain, 'connected');

  await web3Enable('nutbox')
  const injected = await web3FromSource('polkadot-js')
  api.setSigner(injected.signer)

  store.commit(chain + '/saveIsConnected', true)
  store.commit(chain + '/saveApi', api)
  subBlock(api, chain)
}

const subBlock = async (api, chain) => {
  // console.log('sub block');
  const subBlock = await api.rpc.chain.subscribeNewHeads((header) => {
    try {
      const number = header.number.toNumber()
      store.commit(chain + '/saveCurrentBlockNum', number)
    } catch (e) {

    }
  })
} 