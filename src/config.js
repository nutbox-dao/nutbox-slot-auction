
// Steem Config
export const STEEM_API_URLS = [
  process.env.STEEM_API_URL || 'https://api.steemitdev.com',
  'https://cn.steems.top',
  'https://api.steemit.com',
  'https://api.justyy.com',
  'https://aksaiapi.wherein.mobi'
]

export const STEEM_CONF_KEY = 'steemNodeKey'

export const LOCALE_KEY = 'localeLanguage'

export const TRONWEB_API_KEY = process.env.TRONWEB_API_KEY || '36a6e0fc-869b-423b-9d06-c0f45a89de05'
export const TRON_API_KEY_ON_WEB = process.env.TRON_API_KEY_ON_WEB || 'abb27a13-42f2-41ec-8abf-d68c11a88d65'
export const VUE_APP_KEY = process.env.VUE_APP_KEY
export const TRON_NODE_API = 'https://api.trongrid.io'
// export const TRON_NODE_API = 'https://tron-api.steem.fans/'
// export const TRON_NODE_API = 'https://tron.ohshit.cc'

export const TRC20_APPROVE_AMOUNT = 1e50

export const TSTEEM_TRANSFER_FEE = 1
export const STEEM_TO_TSP_FEE = 1
export const TSBD_TRANSFER_FEE = 0.03
export const STEEM_STAKE_FEE = 1

export const TRANSFER_FEE_RATIO = 0.002
export const STEEM_TO_TSP_FEE_RATIO = 0.002
export const PNUT_FOR_VOTE_RATE = 1000

export const POST_LINK_REG = /@[\w\.\-]+\/[\w\-]+\/?$/;


//  steem account
export const STEEM_DEX_ACCOUNT = process.env.STEEM_DEX_ACCOUNT || 'nutbox.dex'
export const STEEM_GAS_ACCOUNT = process.env.STEEM_GAS_ACCOUNT || 'nutbox.gas'
export const STEEM_MINE_ACCOUNT = process.env.STEEM_MINE_ACCOUNT || 'nutbox.mine'
export const STEEM_TSP_ACCOUNT = process.env.STEEM_TSP_ACCOUNT || 'nutbox-tsp'

export const TRON_CONTRACT_CALL_PARAMS = { feeLimit: 45_000_000 }
// Pnut contract
export const TRON_PNUT_CONTRACT = "TPZddNpQJHu8UtKPY1PYDBv2J5p5QpJ6XW";
export const TRON_PNUT_RECEIVE_ACCOUNT = "TMLMSuyygN1fL5HpUt1oQp3RjvdEsHZffG";
// TSP-TRX 交易对地址
export const TSP_TOKEN_ADDRESS = 'TW2EWoRUJfwH9nMTfLxSL9JPLZeusUtTfR'
export const TSP_POOL_ADDRESS = 'TF2Qz1byu4b54HPCKKY8FVwFeocKEZKW9D'
// TSP-LP
export const TSP_LP_TOKEN_ADDRESS = 'TBpTbddofiBrE1AfhQbwU2BhsrBUM2Lnir'
export const TSP_LP_POOL_ADDRESS = 'TTMY4ZkeBxmwj43bmaJUysac8w7ha7Fkhj'

// PNUT_LP  
export const PNUT_TOKEN_ADDRESS = 'TPZddNpQJHu8UtKPY1PYDBv2J5p5QpJ6XW'
export const PNUT_POOL_ADDRESS = 'TB8naH6r4bJyDvmZotgaGDRbbd2Mw4Jg5E'
export const PNUT_LP_TOKEN_ADDRESS = 'TPt2a3GtKMY5972mWa2aL3KKVY6ScWX2G2'
export const PNUT_LP_POOL_ADDRESS = 'TLud51bQbsvA3fGPoXw5e9NPb117ckYn5y'  

// TSTEEM
export const TSTEEM_TOKEN_ADDRESS = 'TBUZYrDh7gzjd1PLnkMHWoAo55ctRzZzGN'
export const TSTEEM_POOL_ADDRESS = 'TTyQs6taRKf2cr3dQq5jQMzoms9JGP3XYS'

// approvement
export const APPROVE_TOKEN_CONTRACT_PAIR = {
  TSP_POOL:[TSP_TOKEN_ADDRESS,TSP_POOL_ADDRESS],
  TSP_LP_POOL:[TSP_LP_TOKEN_ADDRESS,TSP_LP_POOL_ADDRESS],
  PNUT_LP_POOL:[PNUT_LP_TOKEN_ADDRESS,PNUT_LP_POOL_ADDRESS],
  TSTEEM_POOL: [TSTEEM_TOKEN_ADDRESS, TSTEEM_POOL_ADDRESS]
}

export const TRON_LINK_ADDR_NOT_FOUND = {
  walletLocked: 'walletLocked',
  noTronLink: 'noTronLink'
}
