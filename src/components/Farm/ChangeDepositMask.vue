<template>
  <transition name="fade">
    <div class="mask" @click.self="hideMask">
      <div class="change-box">
        <h5 class="title">
          {{
            (isAddStake ? $t("farm.stake") : $t("farm.unStake")) +
            " " +
            token[symbol]
          }}
        </h5>
        <div class="input-box">
          <div class="box-title-container">
            <span>{{
              isAddStake ? $t("farm.stake") : $t("farm.unStake")
            }}</span>
            <span
              >{{ $t("message.balance") }}:
              {{
                (isAddStake ? tokenBalance : stakedBalance) | amountForm
              }}</span
            >
          </div>
          <div class="box-content-container">
            <input
              class="input"
              placeholder="0"
              type="text"
              v-model="inputValue"
            />
            <b-button class="maxBtn" variant="primary" @click="fillMax">
              {{ $t("message.max") }}
            </b-button>
          </div>
        </div>
        <div class="bottom">
          <b-button variant="primary-line" class="cancel" @click="cancel">
            {{ $t("message.cancel") }}
          </b-button>
          <b-button
            variant="primary"
            class="confirm"
            @click="confirm"
            :disabled="isLoading"
          >
            <b-spinner small type="grow" v-show="isLoading"></b-spinner
            >{{ $t("message.confirm") }}
          </b-button>
        </div>
        <p @click="getToken" class="getToken">
          {{ $t("stake.get") + " " + token[symbol] }}
        </p>
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
import Card from "../ToolsComponents/Card";
import TipMessage from "../ToolsComponents/TipMessage";

