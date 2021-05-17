import { get, post } from './axios'
import { CROWD_STAKING_API_URL } from '../config'

export const getCrowdstacking = async () => post(CROWD_STAKING_API_URL + '/crowdstaking/find/all')
