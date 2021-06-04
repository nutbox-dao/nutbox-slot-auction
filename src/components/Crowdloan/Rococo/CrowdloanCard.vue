<template>
  <div class="ro-card">
    <div class="card-link-top-box">
      <div class="status-container text-right">
        <span :class="status">{{ $t('cl.'+status) }}</span>
      </div>
      <div class="flex-start-center">
        <div class="card-link-icons">
          <img
            class="icon1"
            :src="getCardInfo && getCardInfo.community.iconUrl"
            alt=""
          />
          <img
            class="icon2"
            :src="getCardInfo && getCardInfo.para.iconUrl"
            alt=""
          />
        </div>
        <div class="card-link-title-text font20 font-bold">
          <div class="link-title">
            <span class="font20" @click="toCommunity">{{
              getCardInfo && getCardInfo.community.communityName + " " + $t('cl.community')
            }}</span>
            <i class="link-icon" @click="toCommunity"></i>
          </div>
          <div class="link-title">
            <span class="font16" @click="toParachain">{{
              getCardInfo && getCardInfo.para.paraName
            }}</span>
            <i class="link-icon" @click="toParachain"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="c-card">
      <div class="detail-info-box">
        <div class="project-info-container">
          <span class="name"> {{ $t('cl.leasePeriod') }} </span>
          <div class="info">{{ leasePeriod || "test data" }}</div>
        </div>
        <div class="project-info-container">
          <span class="name"> {{ $t('cl.countDown') }} </span>
          <div class="info">{{ countDown || "test data" }}</div>
        </div>
        <div class="project-info-container">
          <span class="name"> {{ $t('cl.fund') }} </span>
          <div class="info">
            <RaisedLabel :paraId="paraId" />
            <ContributorsLabel :paraId="paraId" />
          </div>
        </div>
      <div class="project-info-container">
        <span class="name"> {{ $t('cl.contributed') }} </span>
        <div class="info">
          <RaisedLabel :paraId="paraId" :isBalance="true" />
        </div>
      </div>
        <div class="project-info-container">
          <span class="name"> {{ $t('cl.rewards') }} </span>
          <div class="info">
            <RewardToken :icon='token.icon' :token='token.name' v-for="(token, idx) in rewardTokens" :key="idx"/>
          </div>
        </div>
      </div>
      <div class="text-center" v-if="isConnected">
        <button
          class="primary-btn"
          v-show="status === 'Active'"
          @click="showContribute = true"
        >
          {{ $t("cl.contribute") }}
        </button>
        <button
          class="primary-btn"
          v-show="status === 'Retired'"
          @click="showWithdraw = true"
        >
          {{ $t("cl.withdraw") }}
        </button>
        <button class="primary-btn" disabled v-show="status === 'Completed'">
          {{ $t("cl.completed") }}
        </button>
      </div>
    </div>
    <!-- <ConnectWallet v-else /> -->
    <b-modal
      v-model="showContribute"
      modal-class="custom-modal"
      centered
      hide-header
      hide-footer
      no-close-on-backdrop
    >
      <TipContribute
        :communityId="communityId"
        :paraId="paraId"
        :paraName="getCardInfo && getCardInfo.para.paraName"
        @hideContribute="showContribute = false"
      />
    </b-modal>
    <b-modal
      v-model="showWithdraw"
      modal-class="custom-modal"
      centered
      hide-header
      hide-footer
      no-close-on-backdrop
    >
      <TipWithdraw :paraId="paraId" @hideWithdraw="showWithdraw = false" />
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
// import ConnectWallet from "./Buttons/ConnectWallet";
import TipContribute from "./TipBoxes/TipContribute";
import TipWithdraw from "./TipBoxes/TipWithdraw";
import ContributorsLabel from "./Label/ContributorsLabel";
import RaisedLabel from "./Label/RaisedLabel";
import { PARA_STATUS } from "@/config";
import { BLOCK_SECOND, TIME_PERIOD } from "@/constant";
import { calStatus } from "@/utils/rococo/crowdloan";
import RewardToken from "@/components/Commen/RewardToken"

export default {
  data() {
    return {
      showContribute: false,
      showWithdraw: false,
      status: PARA_STATUS.COMPLETED,
    };
  },
  props: {
    paraId: {
      type: Number,
    },
    communityId: {
      type: String,
    },
  },
  components: {
    TipContribute,
    TipWithdraw,
    ContributorsLabel,
    RaisedLabel,
    RewardToken
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
  computed: {
    ...mapState("rococo", ["isConnected", "clProjectFundInfos"]),
    ...mapState(["lang"]),
    ...mapGetters("rococo", ["fundInfo", "currentBlockNum", "cardInfo"]),
    getFundInfo() {
      return this.fundInfo(this.paraId);
    },
    getCardInfo() {
      const card = this.cardInfo(this.paraId, this.communityId);
      return card;
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
    completion() {
      try {
        return this.getFundInfo.cap.isZero()
          ? "100.00%"
          : (
              this.getFundInfo.raised
                .muln(10000)
                .div(this.getFundInfo.cap)
                .toNumber() / 100
            ).toFixed(2) + "% ";
      } catch (e) {
        return "0.0%";
      }
    },
    rewardTokens(){
      if (this.getCardInfo){
        return this.getCardInfo.community.reward.concat(this.getCardInfo.para.reward)
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
  methods: {
    toCommunity() {
      this.$router.push("/crowdloan/rococo/community/" + this.communityId);
    },
    toParachain() {
      this.$router.push("/crowdloan/rococo/parachain/" + this.paraId);
    },
  },
  mounted() {
    this.status = this.getFundInfo.status;
  },
};
</script>

<style lang="scss" scoped>
@import "src/static/css/customCard";
.ro-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.c-card {
  flex: 1;
  margin-top: -1.2rem;
  padding: 1.8rem 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.detail-info-box {
  margin-top: 0;
}
</style>
