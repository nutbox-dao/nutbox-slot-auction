<template>
  <div class="crowdloan-community scroll-content">
    <div class="community-info">
      <img class="back-icon" src="~@/static/images/left-arrow.png" alt="" @click="$router.push('/crowdloan/rococo')"/>
      <div class="detail-info">
        <img class="community-logo" :src="communityInfo.iconUrl" alt="" />
        <div class="text-info">
          <a class="font20 font-bold community-title"
             :href="communityInfo.website"
             target="_blank">{{ communityInfo.communityName }}</a>
          <div class="desc">{{ communityInfo.description[lang] }}</div>
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
    ...mapState(['lang']),
    crowdloanInfo() {
        const id = stanfiAddress(this.$route.params.communityid);
        if (this.showingCard && this.showingCard.length > 0){
          let ids = []
          let cards = []
          for (let card of this.showingCard){
            const communityId = stanfiAddress(card.community.communityId)
            const paraId = parseInt(card.para.paraId)
            if (id === communityId && ids.indexOf(paraId) === -1) {
              cards.push(card)
              ids.push(paraId)
            }
          }
           return cards
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
.community-info {
  background-color: rgba(204, 247, 255, 1);
  border-radius: 1.4rem;
  position: relative;
  margin-bottom: 1.2rem;
  .back-icon {
    position: absolute;
    left: 1.2rem;
    top: 1.2rem;
    width: 1.2rem;
    height: 1.2rem;
  }
  .detail-info {
    margin-top: 6.6rem;
    background: white;
    padding: .6rem 1.2rem 1.2rem;
    position: relative;
    border-bottom-left-radius: 1.4rem;
    border-bottom-right-radius: 1.4rem;
    .community-logo {
      position: absolute;
      border-radius: 3.6rem;
      width: 3.6rem;
      height: 3.6rem;
      top: -1.2rem;
      box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.1);
    }
    .text-info {
      margin-left: 4.4rem;
      .desc {
        color: #242629;
        font-size: .7rem;
        line-height: 1.2rem;
      }
    }
    .community-title {
      color: #242629;
      text-decoration: none;
      padding-right: 1.2rem;
      background-image: url("~@/static/images/official-link.png");
      background-repeat: no-repeat;
      background-size: 1rem 1rem;
      background-position: right center;
      margin-bottom: .3rem;
    }
  }
}
</style>
