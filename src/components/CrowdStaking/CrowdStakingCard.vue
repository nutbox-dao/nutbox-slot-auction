<template>
  <div class="c-card">
    <div class="card-title-box flex-start-center">
      <div class="icons">
        <img class="icon1" :src="crowdstaking.community.iconUrl" alt="" />
      </div>
      <div class="title-text font20 font-bold">
        <span>{{
          crowdstaking.community.communityName + " " + $t("cs.community")
        }}</span>
      </div>
    </div>
    <div class="h-line"></div>
    <template v-if="isConnected">
      <button
        class="primary-btn"
        @click="nominate"
        :disabled="nominated || loadingStaking"
      >
        <b-spinner small type="grow" v-show="loadingStaking"></b-spinner
        >{{ nominated ? $t("cs.nominated") : $t("cs.nominate") }}
      </button>
    </template>

    <b-modal
      v-model="showNominate"
      modal-class="custom-modal"
      centered
      hide-header
      hide-footer
      no-close-on-backdrop
    >
      <TipNominator
        :crowdstaking="crowdstaking"
        @hideNominate="showNominate = false"
      />
    </b-modal>

    <b-modal
      v-model="showBondAndNominator"
      modal-class="custom-modal"
      centered
      hide-header
      hide-footer
      no-close-on-backdrop
    >
      <TipBondAndNominator
        :crowdstaking="crowdstaking"
        @hideBondAndNominate="showBondAndNominator = false"
      />
    </b-modal>
  </div>
</template>

<script>
import TipBondAndNominator from "./TipBoxes/TipBondAndNominator";
import TipNominator from "./TipBoxes/TipNominator";
import { mapState } from "vuex";
import { stanfiAddress } from "@/utils/polkadot/polkadot";

export default {
  data() {
    return {
      showNominate: false,
      showBondAndNominator: false,
    };
  },
  props: {
    crowdstaking: {
      type: Object,
    },
    symbol: {
      type: String,
      default: "Kusama",
    },
  },
  components: {
    TipBondAndNominator,
    TipNominator,
  },
  methods: {
    async nominate() {
      if (this.bonded) {
        this.showNominate = true;
      } else {
        this.showBondAndNominator = true;
      }
    },
  },
  computed: {
    ...mapState("polkadot", [
      "isConnected",
      "lang",
      "bonded",
      "nominators",
      "loadingStaking",
    ]),
    ...mapState(["lang"]),
    // 用户已经投了该项目的节点
    nominated() {
      const val = this.crowdstaking.project.validators.map((tcd) =>
        stanfiAddress(tcd)
      );
      return (
        this.nominators.filter(({ address }) => val.indexOf(address) !== -1)
          .length === val.length
      );
    },
  },
  mounted() {},
};
</script>

<style lang="less">
.c-card {
  width: 100%;
  border-radius: 1.4rem;
  margin-bottom: 12px;
  overflow: hidden;
  border: none;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.02);
  position: relative;
  padding: 2.2rem 1.2rem;
  background-color: white;
  .primary-btn {
    width: 100%;
  }
  .status-container {
    position: absolute;
    right: 0;
    top: 0;
    img {
      width: 3.4rem;
      height: 3.4rem;
    }
  }
  .card-title-box {
    .icons {
      position: relative;
      margin-right: 2.4rem;
      img {
        width: 2rem;
        height: 2rem;
      }
      .icon2 {
        position: absolute;
        left: 1.8rem;
        border: 1px solid #e3e5e8;
        border-radius: 1rem;
      }
      .icon1 {
        position: relative;
        left: 0;
        border: 1px solid #e3e5e8;
        box-shadow: 0px 4px 12px 4px rgba(0, 0, 0, 0.05);
        border-radius: 1rem;
      }
    }
    .title-text {
      display: flex;
      justify-items: center;
      align-items: center;
    }
  }
  .h-line {
    width: 1.6rem;
    height: 0.2rem;
    background: var(--primary-custom);
    margin-top: 1.6rem;
    margin-bottom: 0.8rem;
    border-radius: 4px;
  }
  .detail-info-box {
    margin-bottom: 1.2rem;
  }
  .project-info-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.6rem;
    .name {
      flex: 1;
      text-align: left;
      color: rgba(189, 191, 194, 1);
      font-weight: bold;
    }
    .info {
      // flex: 0.8;
      text-align: right;
      font-weight: 500;
    }
  }
}
</style>
