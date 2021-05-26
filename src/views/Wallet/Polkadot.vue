<template>
  <div class="ksm-wallet scroll-content">
    <div class="ksm-wallet">
      <p class="item-title">
        {{ $t("wallet.asset") }}
      </p>
      <div class="balance-box row">
        <div class="col-xl-4 col-md-6">
          <BalanceView
            name="DOT"
            :balances="available / 1e10"
            desc="DOT"
            :logo="dotLogo"
            :transfer="true"
          />
        </div>
        <div class="col-xl-4 col-md-6">
          <LockedBalanceView
            name="DOT"
            :balances="locked / 1e10"
            desc="Locked DOT"
            :logo="dotLogo"
            :transfer="true"
          />
        </div>
      </div>
      <p class="item-title">
        {{ $t("wallet.nomination") }}
      </p>
      <UserNominations />
    </div>
  </div>
</template>

<script>
import BalanceView from "@/components/Wallet/Polkadot/BalanceView";
import LockedBalanceView from "@/components/Wallet/Polkadot/LockedBalanceView";
import { mapState, mapGetters } from "vuex";
import UserNominations from "@/components/Wallet/Polkadot/UserNominations";

export default {
  data() {
    return {
      dotLogo: require("../../static/images/tokens/dot.png"),
    };
  },
  computed: {
    ...mapState("polkadot", ["balance", "locked"]),
    ...mapGetters("polkadot", ["available"]),
  },
  components: {
    BalanceView,
    UserNominations,
    LockedBalanceView,
  },
  async mounted() {},
};
</script>

<style lang="less" scoped>
.ksm-wallet {
  margin-top: 1rem;
  .balance-box > div {
    margin-bottom: 1rem;
  }
}
</style>
