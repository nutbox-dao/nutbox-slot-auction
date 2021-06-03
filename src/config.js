
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

// polkadot
export const POLKADOT_WEB_SOCKET = "wss://rpc.polkadot.io"
export const KUSAMA_WEB_SOCKET = "wss://kusama-rpc.polkadot.io"
export const ROCOCO_WEB_SOCKET = "wss://crowdloan-test.nutbox.io/relaychain/ws"

export const CROWD_STAKING_API_URL = "https://api.crowdstaking.nutbox.io"
// export const CROWD_STAKING_API_URL = "http://localhost:3200"
export const CROWD_LOAN_API_URL = "https://api.crowdloan-test.nutbox.io"

export const PARA_STATUS = {
  ACTIVE: "Active",
  RETIRED: "Retired",
  COMPLETED: "Completed",
  OTHER: "Other"
}

// 添加到交易batch的remark结构
export const NUTBOX_REMARK_TYPE = {
  magic: 'Text',      // 默认为nutbox
  op: 'u8',           // 0为crowdloan， 1为crowdsta
  trieIndex: 'Option<u8>', // crowdloan 才有该字段
  communityId: 'Text',      // 通过哪个社区操作的
  projectId: 'Option<Text>', // 平行链项目方管理id，crowdloan时该字段为空
  nominatorId: 'Option<Text>' // 推荐人id
}