<template>
  <transition name="fade">
    <div class="mask" @click.self="hideMask">
      <div class="change-box">
        <h5 class="title">
          {{
            operate === "add"
              ? $t("stake.creaseDelegation")
              : $t("stake.increaseDelegation")
          }}
        </h5>
        <div class="input-box">
          <div class="box-title-container">
            <span>{{
              operate === "add"
                ? $t("stake.creaseDelegation")
                : $t("stake.increaseDelegation")
            }}</span>
            <span
              >{{ $t("message.balance") }}:
              {{ operate === "add" ? formSP : formDelegatedSP }}</span
            >
          </div>
          <div class="box-content-container">
            <input
              class="input"
              placeholder="0"
              type="text"
              v-model="delegatevalue"
            />
            <b-button class="maxBtn" variant="primary" @click="fillMax">
              {{ $t("message.max") }}
            </b-button>
          </div>
        </div>
        <div class="bottom">
          <b-button class="cancel" variant="primary-line" @click="cancel">{{
            $t("message.cancel")
          }}</b-button>
          <b-button
            class="confirm"
            variant="primary"
            @click="confirm"
            :disabled="isLoading"
          >
            <b-spinner small type="grow" v-show="isLoading"></b-spinner
            >{{ $t("message.confirm") }}</b-button
          >
        </div>
        <p @click="getSp" class="getToken">{{ $t("stake.getSp") }}</p>
        <p class="fee">{{ $t("message.delegatecharge") }}： {{ fee }} STEEM</p>
      </div>
      <TipMessage
        :showMessage="tipMessage"
        :title="tipTitle"
        v-if="showMessage"
        @hideMask="showMessage = false"
      />
    </div>
  </transition>
</template>

<script>
import TipMessage from "../ToolsComponents/TipMessage";
import { getContract } from "../../utils/chain/contract";
import { formatBalance } from "../../utils/helper";

import { amountToInt } from "../../utils/chain/tron";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { steemDelegation, getDelegateFromSteem } from "../../utils/chain/steem";
import { STEEM_STAKE_FEE, STEEM_MINE_ACCOUNT } from "../../config";
import { sleep } from "../../utils/helper";

export default {
  name: "ChangeDelegateMask",
  data() {
    return {
      delegatevalue: "",
      fee: STEEM_STAKE_FEE,
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      isLoading: false,
    };
  },
  computed: {
    ...mapState([
      "steemAccount",
      "tronAddress",
      "steemBalance",
      "vestsToSteem",
      "vestsBalance",
    ]),
    ...mapGetters(["spBalance", "delegatedSp"]),
    formSP() {
      return formatBalance(this.spBalance);
    },
    formDelegatedSP() {
      return formatBalance(this.delegatedSp);
    },
  },
  components: {
    TipMessage,
  },
  props: {
    operate: {
      type: String,
      default: "add",
    },
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
      "saveDelegatedVestsInt",
    ]),

    checkInputValue() {
      const reg = /^\d+(\.\d+)?$/;
      const res =
        reg.test(this.delegatevalue) && parseFloat(this.delegatevalue) > 0;
      if (!res) {
        this.showTip(this.$t("error.error"), this.$t("error.inputError"));
      }
      return res;
    },

    hideMask() {
      if (this.isLoading) return;
      this.$emit("hideMask");
    },
    fillMax() {
      this.delegatevalue =
        this.operate === "add" ? this.spBalance : this.delegatedSp;
    },
    cancel() {
      this.hideMask();
    },
    async confirm() {
      let sp = 0;
      this.isLoading = true;
      const haveDelegated = await getDelegateFromSteem(this.steemAccount)
      if (haveDelegated < 0){
         this.showTip(
            this.$t("error.delegateerror"),
            this.$t("error.pleaseRetry")
          );
          this.isLoading = false
          return
      }
      if (this.operate === "add") {
        sp = parseFloat(haveDelegated) + parseFloat(this.delegatevalue);
      } else {
        sp = parseFloat(haveDelegated) - parseFloat(this.delegatevalue);
      }
      this.delegateSp(sp);
    },
    async checkAddress() {
      try {
        const nutPool = await getContract("PNUT_POOL");
        const res = await nutPool.delegators(this.tronAddress).call();
        const steemAcc = res.steemAccount;
        const checkSteem = await nutPool
          .checkSteemAccount(this.steemAccount)
          .call();
        if (
          this.steemAccount &&
          res.hasDeposited &&
          steemAcc !== this.steemAccount &&
          this.tronAddress !== checkSteem[1]
        ) {
          this.showTip(
            this.$t("error.delegateerror"),
            this.$t("error.accountChanged")
          );
          return false;
        } else {
          return true;
        }
      } catch (e) {
        this.showTip(this.$t("error.delegateerror"), e.message);
        return false;
      }
    },
    async delegateSp(sp) {
      try {
        sp = parseFloat(sp);
        if (
          (sp !== 0 && !this.checkInputValue()) ||
          !(await this.checkAddress()) ||
          !this.checkDelegateFee()
        ) {
          this.isLoading = false;
          return;
        }
        const amount = parseFloat(sp / this.vestsToSteem).toFixed(6);
        const res = await steemDelegation(
          this.steemAccount,
          STEEM_MINE_ACCOUNT,
          amount,
          this.tronAddress
        );
        if (res.success === true) {
          this.getVests(),
          this.getSteem(),
          await sleep();
          this.getDelegatedSp();
          this.getTotalDelegatedSP();
          this.$emit("hideMask");
        } else {
          this.showTip(this.$t("error.delegateerror"), res.message);
        }
      } catch (e) {
        this.showTip(this.$t("error.delegateerror"), e.message);
      } finally {
        this.delegatevalue = "";
        this.isLoading = false;
      }
    },

    checkDelegateFee() {
      if (this.steemBalance >= STEEM_STAKE_FEE) {
        return true;
      }
      this.showTip(
        this.$t("error.delegateerror"),
        this.$t("error.notEnoughFee")
      );
      return false;
    },
    getSp() {
      window.open("https://steemit.com/", "_blank");
    },
    showTip(title, message) {
      this.tipTitle = title;
      this.tipMessage = message;
      this.showMessage = true;
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../../static/css/changeDepositMask.less";
</style>