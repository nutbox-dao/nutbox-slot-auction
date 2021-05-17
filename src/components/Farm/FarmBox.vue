<template>
  <div class="stake">
    <Card>
      <div class="title-box">
        <img :src="logo[symbol]" alt="" />
        <span class="title">
          {{ title[symbol] }}
        </span>
      </div>
      <div class="pending-box">
        <p class="info-title">
          <span class="info-token">PNUT</span>
          <span class="info-desc">EARNED</span>
        </p>
        <div class="pending-input">
          <span :class="pendingPnut > 0 ? 'token-number' : 'token-number-none'">
            {{ pendingPnut | amountForm }}
          </span>
          <b-button
            variant="primary"
            @click="withdrawPnut"
            :disabled="pendingPnut <= 0 || isLoading"
          >
            <b-spinner small type="grow" v-show="isWithdrawing"></b-spinner>
            {{ $t("message.withdraw") }}
          </b-button>
        </div>
      </div>
      <div class="op-box">
        <p class="info-title">
          <span class="info-token">{{ token[symbol] }}</span>
          <span class="info-desc">STAKED</span>
        </p>

        <ConnectWalletBtn
          class="op-bottom"
          v-if="!isConnected"
          @tronLogin="showTronLinkInfo"
          type="TRON"
        />
        <div class="op-bottom" v-if="!approved && isConnected">
          <b-button
            variant="primary"
            @click="approveContract"
            :disabled="isLoading || !depositedDataIsOk"
            style="width: 272px"
          >
            <b-spinner
              small
              type="grow"
              v-show="isApproving || !depositedDataIsOk"
            ></b-spinner>
            {{ $t("message.approveContract") }}
          </b-button>
        </div>
        <div class="op-bottom" v-if="!deposited && isConnected && approved">
          <span class="token-number-none"> 0 </span>
          <b-button
            variant="primary"
            @click="addDeposit"
            :disabled="isLoading || !depositedDataIsOk"
          >
            <b-spinner
              small
              type="grow"
              v-show="!depositedDataIsOk"
            ></b-spinner>
            {{ $t("farm.stake") }}
          </b-button>
        </div>
        <div class="op-bottom" v-if="deposited && isConnected && approved">
          <span
            :class="depositedBalance > 0 ? 'token-number' : 'token-number-none'"
            >{{ depositedBalance | amountForm(showingDigit) }}</span
          >
          <div>
            <button
              class="minus-btn op-btn"
              @click="minusDeposit"
              :disabled="isLoading"
            >
              -
            </button>
            <button class="op-btn" @click="addDeposit" :disabled="isLoading">
              +
            </button>
          </div>
        </div>
      </div>

      <p class="fee apy">
        <span>APY</span>
        <span>{{ showingApy }}</span>
      </p>

      <p class="fee">
        <span>
          {{ totalDepositedDesc }}
        </span>
        <span>
          {{ totalDeposited | amountForm }}
        </span>
      </p>
    </Card>
    <ChangeDepositMask
      :isAddStake="isAddStake"
      v-if="showChangeDepositMask"
      @hideMask="showChangeDepositMask = false"
      :symbol="symbol"
    />
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      :type="tipType"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
    <InstallTronLink
      v-if="showInstallTronLink"
      @hideMask="showInstallTronLink = false"
    />
  </div>
</template>

<script>
import Card from "../ToolsComponents/Card";
import TipMessage from "../ToolsComponents/TipMessage";
import ChangeDepositMask from "./ChangeDepositMask";
import { approveContract, getContract } from "../../utils/chain/contract";
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn";
import InstallTronLink from "../ToolsComponents/InstallTronLink";

import {
  intToAmount,
  amountToInt,
  isTransactionSuccess,
  isInsufficientEnerge,
  getTronLinkAddr,
} from "../../utils/chain/tron";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import {
  TRON_CONTRACT_CALL_PARAMS,
  TRON_LINK_ADDR_NOT_FOUND,
} from "../../config";

