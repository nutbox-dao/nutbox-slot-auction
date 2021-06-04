<template>
  <div class="crowdloan-community scroll-content">
    <div class="loading-bg" v-if="!communityInfo">
      <img src="~@/static/images/loading.gif" alt="" />
      <p class="font16">{{ $t('tip.loading') }}</p>
    </div>
    <template v-else>
    <div class="community-info p-card">
      <img class="poster" :src="communityInfo.posterUrl" v-show="communityInfo.posterUrl && communityInfo.posterUrl.length > 4" alt="">
      <img class="back-icon" src="~@/static/images/left-arrow.png" alt="" @click="$router.back()"/>
      <div class="p-detail-info">
        <img class="logo" :src="communityInfo.iconUrl" alt="" />
        <div class="text-info">
          <span class="font20 font-bold title" v-if="communityInfo && (communityInfo.website.length < 6)">
            {{ communityInfo.communityName }}
          </span>
          <a class="font20 font-bold title official-link"
             v-else
             :href="communityInfo.website"
             target="_blank">{{ communityInfo.communityName }}</a>
          <div class="desc" v-html="communityInfo.description && communityInfo.description[lang]"></div>
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
    </template>
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
