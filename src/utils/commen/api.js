import {
  ApiPromise,
  WsProvider
} from "@polkadot/api"
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import {
  POLKADOT_WEB_SOCKET,
  NUTBOX_REMARK_TYPE,
  KUSAMA_WEB_SOCKET,
  ROCOCO_WEB_SOCKET
} from "@/config"
import store from "@/store"
import {
  web3FromSource,
  web3Enable
} from '@polkadot/extension-dapp'

export async function initApis() {
  web3Enable('nutbox')
  console.log('start init', new Date().getTime());
  for (const chain of ['polkadot', 'kusama', 'rococo']) {
    await Promise.all([initApi('polkadot'), initApi('kusama'), initApi('rococo')])
  }
}

async function initApi(chain) {
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

  const wsProvider = new WsProvider(node[chain])
  const api = await ApiPromise.create({
    provider: wsProvider,
    rpc: jsonrpc,
    types: {
      PalletId: 'Raw',
      NutboxRemark: NUTBOX_REMARK_TYPE
    }
  })
  // await web3Enable('nutbox')
  // const injected = await web3FromSource('polkadot-js')
  // api.setSigner(injected.signer)
  console.log(new Date().getTime(), chain, 'connected');

  store.commit(chain + '/saveIsConnected', true)
  store.commit(chain + '/saveApi', api)
}


export function inject(){
  web3Enable('nutbox').then(async ()=>{
    const apis = {
      polkadot: store.state.polkadot.api,
      kusama: store.state.kusama.api,
      rococo: store.state.rococo.api,
    }
    for (const chain of ['polkadot', 'kusama', 'rococo']){
      const api = apis[chain]
      const injected = await web3FromSource('polkadot-js')
      api.setSigner(injected.signer)
      store.commit(chain + '/saveApi', api)
    }

  })
}