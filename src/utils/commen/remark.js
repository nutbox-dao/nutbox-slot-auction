export const createCrowdloanRemark = (api, trieIndex, communityId, nominatorId) => {
  const remark = api.createType('NutboxRemark', {
    magic: 'nutbox',
    op: 0,
    trieIndex,
    communityId,
    nominatorId,
  })
  return api.createType('Bytes', remark.toHex())
}

export const createCrowdstakingRemark = (api, communityId, nominatorId) => {
    const remark = api.createType('NutboxRemark', {
        magic: 'nutbox',
        op: 1,
        communityId,
        nominatorId
    })
    return api.createType('Bytes', remark.toHex())
}