import {
  intToAmount,
  amountToInt,
  isTransactionSuccess,
  isInsufficientEnerge,
} from "../../utils/chain/tron";
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { TRON_CONTRACT_CALL_PARAMS } from "../../config";
import { getContract } from "../../utils/chain/contract";
export default {
  name: "ChangeDepositMask",
  data() {
    return {
      isLoading: false,
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      inputValue: "",
      saveTokenMethod: {},
      saveStakedMethod: {},
      getTotalStakedMethod: {},
      token: {},
    };
  },
  components: {
    Card,
    TipMessage,
  },
  computed: {
    ...mapState([
      "tronAddress",
      "tspBalanceInt",
      "depositedTspInt",
      "tsteemBalanceInt",
      "depositedTsteemInt",
      "tspLpBalanceInt",
      "depositedTspLpInt",
      "pnutLpBalanceInt",
      "depositedPnutLpInt",
    ]),
    ...mapGetters([
      "tspBalance",
      "depositedTsp",
      "tsteemBalance",
      "depositedTsteem",
      "tspLpBalance",
      "depositedTspLp",
      "pnutLpBalance",
      "depositedPnutLp",
    ]),

    tokenBalance() {
      if (this.symbol === "TSP_POOL") {
        return this.tspBalance;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.tspLpBalance;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.pnutLpBalance;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.tsteemBalance
      }
    },
    stakedBalance() {
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
    tokenBalanceInt() {
      if (this.symbol === "TSP_POOL") {
        return this.tspBalanceInt;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.tspLpBalanceInt;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.pnutLpBalanceInt;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.tsteemBalanceInt
      }
    },
    stakedBalanceInt() {
      if (this.symbol === "TSP_POOL") {
        return this.depositedTspInt;
      } else if (this.symbol === "TSP_LP_POOL") {
        return this.depositedTspLpInt;
      } else if (this.symbol === "PNUT_LP_POOL") {
        return this.depositedPnutLpInt;
      } else if (this.symbol === "TSTEEM_POOL") {
        return this.depositedTsteemInt
      }
    },
  },
  props: {
    isAddStake: {
      type: Boolean,
      default: true,
    },
    symbol: {
      type: String,
      default: "TSP_POOL",
    },
  },
  methods: {
    ...mapActions([
      "getTsp",
      "getTsteem",
      "getDepositedTsp",
      "getPnut",
      "getTotalDepositedTsp",
      "getTotalDepositedTsteem",
      "getTotalDepositedTspLp",
      "getTotalDepositedPnutLp",
    ]),
    ...mapMutations([
      "saveTspBalanceInt",
      "saveTsteemBalanceInt",
      "saveDepositedTspInt",
      "saveDepositedTsteemInt",
      "saveTspLpBalanceInt",
      "saveDepositedTspLpInt",
      "savePnutLpBalanceInt",
      "saveDepositedPnutLpInt",
    ]),

    checkInput() {
      const reg = /^\d+(\.\d+)?$/;
      const res = reg.test(this.inputValue) && parseFloat(this.inputValue) > 0;
      if (!res) {
        this.showTip(this.$t("error.error"), this.$t("error.inputError"));
        return res;
      }
      const amount = parseFloat(this.inputValue);
      if (this.isAddStake) {
        if (amount > parseFloat(this.tokenBalance)) {
          this.showTip(this.$t("error.error"), this.$t("error.inputOverflow"));
          return false;
        }
        return true;
      } else {
        if (amount > parseFloat(this.stakedBalance)) {
          this.showTip(this.$t("error.error"), this.$t("error.inputOverflow"));
          return false;
        }
        return true;
      }
    },
    fillMax() {
      this.inputValue = this.isAddStake
        ? this.tokenBalance
        : this.stakedBalance;
    },
    confirm() {
      this.isAddStake ? this.deposit() : this.withdraw();
    },
    async deposit() {
      if (!this.checkInput()) {
        return;
      }
      try {
        this.isLoading = true;
        const depositInt = amountToInt(parseFloat(this.inputValue));
        const contract = await getContract(this.symbol);
        const res = await contract
          .deposit(depositInt)
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          this.saveTokenMethod[this.symbol](this.tokenBalanceInt - depositInt);
          if (this.stakedBalanceInt > 0) {
            this.saveStakedMethod[this.symbol](
              this.stakedBalanceInt - -depositInt
            );
          } else {
            this.saveStakedMethod[this.symbol](depositInt);
          }
          await this.getTotalStakedMethod[this.symbol]();
          this.$emit("hideMask");
        } else {
          if (res && (await isInsufficientEnerge(res))) {
            this.showTip(
              this.$t("error.error"),
              this.$t("error.insufficientEnerge")
            );
          } else {
            this.showTip(this.$t("error.error"), this.$t("error.depositFail"));
          }
        }
      } catch (e) {
        this.showTip(this.$t("error.error"), e.message);
      } finally {
        this.isLoading = false;
      }
    },

    async withdraw() {
      if (!this.checkInput()) {
        return;
      }
      try {
        this.isLoading = true;
        const minusInt = amountToInt(parseFloat(this.inputValue));
        const contract = await getContract(this.symbol);
        const res = await contract
          .withdraw(minusInt)
          .send(TRON_CONTRACT_CALL_PARAMS);
        if (res && (await isTransactionSuccess(res))) {
          this.saveTokenMethod[this.symbol](this.tokenBalanceInt - -minusInt);
          this.saveStakedMethod[this.symbol](this.stakedBalanceInt - minusInt);
          // await this.getPnut();
          // await this.saveTotalStakedMethod[this.symbol]();
          await Promise.all([
            this.getPnut(),
            this.getTotalStakedMethod[this.symbol](),
          ]);
          this.$emit("hideMask");
        } else {
          if (res && (await isInsufficientEnerge(res))) {
            this.showTip(
              this.$t("error.error"),
              this.$t("error.insufficientEnerge")
            );
          } else {
            this.showTip(this.$t("error.error"), this.$t("error.depositFail"));
          }
        }
      } catch (e) {
        this.showTip(this.$t("error.error"), e.message);
      } finally {
        this.isLoading = false;
      }
    },

    getToken() {
      if (this.symbol === "TSP_POOL") {
        this.$router.push("liquid-staking/tsp");
      } else if (this.symbol === "TSP_LP_POOL") {
        window.open(
          "https://justswap.org/#/home?tokenAddress=TW2EWoRUJfwH9nMTfLxSL9JPLZeusUtTfR&type=swap",
          "_blank"
        );
      } else if (this.symbol === "PNUT_LP_POOL") {
        window.open(
          "https://justswap.org/#/home?tokenAddress=TPZddNpQJHu8UtKPY1PYDBv2J5p5QpJ6XW&type=swap",
          "_blank"
        );
      } else if (this.symbol === "TSTEEM_POOL"){
        this.$router.push('wallet/swap')
      }
    },

    showTip(title, message) {
      this.tipTitle = title;
      this.tipMessage = message;
      this.showMessage = true;
    },
    hideMask() {
      if (this.isLoading) return;
      this.$emit("hideMask");
    },
    cancel() {
      this.hideMask();
    },
  },

  mounted() {
    (this.saveTokenMethod = {
      TSP_POOL: this.saveTspBalanceInt,
      TSP_LP_POOL: this.saveTspLpBalanceInt,
      PNUT_LP_POOL: this.savePnutLpBalanceInt,
      TSTEEM_POOL: this.saveTsteemBalanceInt,
    }),
      (this.saveStakedMethod = {
        TSP_POOL: this.saveDepositedTspInt,
        TSP_LP_POOL: this.saveDepositedTspLpInt,
        PNUT_LP_POOL: this.saveDepositedPnutLpInt,
        TSTEEM_POOL: this.saveDepositedTsteemInt,
      }),
      (this.getTotalStakedMethod = {
        TSP_POOL: this.getTotalDepositedTsp,
        TSP_LP_POOL: this.getTotalDepositedTspLp,
        PNUT_LP_POOL: this.getTotalDepositedPnutLp,
        TSTEEM_POOL: this.getTotalDepositedTsteem,
      });

    this.token = {
      TSP_POOL: "TSP",
      TSP_LP_POOL: "S-TSP-TRX",
      PNUT_LP_POOL: "S-PNUT-TRX",
      TSTEEM_POOL: "TSTEEM",
    };
  },
};
</script>

<style lang="scss" scoped>
@import "../../static/css/changeDepositMask.less";
</style>