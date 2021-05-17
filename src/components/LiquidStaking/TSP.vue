<template>
  <div class="swap-field">
    <div class="box">
      <div class="title-box">
        <p class="title">
          <span>{{ this.fromSteemToTron ? "STEEM" : "TSP" }}</span>
          <img
            style="margin: 0 8px 4px 8px"
            src="../../static/images/left-arrow.svg"
            alt=""
          />
          <span>{{ this.fromSteemToTron ? "TSP" : "STEEM" }}</span>
        </p>
        <p class="sub-title">
          {{ $t("liquidStaking.tsp.tspIsCirculatingSP") }}
        </p>
      </div>
    </div>
    <div class="line"></div>
    <div class="round-box">
      <div class="box-title-container">
        <span>from</span>
        <span>{{ $t("message.balance") + ": " + fromTokenBalance }} </span>
      </div>
      <div class="box-content-container">
        <input
          class="mb-2 mr-sm-2 mb-sm-0 user input"
          placeholder="0.0"
          v-model="transValue"
          @keyup="checkTransValue"
          inputmode="decimal"
          pattern="^[0-9]*[.,]?[0-9]*$"
          spellcheck="false"
          value
        />
        <div class="token-box">
          <button class="maxBtn" @click="fillMaxTrans">Max</button>
          <img
            class="coin-icon"
            src="../../static/images/tokens/steem.png"
            alt=""
            v-if="fromSteemToTron"
          />
          <img
            class="coin-icon"
            src="../../static/images/tokens/tsp.png"
            alt=""
            v-else
          />
          <span>
            {{ fromSteemToTron ? "STEEM" : "TSP" }}
          </span>
        </div>
      </div>
    </div>

      <div class="icon-box">
        <span
        @click="changeTransOrder"
          class="exchange-icon"
        />
      </div>
      
    <div class="round-box">
      <div class="box-title-container">
        <span>to</span>
        <span>{{ $t("message.balance") + ": " + toTokenBalance }} </span>
      </div>
      <div class="box-content-container">
        <input
          class="mb-2 mr-sm-2 mb-sm-0 user input"
          placeholder="0.0"
          v-model="transValue"
          @keyup="checkTransValue"
          inputmode="decimal"
          pattern="^[0-9]*[.,]?[0-9]*$"
          spellcheck="false"
          value
        />
        <div class="token-box">
          <img
            class="coin-icon"
            src="../../static/images/tokens/tsp.png"
            alt=""
            v-if="fromSteemToTron"
          />
          <img
            class="coin-icon"
            src="../../static/images/tokens/steem.png"
            alt=""
            v-else
          />
          <span>
            {{ fromSteemToTron ? "TSP" : "STEEM" }}
          </span>
        </div>
      </div>
    </div>

    <div class="confirm-box">
      <b-button
        variant="primary"
        class="confirm-btn"
        v-if="isLogin && isConnected"
        @click="trans"
        :disabled="!canTransFlag"
      >
        <b-spinner small type="grow" v-show="isLoading"></b-spinner>
        {{ $t("message.confirmconvert") }}
      </b-button>
      <b-button
        variant="primary"
        class="connectSteem"
        v-if="!isLogin"
        @click="showSteemLogin = true"
      >
        {{ $t("wallet.connectSteem") }}
      </b-button>
        <ConnectWalletBtn
          class="connectTron"
          v-if="!isConnected"
          @tronLogin="showTronLinkInfo"
          width="442"
          type="TRON"
        />

    </div>

    <!--手续费-->
    <div class="tip">
      <p v-if="fromSteemToTron">
        {{ $t("message.servicecharge") }}：
        {{ parseFloat(transferRatio * 100).toFixed(2) }}%，{{
          $t("message.atleastcharge")
        }}
        {{ transferFee }} STEEM
      </p>
      <!-- 兑换率 -->
      <p v-if="fromSteemToTron">
        {{ $t("message.convertrate") }}： 1 STEEM = 1 TSP
      </p>
      <p v-else>{{ $t("message.convertrate") }}： 1 TSP = 1 STEEM<br /></p>
      <p v-if="!fromSteemToTron">
        {{ $t("liquidStaking.tsp.tsptosteemintro") }}
      </p>
    </div>

    <Login v-if="showSteemLogin" @hideMask="showSteemLogin = false" />
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
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
import TipMessage from "../ToolsComponents/TipMessage";
import Login from "../Login";
import InstallTronLink from "../ToolsComponents/InstallTronLink";
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn";

import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import {
  STEEM_TO_TSP_FEE,
  STEEM_TO_TSP_FEE_RATIO,
  STEEM_TSP_ACCOUNT,
  TRON_CONTRACT_CALL_PARAMS,
  TRON_LINK_ADDR_NOT_FOUND
} from "../../config";
import {
  isAddress,
  amountToInt,
  isTransactionSuccess,
  isInsufficientEnerge,
  getTronLinkAddr
} from "../../utils/chain/tron";
import { getContract } from "../../utils/chain/contract";
import { steemTransferVest } from "../../utils/chain/steem";
import { formatBalance } from "../../utils/helper";

