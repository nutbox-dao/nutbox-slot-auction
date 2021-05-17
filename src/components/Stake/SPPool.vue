<template>
  <div class="stake">
    <Card>
      <div class="title-box">
        <img src="../../static/images/tokens/sp.png" alt="" />
        <span class="title">
          {{ $t("message.delegatemine") }}
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
            <b-spinner small type="grow" v-show="isLoading"></b-spinner>
            {{ $t("message.withdraw") }}
          </b-button>
        </div>
      </div>

      <div class="op-box">
        <p class="info-title">
          <span class="info-token">STEEM POWER</span>
          <span class="info-desc">DELEGATED</span>
        </p>
        <div class="op-bottom" v-if="delegated && isLogin && isConnectTron">
          <span :class="delegatedSp > 0 ? 'token-number' : 'token-number-none'">
            {{ delegatedSp | amountForm }}
          </span>
          <div>
            <b-button
              class="minus-btn op-btn"
              @click="minusDelegate"
              :disabled="isLoading"
              >-</b-button
            >
            <b-button class="op-btn" @click="addDelegate" :disabled="isLoading"
              >+</b-button
            >
          </div>
        </div>
        <div class="op-bottom" v-if="!delegated && isLogin && isConnectTron">
          <span class="token-number-none"> 0 </span>
          <b-button
            variant="primary"
            @click="delegate"
            :disabled="!delegatedVestsOk"
          >
            <b-spinner small type="grow" v-show="!delegatedVestsOk"></b-spinner>
            {{ $t("stake.creaseDelegation") }}
          </b-button>
        </div>
        <ConnectWalletBtn
          class="op-bottom"
          v-if="!isLogin"
          @steemLogin="showSteemLogin = true"
        />
        <ConnectWalletBtn
          class="op-bottom"
          v-if="!isConnectTron"
          @tronLogin="showTronLinkInfo"
          type="TRON"
        />
      </div>
      <!--apy-->
      <p class="fee apy">
        <span>APY</span>
        <span>{{ apy }}</span>
      </p>
      <!-- total staked -->
      <p class="fee">
        <span>
          {{ $t("message.sptotaldelegate") }}
        </span>
        <span>
          {{ totalDelegatedSp | amountForm }}
        </span>
      </p>
    </Card>
    <Login v-if="showSteemLogin" @hideMask="showSteemLogin = false" />
    <ChangeDelegateMask
      :operate="operate"
      v-if="showChangeDelegateMask"
      @hideMask="showChangeDelegateMask = false"
    />
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
import Card from "../ToolsComponents/Card";
import TipMessage from "../ToolsComponents/TipMessage";
import ChangeDelegateMask from "./ChangeDelegateMask";
import Login from "../Login";
import { getContract } from "../../utils/chain/contract";
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn";
import InstallTronLink from "../ToolsComponents/InstallTronLink";

import {
  intToAmount,
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
  name: "SPPool",
  data() {
    return {
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      pendingPnut: null,
      isLoading: false,
      showSteemLogin: false,
      withdrawLoading: false,
      showChangeDelegateMask: false,
      showInstallTronLink: false,
      operate: "add",
    };
  },
  computed: {
    ...mapState([
      "steemAccount",
      "tronAddress",
      "steemBalance",
      "vestsToSteem",
      "vestsBalance",
      "delegatedVestsOk",
      "apy",
    ]),
    ...mapGetters([
      "spBalance",
      "pnutBalance",
      "delegatedSp",
      "totalDelegatedSp",
    ]),

    delegated() {
      return this.delegatedSp && this.delegatedSp > 0;
    },
    isLogin() {
      return this.steemAccount && this.steemAccount.length > 0;
    },
    isConnectTron() {
      return (
        this.tronAddress &&
        this.tronAddress.length > 0 &&
        this.tronAddress !== TRON_LINK_ADDR_NOT_FOUND.noTronLink &&
        this.tronAddress !== TRON_LINK_ADDR_NOT_FOUND.walletLocked
      );
    },
  },
  components: {
    Card,
    TipMessage,
    ConnectWalletBtn,
    Login,
    ChangeDelegateMask,
    InstallTronLink,
  },
  methods: {
    ...mapActions([
      "getVests",
      "getSteem",
      "getPnut",
      "getDelegatedSp",
      "getTotalDelegatedSP",
    ]),
    ...mapMutations([
      "saveSteemBalance",
      "saveVestsBalance",
      "savePnutBalanceInt",
      "saveDelegatedVestsInt",
    ]),

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
        const nutPool = await getContract("PNUT_POOL");
        if (!nutPool) return;
        const s = await nutPool.getPendingPeanuts().call();
        if (parseInt(s) === 0) {
          this.pendingPnut = null;
          return;
        }
        this.pendingPnut = intToAmount(s);
      } catch (e) {}
    },

    updatePendingPeanut() {
      if (
        !this.pendingPnut ||
        !this.delegatedVestsOk ||
        parseFloat(this.totalDelegatedSp) === 0
      ) {
        this.getPendingPeanut();
      } else {
        if (
          parseFloat(this.totalDelegatedSp) === 0 ||
          parseFloat(this.delegatedSp) === 0
        ) {
          return;
        }
        this.pendingPnut =
          parseFloat(this.pendingPnut) +
          (parseFloat(this.delegatedSp) * 10) /
            parseFloat(this.totalDelegatedSp);
      }
    },

    delegate() {
      if (!this.isConnectTron) {
        this.showInstallTronLink = true;
        return;
      }
      this.operate = "add";
      this.showChangeDelegateMask = true;
    },

    addDelegate() {
      this.delegate();
    },

    minusDelegate() {
      if (!this.isConnectTron) {
        this.showInstallTronLink = true;
        return;
      }
      this.operate = "minus";
      this.showChangeDelegateMask = true;
    },

    async withdrawPnut() {
      try {
        this.isLoading = true;
        this.withdrawLoading = true;
        const pnutPool = await getContract("PNUT_POOL");
        const res = await pnutPool
          .withdrawPeanuts()
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          // TODO: confirm the delegation is finished
          this.getPnut();
          this.pendingPnut = null;
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
        this.withdrawLoading = false;
      }
    },

    showTip(title, message) {
      this.tipTitle = title;
      this.tipMessage = message;
      this.showMessage = true;
    },
  },
  mounted() {
    if (this.steemAccount && this.steemAccount.length > 0) {
      this.getVests();
      this.getSteem();
    }
    if (this.tronAddress && this.tronAddress.length > 0) {
      // this.getPnut();
      this.getDelegatedSp();
      this.getTotalDelegatedSP();
      // 设置定时器以更新当前收益
      const timer = setInterval(this.updatePendingPeanut, 3000);
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
