<template>
  <div class="crowdloan-community scroll-content">
    <div class="community-info p-card">
      <img class="poster" :src="communityInfo.posterUrl" v-show="communityInfo.posterUrl && communityInfo.posterUrl.length > 4" alt="">
      <img class="back-icon" src="~@/static/images/left-arrow.png" alt="" @click="$router.back()"/>
      <div class="p-detail-info">
        <img class="logo" :src="communityInfo.iconUrl" alt="" />
        <div class="text-info">
          <span class="font20 font-bold title" v-if="communityInfo.website && communityInfo.website.length === 0">
            {{ communityInfo.communityName }}
          </span>
          <a class="font20 font-bold title official-link"
             v-else
             :href="communityInfo.website"
             target="_blank">{{ communityInfo.communityName }}</a>
          <div class="desc">{{ communityInfo.description && communityInfo.description[lang] }}</div>
        </div>
      </div>
    </div>
    <div class="card-container">
      <div class="row">
        <div class="col-xl-4 col-md-6" v-for="(crowdloan, idx) of crowdloanInfo" :key="idx">
          <CrowdloanCard :crowdloan="crowdloan"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CrowdloanCard from '@/components/Crowdloan/Rococo/ComCRCard'
import { mapState, mapGetters } from "vuex";
import { getOnshowingCrowdloanCard } from '@/apis/api'
import { stanfiAddress } from "@/utils/commen/account"
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
    ...mapState(['lang']),
    crowdloanInfo() {
        const id = stanfiAddress(this.$route.params.communityid);
        if (this.showingCard && this.showingCard.length > 0){
          return this.showingCard.filter(a => stanfiAddress(a.community.communityId) == id)
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
@import "src/static/css/projectInfoCard";
</style>
