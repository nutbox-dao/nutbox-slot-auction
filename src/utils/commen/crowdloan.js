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
    DECIMAL
  } from "@/config"
  import store from "@/store"
  
  import {
    $t
  } from '@/i18n'
  
  import {
    createCrowdloanRemark
  } from './remark'
  
  import {
    getDecimal,
    stanfiAddress
  } from './rococo'
  
  export const withdraw = async (relaychain, paraId, toast, isInblockCallback) => {
    return new Promise(async (resolve, reject) => {
      const from = store.state.polkadot.account?.address
      if (!from) {
        reject('no account')
      }
      const nonce = (await api.query.system.account(from)).nonce.toNumber()
      const unsub = await api.tx.crowdloan.withdraw(from, paraId).signAndSend(from, {
        nonce
      }, ({
        status,
        dispatchError
      }) => {
        if (status.isInBlock || status.isFinalized) {
          if (dispatchError) {
            let errMsg = ''
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const {
                documentation,
                name,
                section
              } = decoded;
              errMsg = `${section}.${name}: ${documentation.join(' ')}`
              console.log(`${section}.${name}: ${documentation.join(' ')}`);
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              console.log(dispatchError.toString());
              errMsg = dispatchError.toString()
            }
            toast(errMsg, {
              title: $t('tip.error'),
              variant: 'danger'
            })
            unsub()
            resolve(false)
          }
        }
        if (status.isBroadcast) {
          if (isInblockCallback) isInblockCallback()
          setTimeout(() => {
            toast($t('transaction.broadcasting'), {
              title: $t('tip.tips'),
              autoHideDelay: 5000,
              variant: 'warning'
            })
          }, 700);
        } else if (status.isInBlock) {
          console.log("Transaction included at blockHash.", status.asInBlock.toJSON());
          toast($t('transaction.inBlock'), {
            title: $t('tip.tips'),
            autoHideDelay: 6000,
            variant: 'warning'
          })
        } else if (status.isFinalized) {
          unsub()
          toast($t('transaction.withdrawOk'), {
            title: $t('tip.success'),
            autoHideDelay: 5000,
            variant: "success",
          });
          // 上传daemon
          resolve(status.asFinalized)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
  
  
  export const contribute = async (paraId, amount, communityId, childId, trieIndex, toast, inBlockCallback) => {
    return new Promise(async (resolve, reject) => {
      const from = store.state.polkadot.account && store.state.polkadot.account.address
      communityId = stanfiAddress(communityId)
      childId = stanfiAddress(childId)
      if (!from) {
        reject('no account')
      }
      const api = await injectAccount(store.state.polkadot.account)
      const decimal = await getDecimal()
      paraId = api.createType('Compact<u32>', paraId)
      amount = api.createType('Compact<BalanceOf>', new BN(amount * 1e6).mul(new BN(10).pow(decimal.sub(new BN(6)))))
      const nonce = (await api.query.system.account(from)).nonce.toNumber()
      const contributeTx = api.tx.crowdloan.contribute(paraId, amount, null)
      const remark = createCrowdloanRemark(api, trieIndex, communityId, childId)
      const remarkTx = api.tx.system.remarkWithEvent(remark)
      const unsubContribution = await api.tx.utility
        .batch([contributeTx, remarkTx]).signAndSend(from, {
          nonce
        }, ({
          status,
          dispatchError
        }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              let errMsg = ''
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const {
                  documentation,
                  name,
                  section
                } = decoded;
                errMsg = `${section}.${name}: ${documentation.join(' ')}`
                console.log(`${section}.${name}: ${documentation.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.log(dispatchError.toString());
                errMsg = dispatchError.toString()
              }
              toast(errMsg, {
                title: $t('tip.error'),
                variant: 'danger'
              })
              unsubContribution()
              resolve(false)
            }
          }
          if (status.isBroadcast) {
            if (inBlockCallback) inBlockCallback()
            setTimeout(() => {
              toast($t('transaction.broadcasting'), {
                title: $t('tip.tips'),
                autoHideDelay: 5000,
                variant: 'warning'
              })
            }, 700);
          } else if (status.isInBlock) {
            console.log("Transaction included at blockHash ", status.asInBlock.toJSON());
            const contriHash = status.asInBlock.toJSON()
            console.log({
              relaychain: 'rococo',
              blockHash: contriHash,
              communityId: communityId,
              nominatorId: childId
            });
            toast($t('transaction.inBlock'), {
              title: $t('tip.tips'),
              autoHideDelay: 6000,
              variant: 'warning'
            })
          } else if (status.isFinalized) {
            unsubContribution()
            toast($t('transaction.contributeOk'), {
              title: $t('tip.tips'),
              autoHideDelay: 5000,
              variant: "success",
            });
            // 添加memo
            // addMemo(communityId, childId, paraId, trieIndex, contriHash)
            resolve(status.isFinalized)
          }
        }).catch(err => {
          reject(err)
        })
    })
  }
  