export default {
  name: "TSP",
  components: {
    TipMessage,
    ConnectWalletBtn,
    Login,
  },
  data() {
    return {
      canTransFlag: false,
      isLoading: false,
      transValue: "",
      transferFee: STEEM_TO_TSP_FEE,
      transferRatio: STEEM_TO_TSP_FEE_RATIO,
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      showSteemLogin: false,
      fromSteemToTron: true,
      showInstallTronLink: false,
    };
  },
  computed: {
    ...mapState(["steemBalance", "steemAccount", "tronAddress"]),
    ...mapGetters(["tspBalance"]),
    fromTokenBalance() {
      if (this.fromSteemToTron) {
        return formatBalance(this.steemBalance) + " STEEM";
      } else {
        return formatBalance(this.tspBalance) + " TSP";
      }
    },
    toTokenBalance() {
      if (!this.fromSteemToTron) {
        return formatBalance(this.steemBalance) + " STEEM";
      } else {
        return formatBalance(this.tspBalance) + " TSP";
      }
    },
    transFee() {
      if (this.fromSteemToTron) {
        const f = parseFloat(this.transValue) * STEEM_TO_TSP_FEE_RATIO;
        return f > STEEM_TO_TSP_FEE ? f : STEEM_TO_TSP_FEE;
      }
      return 0;
    },
    isLogin() {
      return this.steemAccount && this.steemAccount.length > 0;
    },
    isConnected() {
      return this.tronAddress && this.tronAddress.length > 0;
    },
  },

  methods: {
    ...mapActions(["getSteem", "getTsp", "getPnut"]),
    ...mapMutations(["saveSteemBalance", "saveTspBalanceInt"]),

    checkTransValue() {
      this.isLoading = false;
      const reg = /^\d+(\.\d+)?$/;
      const res = reg.test(this.transValue);
      let res1 = false;
      if (parseFloat(this.transValue) > 0) {
        res1 = true;
      }
      if (this.fromSteemToTron) {
        const res2 =
          parseFloat(this.transValue) <=
          parseFloat(parseFloat(this.steemBalance) - this.transFee).toFixed(3);

        this.canTransFlag = res1 && res && res2;
      } else {
        const res3 = parseFloat(this.transValue) <= parseFloat(this.tspBalance);
        this.canTransFlag = res1 && res && res3;
      }
    },

    async showTronLinkInfo() {
      const address = await getTronLinkAddr();
      console.log(address);
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

    fillMaxTrans() {
      if (!this.isLogin){
        this.showSteemLogin = true;
        return;
      }
      if (this.fromSteemToTron) {
        this.transValue = this.steemBalance;
        this.transValue = parseFloat(this.steemBalance - this.transFee);
      } else {
        this.transValue = parseFloat(this.tspBalance);
      }
      this.checkTransValue();
    },

    trans() {
      if (!isAddress(this.tronAddress)) {
        this.tipTitle = this.$t("error.error");
        this.tipMessage = this.$t("error.illegalTronAddress");
        this.showMessage = true;
        return;
      }
      this.isLoading = true;
      this.canTransFlag = false;
      if (this.fromSteemToTron) {
        this.steemToTsp();
      } else {
        this.tspToSteem();
      }
    },
    
    changeTransOrder() {
      this.fromSteemToTron = !this.fromSteemToTron;
      this.transValue = "";
      this.checkTransValue();
    },

    async steemToTsp() {
      try {
        const amount = parseFloat(this.transValue).toFixed(3);
        const res = await steemTransferVest(
          this.steemAccount,
          STEEM_TSP_ACCOUNT,
          amount,
          this.tronAddress,
          this.transFee
        );
        if (res.success === true) {
          const tspBalance = parseFloat(this.tspBalance);
          const steemBalance = parseFloat(this.steemBalance);
          this.saveTspBalanceInt(amountToInt(tspBalance + parseFloat(amount)));
          this.saveSteemBalance(
            steemBalance - parseFloat(amount) - parseFloat(this.transFee)
          );
        } else {
          this.tipTitle = this.$t("error.error");
          this.tipMessage = res.message;
          this.showMessage = true;
        }
      } catch (e) {
        this.tipTitle = this.$t("error.error");
        this.tipMessage = e.message;
        this.showMessage = true;
      } finally {
        this.transValue = "";
        this.checkTransValue();
      }
    },

    async tspToSteem() {
      try {
        const contract = await getContract("TSP");
        const amount = parseFloat(this.transValue);
        const amountInt = amountToInt(amount);
        const res = await contract
          .tspToSteem(this.steemAccount, amountInt)
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          this.saveTspBalanceInt(
            amountToInt(parseFloat(this.tspBalance) - parseFloat(amount))
          );
        } else {
          if (res && (await isInsufficientEnerge(res))) {
            this.tipMessage = this.$t("error.insufficientEnerge");
          } else {
            this.tipMessage = this.$t("error.transferFail");
          }
          this.tipTitle = this.$t("error.error");
          this.showMessage = true;
        }
      } catch (e) {
        this.tipTitle = this.$t("error.error");
        this.tipMessage = e.message;
        this.showMessage = true;
      } finally {
        this.transValue = "";
        this.checkTransValue();
      }
    },
  },
  mounted() {
    if (this.steemAccount && this.steemAccount.length > 0) {
      this.getSteem();
      this.getTsp();
      this.getPnut();
    }
  },
};
</script>

<style lang="less" scoped>
@import "../../static/css/swap.less";
</style>
