<template>
  <div id="admin">
    <h3>
      {{$t('message.admin')}}
    </h3>
    <div class="set-box">
    <Card>
      <h5>
        设置Pnut买赞10%对应金额：
      </h5>
      <input v-model="pnutForVote" placeholder="填写对应数值" type="text">
      <b-button variant="primary" @click="update" :disabled="!isReady">更改</b-button>
    </Card>
    </div>
  </div>
</template>

<script>
import {
  getAccountInfo,
  updatePnutForVoteParams,
} from "../../utils/chain/steem";
import {STEEM_MINE_ACCOUNT} from '../../config'
import Card from '../ToolsComponents/Card'
export default {
    name: "Admin",
    data() {
      return {
        pnutForVote: 1000,
        isReady: false,
        posting_json_metadata:{},
      }
    },
    components: {
      Card,
    },
    methods: {
      async update() {
        const rate = parseInt(this.pnutForVote)
        this.posting_json_metadata['config'] = {
          'pnut_for_upvote':rate
        }
        const res = await updatePnutForVoteParams(JSON.stringify(this.posting_json_metadata))
        if (res){
          console.log('update res:',res);
        }
      }
    },
    async mounted () {
      const { posting_json_metadata } = await getAccountInfo(STEEM_MINE_ACCOUNT);
      const obj = JSON.parse(posting_json_metadata)
      if (Object.keys(obj).length > 0){
        this.posting_json_metadata = obj
        this.isReady = true;
      }
    },
};
</script>

<style lang="scss" scoped>
#admin{
  padding: 0px 40px 64px;
  .set-box{
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 64px;
  }
  .card{
    width: 560px !important;
  }
  input{
    width:100%;
    text-align: center;
    margin: 30px 0;
  }
  .btn{
    width: 120px;
  }
}
</style>