<template>
  <div class="tron">
    <div class="balance-box">
      <BalanceView
        name="TRON"
        desc="TRON"
        :balances="tronBalance"
        :logo="tronLogo"
        walletType="TRON"
      />
      <BalanceView
        name="PNUT"
        desc="Nutbox Peanut"
        :balances="pnutBalance"
        :logo="pnutLogo"
        address="TPZddNpQJHu8UtKPY1PYDBv2J5p5QpJ6XW"
        walletType="TRON"
      />
      <BalanceView
        name="TSP"
        desc="Nutbox TSP"
        :balances="tspBalance"
        :logo="tspLogo"
        address="TW2EWoRUJfwH9nMTfLxSL9JPLZeusUtTfR"
        walletType="TRON"
      />
      <BalanceView
        name="TSBD"
        desc="Nutbox TSBD"
        :balances="tsbdBalance"
        :logo="tsbdLogo"
        address="TEPZJmYLJxJc8b5FueswwLWmUDhJGnih6Q"
        walletType="TRON"
      />
      <BalanceView
        name="TSTEEM"
        desc="Nutbox TSTEEM"
        :balances="tsteemBalance"
        :logo="tsteemLogo"
        address="TBUZYrDh7gzjd1PLnkMHWoAo55ctRzZzGN"
        walletType="TRON"
      />
      <BalanceView
        name="TSP-TRX LP"
        desc="S-TSP-TRX"
        :balances="tspLpBalance"
        :logo="tspLpLogo"
        address="TBpTbddofiBrE1AfhQbwU2BhsrBUM2Lnir"
        walletType="TRON"
      />
      <BalanceView
        name="PNUT-TRX LP"
        desc="S-PNUT-TRX"
        :balances="pnutLpBalance"
        :logo="pnutLpLogo"
        :balanceDigit="0"
        address="TPt2a3GtKMY5972mWa2aL3KKVY6ScWX2G2"
        walletType="TRON"
      />
    </div>
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
  </div>
</template>

<script>
import TipMessage from "../ToolsComponents/TipMessage";
import BalanceView from "./BalanceView";
import { mapActions, mapState, mapGetters } from "vuex";
import { getTronLinkAddr } from "../../utils/chain/tron";
import { TRON_LINK_ADDR_NOT_FOUND } from "../../config";

export default {
  name: "TronWallet",

  data() {
    return {
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      tronLogo: "https://coin.top/production/logo/trx.png",
      pnutLogo:require("../../static/images/tokens/pnut.png"),
      tsteemLogo: require("../../static/images/tokens/tsteem.png"),
      tsbdLogo: require("../../static/images/tokens/tsbd.png"),
      tspLogo: require("../../static/images/tokens/tsp.png"),
      tspLpLogo: require("../../static/images/tokens/tsp-lp.png"),
      pnutLpLogo: require("../../static/images/tokens/pnut-lp.png"),
    };
  },

  computed: {
    ...mapState(["tronAddress"]),
    ...mapGetters([
      "tronBalance",
      "pnutBalance",
      "tsteemBalance",
      "tspBalance",
      "tsbdBalance",
      "tspLpBalance",
      "pnutLpBalance",
    ]),
  },

  components: {
    TipMessage,
    BalanceView,
  },

  methods: {
    ...mapActions(["initializeTronAccount"]),
  },

  async mounted() {
    const address = await getTronLinkAddr();
    if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
      // this.tipTitle = this.$t("error.needtronlink");
      // this.tipMessage = "TronLink: https://www.tronlink.org";
      // this.showMessage = true;
    } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
      // this.tipTitle = this.$t("error.error");
      // this.tipMessage = this.$t("error.unlockWallet");
      // this.showMessage = true;
    } else if (address) {
      this.initializeTronAccount(address);
    }
  },
};
</script>

<style lang="less" scoped>
.tron {
  margin-top: 20px;
  .balance-box {
    display: flex;
    align-content: left;
    // z-index: 1;
    // justify-content: space-between;
    flex-wrap: wrap;
    >div{
      margin-top: 24px;
      margin-right: 24px;
    }
  }
}
</style>
