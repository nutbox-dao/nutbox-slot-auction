<template>
  <div class="crowdloan-parachain">
    <div class="parachain-info">
      <!-- 返回按钮 -->
      <img
        src="~@/static/images/left-arrow.png"
        alt=""
        @click="$router.push('/crowdloan/rococo')"
      />
      <!-- 背景 -->
      <img src="" alt="" />
      <!-- logo -->
      <img :src="paraInfo.iconUrl" alt="" />
      <p>
        {{ paraInfo.paraName }}
      </p>
      <p class="community-title"></p>
      <!-- outlink -->
      <a :href="paraInfo.website" target="__blank">
        <img src="~@/static/images/official-link.png" alt="" />
      </a>
      <p class="community-desc">
        {{ paraInfo.description[lang] }}
      </p>
    </div>

    <div class="crowdloan-plan-container">
      <div>
        <p>
          {{ $t("cl.auctionPlan") }}
        </p>
        <a :href="paraInfo.rewardLink" target="__blank">
          <img src="~@/static/images/auctionPlanLink.png" alt="" />
        </a>
      </div>
      <p>
        {{ paraInfo.rewardPlan[lang] }}
      </p>
    </div>

    <div class="crowdloan-detail">
      <p>
        {{ $t("cl.auctionInfo") }}
      </p>
      <p>Lease Period: {{ leasePeriod }}</p>
      <p>Countdown: {{ countDown }}</p>
      <p>Raised: {{ fb(getFundInfo.raised) }}</p>
      <p>Fund: {{ fb(getFundInfo.cap) }}</p>
      <p>Progress: {{ percent }}</p>
      <p>Contributor Count: {{ getFundInfo.funds.length }}</p>
    </div>

    <div class="card-container">
        <p>
            {{ $t('cl.joinAuction') }}
        </p>
      <ParaCRCard
        :crowdloan="crowdloan"
        :status="status"
        v-for="crowdloan in crowdloanInfo"
        :key="crowdloan.community.communtiyId"
      />
    </div>
  </div>
</template>

<script>
import ParaCRCard from "@/components/Crowdloan/Rococo/ParaCRCard";
import { mapState, mapGetters } from "vuex";
import { getOnshowingCrowdloanCard } from "@/apis/api";
import { subscribeFundInfo as subscribeKusamaFundInfo } from "@/utils/rococo/crowdloan";
import { formatBalance } from "@/utils/rococo/rococo";
import { TIME_PERIOD } from "@/constant"
import { calStatus } from "@/utils/rococo/crowdloan";

export default {
  name: "Rococo",
  data() {
      return {
          status: ''
      }
  },
  components: {
    ParaCRCard,
  },
  computed: {
    ...mapState(["lang"]),
    ...mapState("rococo", ["isConnected", "clProjectFundInfos"]),
    ...mapGetters("rococo", [
      "showingCard",
      "fundInfo",
      "currentBlockNum",
      "cardInfo",
    ]),
    paraId(){
        return parseInt(this.$route.params.paraid)
    },
    crowdloanInfo() {
      if (this.showingCard && this.showingCard.length > 0) {
        return this.showingCard.filter(
          (f) => parseInt(f.para.paraId) === this.paraId
        );
      }
      return [];
    },
    paraInfo() {
      return this.crowdloanInfo.length > 0 && this.crowdloanInfo[0].para;
    },
    getFundInfo() {
      return this.fundInfo(this.paraId);
    },
    leasePeriod() {
      try {
        const first = parseInt(this.getFundInfo.firstSlot);
        const last = parseInt(this.getFundInfo.lastSlot);
        return first === last
          ? first + ""
          : parseInt(this.getFundInfo.firstSlot) +
              " - " +
              parseInt(this.getFundInfo.lastSlot);
      } catch (e) {
        return "0";
      }
    },
    countDown() {
      try {
        if (!this.getFundInfo) return;
        const end = parseInt(this.getFundInfo.end);
        const diff = end - parseInt(this.currentBlockNum);
        const timePeriod = TIME_PERIOD;
        if (diff > 0) {
          const secs = diff * BLOCK_SECOND;
          const month = Math.floor(secs / timePeriod["MONTH"]);
          const day = Math.floor(
            (secs % timePeriod["MONTH"]) / timePeriod["DAY"]
          );
          const hour = Math.floor(
            (secs % timePeriod["DAY"]) / timePeriod["HOUR"]
          );
          const min = Math.floor(
            (secs % timePeriod["HOUR"]) / timePeriod["MINUTES"]
          );
          const sec = Math.floor(secs % timePeriod["MINUTES"]);
          if (secs >= timePeriod["MONTH"]) {
            return month + " mons " + day + " days " + hour + " hrs";
          } else if (secs >= timePeriod["DAY"]) {
            return day + " days " + hour + " hrs " + min + " mins";
          } else if (secs >= timePeriod["HOUR"]) {
            return hour + " hrs " + min + " mins ";
          } else {
            return min + " mins " + sec + " sec";
          }
        }
        return "Completed";
      } catch (e) {
        console.error("err", e);
        return "";
      }
    },
    percent() {
      if (!this.getFundInfo) return;
      return (
        this.getFundInfo.cap.isZero()
        ? "100.00%"
        : (this.getFundInfo.raised.muln(10000).div(this.getFundInfo.cap).toNumber() / 100).toFixed(2) + "% "
      );
    },
    completion() {
      try {
        const raised = parseFloat(this.getFundInfo.raised);
        const cap = parseFloat(this.getFundInfo.cap);
        return parseFloat((raised * 100) / cap).toFixed(2) + "%";
      } catch (e) {
        return "0.0%";
      }
    },
    contributions() {
      try {
        return this.getFundInfo.funds.length;
      } catch (e) {
        return 0;
      }
    },
  },
    watch: {
    async currentBlockNum(newValue, _) {
      const fund = this.getFundInfo;
      const end = fund.end;
      const raised = fund.raised;
      const cap = fund.cap;
      const firstSlot = fund.firstSlot;
      const [status] = await calStatus(
        end,
        firstSlot,
        raised,
        cap,
        this.paraId,
        newValue
      );
      this.status = status;
    },
  },
  methods: {
      fb(a){
        return formatBalance(a)
      }
  },
  async created() {
    const res = await getOnshowingCrowdloanCard({ relaychain: "rococo" });
    await subscribeKusamaFundInfo(res);
  },
};
</script>

<style lang="scss" scoped>
</style>