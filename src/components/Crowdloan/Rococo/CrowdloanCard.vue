<template>
  <div class="ro-card">
    <div class="card-top-box">
      <div class="status-container text-right">
        <span>投票中</span>
      </div>
      <div class="card-title-box flex-start-center">
        <div class="icons">
          <img class="icon1" :src="getCardInfo && getCardInfo.community.iconUrl" alt=""/>
          <img class="icon2" :src="getCardInfo && getCardInfo.para.iconUrl" alt="" />
        </div>
        <div class="title-text font20 font-bold">
          <div class="link-title">
            <span class=" font20" @click="toCommunity">{{ getCardInfo && getCardInfo.community.communityName }}</span>
            <i class="link-icon"></i>
          </div>
          <div class="link-title">
            <span class="font16">{{ getCardInfo && getCardInfo.para.paraName }}</span>
            <i class="link-icon"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="c-card">
      <div class="detail-info-box">
        <div class="project-info-container">
          <span class="name"> Lease period </span>
          <div class="info">{{ leasePeriod || "test data" }}</div>
        </div>
        <div class="project-info-container">
          <span class="name"> Countdown </span>
          <div class="info">{{ countDown || "test data" }}</div>
        </div>
        <div class="project-info-container">
          <span class="name"> Fund </span>
          <div class="info">
            <RaisedLabel :paraId="paraId" />
            <ContributorsLabel :paraId="paraId" />
          </div>
        </div>
      </div>
      <div class="text-center" v-if="isConnected">
        <button
          class="primary-btn"
          v-show="status === 'Active'"
          @click="showContribute = true"
        >
          {{ $t('cl.contribute') }}
        </button>
        <button
          class="primary-btn"
          v-show="status === 'Retired'"
          @click="showWithdraw = true"
        >
          {{ $t('cl.withdraw') }}
        </button>
        <button
          class="primary-btn"
          disabled
          v-show="status === 'Completed'"
        >
          {{ $t('cl.completed') }}
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
    ...mapState('rococo', ["isConnected", "clProjectFundInfos"]),
    ...mapState(['lang']),
    ...mapGetters('rococo', [
      "fundInfo",
      "currentBlockNum",
      "cardInfo",
    ]),
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
    statusIcon() {
      switch (this.status) {
        case "Active":
          return this.lang === 'en' ? require("../../../static/images/card-active.svg") : require("../../../static/images/card-active-cn.png");
        case "Retired":
          return this.lang === 'en' ? require("../../../static/images/card-retired.svg") : require('../../../static/images/card-retired-cn.png');
        default:
          return this.lang === 'en' ? require("../../../static/images/card-completed.svg") : require('../../../static/images/card-completed-cn.png');
      }
    },
  },
  methods: {
    toCommunity() {
      this.$router.push('/crowdloan/rococo/community/' + this.communityId)
    },
    toParachain() {
      this.$router.push('/crowdloan/rococo/parachain/' + this.paraId)
    }
  },
  mounted() {
    this.status = this.getFundInfo.status;
  },
};
</script>

<style lang="scss" scoped>
@import "src/static/css/crowdloanCard";
.card-top-box {
  border-top-left-radius: 1.4rem;
  border-top-right-radius: 1.4rem;
  background-image: linear-gradient(to bottom, #ffffff, #F6F7F9);
  padding: .8rem 1.2rem 2.2rem;
  overflow: hidden;
  .status-container span {
    display: inline-block;
    height: 1.2rem;
    padding: 0 .4rem;
    border: 1px solid rgba(80, 191, 0, 0.3);
    color: #50BF00;
    border-radius: 1.2rem;
    line-height: 1.2rem;
    background: rgba(80, 191, 0, 0.05);
    font-size: .6rem;
  }
  .icons {
    display: flex;
    align-items: flex-end;
    width: 3.5rem;
    margin-right: .4rem;
    .icon1 {
      width: 2.8rem;
      height: 2.8rem;
    }
    .icon2 {
      margin-left: -.7rem;
      width: 1.4rem;
      height: 1.4rem;
    }
  }
  .title-text {
    flex: 1;
    overflow: hidden;
  }
  .link-title {
    display: flex;
    align-items: center;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      margin-right: .4rem;
    }
    .link-icon {
      display: inline-block;
      min-width: .8rem;
      width: .8rem;
      height: .8rem;
      background-repeat: no-repeat;
      background-image: url("~@/static/images/link-icon.png");
      background-position: center center;
      background-size: 100% 100%;
    }
  }
}
.c-card {
  margin-top: -1rem;
}
</style>
