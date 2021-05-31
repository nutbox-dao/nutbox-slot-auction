<template>
  <div class="crowdloan-community">
    <div class="community-info">
      <!-- 返回按钮 -->
      <img src="~@/static/images/left-arrow.png" alt="" @click="$router.push('/crowdloan/rococo')"/>
      <!-- 背景 -->
      <img src="" alt="" />
      <!-- logo -->
      <img :src="communityInfo.iconUrl" alt="" />
      <p>
          {{ communityInfo.communityName }}
      </p>
      <p class="community-title"></p>
      <!-- outlink -->
      <img :src="communityInfo.website" alt="" />
      <a :href="communityInfo.website" target="__blank">
          <img src="~@/static/images/official-link.png" alt="">
      </a>
      <p class="community-desc">
          {{ communityInfo.description }}
      </p>
    </div>

    <div class="card-container">
        <CrowdloanCard :crowdloan='crowdloan' v-for="crowdloan in showingCard" :key='crowdloan.community.communtiyId'/>
    </div>
  </div>
</template>

<script>
import CrowdloanCard from '@/components/Community/Rococo/CrowdloanCard'
import { mapState, mapGetters } from "vuex";
import { getOnshowingCrowdloanCard } from '@/apis/api'
import { stanfiAddress } from '@/utils/polkadot/polkadot'
import {
  subscribeFundInfo as subscribeKusamaFundInfo
} from "@/utils/rococo/crowdloan";
export default {
  data() {
    return {
    };
  },
  name: 'Rococo',
  components: {
      CrowdloanCard
  },
  props: {},
  computed: {
    ...mapState("rococo", ["showingCrowdloan"]),
    ...mapGetters('rococo', ['showingCard']),
    crowdloanInfo() {
        console.log('showing1', this.showingCard, this.$route.params.communityid);
        console.log();
        const id = stanfiAddress(this.$route.params.communityid);
        if (this.showingCard && this.showingCard.length > 0){
            return this.showingCard.filter(f => stanfiAddress(f.community.communityId) === id)
        }
        return []
    },
    communityInfo(){
        return this.crowdloanInfo.length > 0 && this.crowdloanInfo[0].community
    }
  },  
  async created() {
    const res = await getOnshowingCrowdloanCard({relaychain:"rococo"})
    await subscribeKusamaFundInfo(res);
  },
};
</script>

<style lang="scss" scoped>
</style>