<template>
  <div class="steem-wallet">
    <div class="steem-wallet">
      <div class="balance-box">
        <BalanceView
          name="STEEM"
          :balances="steemBalance+''"
          desc="STEEM"
          :logo="steemLogo"
          walletType="STEEM"
        />
        <BalanceView
          name="SP"
          :balances="spBalance+''"
          desc="STEEM POWER"
          :logo="spLogo"
          walletType="STEEM"
        />
        <BalanceView
          name="SBD"
          :balances="sbdBalance+''"
          desc="STEEM DOLLAR"
          :logo="sbdLogo"
          walletType="STEEM"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { getKeychain } from "../../utils/chain/steem";
import BalanceView from "./BalanceView";

export default {
  name: "SteemWallet",
  data() {
    return {
      steemLogo: require("../../static/images/tokens/steem.png"),
      sbdLogo: require("../../static/images/tokens/sbd.png"),
      spLogo: require("../../static/images/tokens/sp.png")
    };
  },
  computed: {
    ...mapState(["steemAccount", "steemBalance", "sbdBalance"]),
    ...mapGetters(["spBalance"]),
  },
  components: {
    BalanceView,
  },
  async mounted() {
    if (!(await getKeychain())) {
      // const link =
      //   "Chrome: https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm\n\n" +
      //   "Firefox: https://addons.mozilla.org/en-US/firefox/addon/steem-keychain";
      // this.tipTitle = this.$t("error.needkeychain");
      // this.tipMessage = link;
      // this.showMessage = true;
    } else {
      if (this.steemAccount && this.steemAccount.trim().length > 0) {
        this.$store.dispatch("initializeSteemAccount", this.steemAccount);
      }
    }
  },
};
</script>

<style lang="less" scoped>
.steem-wallet {
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
