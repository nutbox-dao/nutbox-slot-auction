<template>
  <div class="swap-field">
    <div class="box">
      <div class="title-box">
        <p class="title">Nutbox Bridge</p>
        <p class="sub-title">{{ $t("wallet.swapSubTitle") }}</p>
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
              src="../../static/images/tokens/tsteem.png"
              alt=""
              v-else
            />
            <span>
              {{ fromSteemToTron ? "STEEM" : "TSTEEM" }}
            </span>
          </div>
        </div>
      </div>

      <div class="icon-box">
        <span @click="changeTransOrder" class="exchange-icon" />
      </div>

      <div class="round-box">
        <div class="box-title-container">
          <span>to</span>
          <span>{{ $t("message.balance") + ": " + toTokenBalance }} </span>
        </div>
        <div class="box-content-container">
          <input
            class="mb-2 mr-sm-2 mb-sm-0 user input"
            :class="canTransFlag ? 'isok' : 'isfalse'"
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
              src="../../static/images/tokens/tsteem.png"
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
              {{ fromSteemToTron ? "TSTEEM" : "STEEM" }}
            </span>
          </div>
        </div>
      </div>

      <div class="confirm-box">
        <b-button
          v-if="steemAccount && steemAccount.length > 0 && isConnected"
          class="confirm-btn"
          variant="primary"
          @click="trans"
          :disabled="!canTransFlag"
        >
          <b-spinner
            small
            type="grow"
            v-show="isLoading"
            style="margin-right: 8px"
          ></b-spinner>
          {{ $t("message.confirmconvert") }}
        </b-button>
        <b-button
          variant="primary"
          v-if="!steemAccount || steemAccount.length === 0"
          class="connectSteem"
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
        <p v-show="fromSteemToTron">
          {{ $t("message.servicecharge") }}：
          {{ parseFloat(transferRatio * 100).toFixed(2) }}%，{{
            $t("message.atleastcharge")
          }}
          {{ transferFee }} STEEM
        </p>
        <!-- 兑换率 -->
        <p v-if="fromSteemToTron">
          {{ $t("message.convertrate") }}： 1 STEEM = 1 TSTEEM
        </p>
        <p v-else>{{ $t("message.convertrate") }}： 1 TSTEEM = 1 STEEM<br /></p>
      </div>
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
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn"

import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import {
  TSTEEM_TRANSFER_FEE,
  TRANSFER_FEE_RATIO,
  STEEM_DEX_ACCOUNT,
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
import { steemWrap } from "../../utils/chain/steem";
import { formatBalance } from "../../utils/helper";

export default {
  name: "TSteemSwap",
  components: {
    TipMessage,
    Login,
    InstallTronLink,
    ConnectWalletBtn,
  },
  data() {
    return {
      fromSteemToTron: true,
      canTransFlag: false,
      isLoading: false,
      transValue: "",
      transferFee: TSTEEM_TRANSFER_FEE,
      transferRatio: TRANSFER_FEE_RATIO,
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      showSteemLogin: false,
      showInstallTronLink: false,
    };
  },
  computed: {
    ...mapState(["steemBalance", "steemAccount", "tronAddress"]),
    ...mapGetters(["tsteemBalance"]),
    fromTokenBalance() {
      if (this.fromSteemToTron) {
        return formatBalance(this.steemBalance);
      } else {
        return formatBalance(this.tsteemBalance);
      }
    },
    toTokenBalance() {
      if (!this.fromSteemToTron) {
        return formatBalance(this.steemBalance);
      } else {
        return formatBalance(this.tsteemBalance);
      }
    },
    transFee() {
      if (this.fromSteemToTron) {
        const f = parseFloat(this.transValue) * TRANSFER_FEE_RATIO;
        return f > TSTEEM_TRANSFER_FEE ? f : TSTEEM_TRANSFER_FEE;
      }
      return 0;
    },
    isConnected() {
      return this.tronAddress && this.tronAddress.length > 0;
    },
  },
  methods: {
    ...mapActions(["getSteem", "getTsteem"]),
    ...mapMutations(["saveSteemBalance", "saveTsteemBalanceInt"]),

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
        const res3 =
          parseFloat(this.transValue) <= parseFloat(this.tsteemBalance);
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

    changeTransOrder() {
      this.fromSteemToTron = !this.fromSteemToTron;
      this.transValue = "";
      this.checkTransValue();
    },

    fillMaxTrans() {
      if (!this.steemAccount || this.steemAccount.length === 0) {
        this.showSteemLogin = true;
        return;
      }
      if (this.fromSteemToTron) {
        this.transValue = this.steemBalance;
        this.transValue = parseFloat(this.steemBalance - this.transFee);
      } else {
        this.transValue = parseFloat(this.tsteemBalance);
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
        this.steemToTsteem();
      } else {
        this.tsteemToSteem();
      }
    },

    async steemToTsteem() {
      try {
        const amount = parseFloat(this.transValue);
        const res = await steemWrap(
          this.steemAccount,
          STEEM_DEX_ACCOUNT,
          amount,
          this.tronAddress + " +" + amount + " TSTEEM",
          "STEEM",
          this.tronAddress,
          this.transFee
        );
        if (res.success === true) {
          const tsteemBalance = parseFloat(this.tsteemBalance);
          const steemBalance = parseFloat(this.steemBalance);
          this.saveTsteemBalanceInt(
            amountToInt(tsteemBalance + parseFloat(amount))
          );
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

    async tsteemToSteem() {
      try {
        const contract = await getContract("TSTEEM");
        let amount = parseFloat(this.transValue);
        amount = amountToInt(amount);
        const res = await contract
          .tsteemToSteem(this.steemAccount, amount)
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          this.saveTsteemBalanceInt(
            amountToInt(parseFloat(this.tsteemBalance) - parseFloat(this.transValue))
          );
          this.saveSteemBalance(
            parseFloat(this.steemBalance) + parseFloat(this.transValue)
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
      this.getTsteem();
    }
  },
};
</script>

<style lang="less" scoped>
@import "../../static/css/swap.less";
</style>