export default {
  name: "FarmBox",
  components: {
    Card,
    TipMessage,
    ChangeDepositMask,
    ConnectWalletBtn,
    InstallTronLink,
  },
  data() {
    return {
      saveApproveMethod: {},
      title: {},
      depositedDesc: {},
      logo: {},
      token: {},
      tspPendingPnut: 0,
      tsteemPendingPnut: 0,
      tspLpPendingPnut: 0,
      pnutLpPendingPnut: null,
      tipMessage: "",
      tipTitle: "",
      tipType: "error",
      showMessage: false,
      showChangeDepositMask: false,
      isLoading: false,
      isApproving: false,
      isWithdrawing: false,
      isAddStake: true,
      showInstallTronLink: false,
    };
  },
  props: {
    symbol: {
      type: String,
      default: "TSP_LP_POOL",
    },
  },
  computed: {
    ...mapState([
      "tronAddress",
      "pnutLpBalanceInt",
      "depositedPnutLpInt",
      "pnutBalanceInt",
      "tspBalanceInt",
      "tsteemBalanceInt",
      "depositedTspInt",
      "depositedTsteemInt",
      "depositedTspOk",
      "depositedTsteemOk",
      "depositedTspLpOk",
      "depositedPnutLpOk",
      "approvedTsp",
      "approvedTsteem",
      "approvedTspLp",
      "approvedPnutLp",
      "apy",
      "tspLpApy",
      "pnutLpApy",
      "tsteemApy",
    ]),
    ...mapGetters([
      "pnutLpBalance",
      "depositedPnutLp",
      "pnutBalance",
      "tspBalance",
      "tsteemBalance",
      "depositedTsp",
      "depositedTsteem",
      "tspLpBalance",
      "depositedTspLp",
      "totalDepositedTsp",
      "totalDepositedTsteem",
      "totalDepositedTspLp",
      "totalDepositedPnutLp",
    ]),
    isConnected() {
      return this.tronAddress && this.tronAddress.length > 0;
    },
    depositedBalance() {
      if (this.symbol === "TSP_POOL") {
        return this.depositedTsp;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.depositedTspLp;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.depositedPnutLp;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.depositedTsteem;
      }
    },
    deposited() {
      if (this.symbol === "TSP_POOL") {
        return this.depositedTsp > 0;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.depositedTspLp > 0;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.depositedPnutLp > 0;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.depositedTsteem > 0;
      }
    },
    totalDeposited() {
      if (this.symbol === "TSP_POOL") {
        return this.totalDepositedTsp;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.totalDepositedTspLp;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.totalDepositedPnutLp;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.totalDepositedTsteem;
      }
    },
    pendingPnut() {
      let pnut = 0;
      if (this.symbol === "TSP_POOL") {
        pnut = this.tspPendingPnut;
      } else if (this.symbol === "TSP_LP_POOL") {
        pnut = this.tspLpPendingPnut;
      } else if (this.symbol === "PNUT_LP_POOL") {
        pnut = this.pnutLpPendingPnut;
      } else if (this.symbol === "TSTEEM_POOL") {
        pnut = this.tsteemPendingPnut;
      }
      if (parseFloat(pnut) === 0) {
        return null;
      }
      return pnut;
    },
    approved() {
      if (this.symbol === "TSP_POOL") {
        return this.approvedTsp;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.approvedTspLp;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.approvedPnutLp;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.approvedTsteem;
      }
    },

    totalDepositedDesc() {
      if (this.symbol === "TSP_POOL") {
        return this.$t("farm.tsp.totalDepositTsp");
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.$t("farm.tspLp.totalDepositTspLP");
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.$t("farm.pnutLp.totalDepositPnutLP");
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.$t("farm.tsteem.totalDepositTsteem");
      }
    },
    showingApy() {
      if (this.symbol === "TSP_POOL") {
        return this.apy;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.tspLpApy;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.pnutLpApy;
      } else if (this.symbol == "TSTEEM_POOL") {
        return this.tsteemApy;
      }
    },
    showingDigit() {
      if (this.symbol === "PNUT_LP_POOL") {
        return 0;
      } else {
        return 3;
      }
    },
    depositedDataIsOk() {
      if (this.symbol === "TSP_POOL") {
        return this.depositedTspOk;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.depositedTspLpOk;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.depositedPnutLpOk;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.depositedTsteemOk;
      }
    },
  },
  methods: {
    ...mapActions([
      "getPnut",
      "getTsp",
      "getTsteem",
      "getDepositedTsp",
      "getDepositedTsteem",
      "getTspLp",
      "getDepositedTspLp",
      "getPnutLp",
      "getDepositedPnutLp",
      "getTotalDepositedTsp",
      "getTotalDepositedTsteem",
      "getTotalDepositedTspLp",
      "getTotalDepositedPnutLp",
      "getApprovedTSP",
      "getApprovedTSTEEM",
      "getApprovedTSPLP",
      "getApprovedPNUTLP",
    ]),
    ...mapMutations([
      "savePnutLpBalanceInt",
      "saveDepositedPnutLpInt",
      "savePnutBalanceInt",
      "saveTspBalanceInt",
      "saveTsteemBalanceInt",
      "saveDepositedTspInt",
      "saveApprovedTSP",
      "saveApprovedTSTEEM",
      "saveApprovedTSPLP",
      "saveApprovedPNUTLP",
    ]),

    async approveContract() {
      this.isLoading = true;
      this.isApproving = true;
      try {
        const res = await approveContract(this.symbol);
        if (res === 0) {
          this.saveApproveMethod[this.symbol](true);
        } else if (res === 1) {
          this.showTip(this.$t("error.error"), this.$t("error.approveFail"));
        } else {
          this.showTip(
            this.$t("error.error"),
            this.$t("error.insufficientEnerge")
          );
        }
      } catch (e) {
        this.showTip(this.$t("error.error"), e.message);
      } finally {
        this.isLoading = false;
        this.isApproving = false;
      }
    },
    minusDeposit() {
      this.isAddStake = false;
      this.showChangeDepositMask = true;
    },
    addDeposit() {
      this.isAddStake = true;
      this.showChangeDepositMask = true;
    },
    async withdrawPnut() {
      try {
        this.isLoading = true;
        this.isWithdrawing = true;
        const contract = await getContract(this.symbol);
        const res = await contract
          .withdrawPeanuts()
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          this.savePnutBalanceInt(
            this.pnutBalanceInt - amountToInt(-parseFloat(this.pendingPnut))
          );
        } else {
          if (res && (await isInsufficientEnerge(res))) {
            this.showTip(
              this.$t("error.error"),
              this.$t("error.insufficientEnerge")
            );
          } else {
            this.showTip(this.$t("error.error"), this.$t("error.withdrawFail"));
          }
        }
      } catch (e) {
        this.showTip(this.$t("error.error"), e.message);
      } finally {
        this.isLoading = false;
        this.isWithdrawing = false;
      }
    },

    async showTronLinkInfo() {
      const address = await getTronLinkAddr();
      if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
        this.showInstallTronLink = true;
      } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
        this.tipTitle = this.$t("message.tips");
        this.tipMessage = this.$t("error.unlockWallet");
        this.tipType = "tip";
        this.showMessage = true;
      } else if (address) {
        this.$store.dispatch("initializeTronAccount", address);
        this.$router.go(0);
      }
    },
    async getPendingPeanut() {
      try {
        if (this.symbol === "TSP_POOL") {
          const contract = await getContract(this.symbol);
          if (!contract) return;
          const s = await contract.getPendingPeanuts().call();
          const pnut = intToAmount(s);
          this.tspPendingPnut = pnut;
        } else if (this.symbol === "TSP_LP_POOL") {
          const contract = await getContract(this.symbol);
          if (!contract) return;
          const s = await contract.getPendingPeanuts().call();
          const pnut = intToAmount(s);
          this.tspLpPendingPnut = pnut;
        } else if (this.symbol === "PNUT_LP_POOL") {
          if (
            !this.pnutLpPendingPnut ||
            parseFloat(this.totalDeposited) === 0 ||
            !this.depositedPnutLpOk
          ) {
            const contract = await getContract(this.symbol);
            if (!contract) return;
            const s = await contract.getPendingPeanuts().call();
            const pnut = intToAmount(s);
            this.pnutLpPendingPnut = pnut;
          } else {
            if (
              parseFloat(this.depositedBalance) === 0 ||
              parseFloat(this.totalDeposited) === 0
            ) {
              return;
            }
            this.pnutLpPendingPnut =
              parseFloat(this.pnutLpPendingPnut) +
              (parseFloat(this.depositedBalance) * 0.2) /
                parseFloat(this.totalDeposited);
          }
        } else if (this.symbol === "TSTEEM_POOL") {
          const contract = await getContract(this.symbol);
          if (!contract) return;
          const s = await contract.getPendingPeanuts().call();
          const pnut = intToAmount(s);
          this.tsteemPendingPnut = pnut;
        }
      } catch (e) {
        //   console.log(234,e);
      }
    },
    showTip(title, message) {
      this.tipTitle = title;
      this.tipType = "error";
      this.tipMessage = message;
      this.showMessage = true;
    },
  },

  mounted() {
    this.logo = {
      TSP_POOL: require("../../static/images/tokens/tsp.png"),
      TSP_LP_POOL: require("../../static/images/tokens/tsp-lp.png"),
      PNUT_LP_POOL: require("../../static/images/tokens/pnut-lp.png"),
      TSTEEM_POOL: require("../../static/images/tokens/tsteem.png"),
    };
    this.title = {
      TSP_POOL: "TSP STAKE",
      TSP_LP_POOL: "TSP-TRX LP",
      PNUT_LP_POOL: "PNUT-TRX LP",
      TSTEEM_POOL: "TSTEEM STAKE",
    };

    (this.token = {
      TSP_POOL: "TSP",
      TSTEEM_POOL: "TSTEEM",
      TSP_LP_POOL: "S-TSP-TRX",
      PNUT_LP_POOL: "S-PNUT-TRX",
    }),
      (this.depositedDesc = {
        TSP_POOL: this.$t("farm.tsp.yourTspAmount"),
        TSTEEM_POOL: this.$t("farm.tsteem.yourTsteemAmount"),
        TSP_LP_POOL: this.$t("farm.tspLp.yourTSPLPAmount"),
        PNUT_LP_POOL: this.$t("farm.pnutLp.yourPNUTLPAmount"),
      });
    this.saveApproveMethod = {
      TSP_POOL: this.saveApprovedTSP,
      TSTEEM_POOL: this.saveApprovedTSTEEM,
      TSP_LP_POOL: this.saveApprovedTSPLP,
      PNUT_LP_POOL: this.saveApprovedPNUTLP,
    };
    if (this.tronAddress && this.tronAddress.length > 0) {
      // 获取最新的数据
      if (this.symbol === "TSP_POOL") {
        this.getTsp();
        this.getDepositedTsp();
        this.getTotalDepositedTsp();
        this.getApprovedTSP();
      } else if (this.symbol === "TSTEEM_POOL") {
        this.getTsteem();
        this.getDepositedTsteem();
        this.getTotalDepositedTsteem();
        this.getApprovedTSTEEM();
      } else if (this.symbol === "TSP_LP_POOL") {
        this.getTspLp();
        this.getDepositedTspLp();
        this.getTotalDepositedTspLp();
        this.getApprovedTSPLP();
      } else if (this.symbol === "PNUT_LP_POOL") {
        this.getPnutLp();
        this.getDepositedPnutLp();
        this.getTotalDepositedPnutLp();
        this.getApprovedPNUTLP();
      }
      // 设置定时器以更新当前收益
      const timer = setInterval(this.getPendingPeanut, 3000);
      // 通过$once来监听定时器，在beforeDestroy钩子时被清除。
      this.$once("hook:beforeDestroy", () => {
        clearInterval(timer);
      });
    }
  },
};
</script>

<style lang="less" scoped>
@import "../../static/css/stake.less";
</style>
