<template>
  <div class="dot-wallet">
    <div class="dot-wallet">
      <p class="item-title">
        {{ $t('wallet.asset') }}
      </p>
      <div class="balance-box row">
        <div class="col-sm-6 col-md-6 col-lg-4">
          <BalanceView
            name="DOT"
            :balances="available / 1e10"
            desc="DOT"
            :logo="dotLogo"
            :transfer='true'
            walletType="DOT"
          />
        </div>
        <div class="col-sm-6 col-md-6 col-lg-4">
          <BalanceView
            name="DOT"
            :balances="locked / 1e10"
            desc="Locked DOT"
            :logo="dotLogo"
            :transfer='true'
            walletType="DOT-Locked"
          />
        </div>
      </div>
      <p class="item-title">
        {{ $t('wallet.nomination') }}
      </p>
      <UserNominations/>
    </div>
  </div>
</template>

<script>
import BalanceView from "@/components/Wallet/Polkadot/BalanceView";
import LockedBalanceView from "@/components/Wallet/Polkadot/LockedBalanceView"
import { mapState, mapGetters } from 'vuex'
import UserNominations from '@/components/Wallet/Polkadot/UserNominations'

export default {
  name: "SteemWallet",
  data() {
    return {
      dotLogo: require("../../static/images/tokens/dot.png"),
    };
  },
  computed: {
    ...mapState('polkadot',['balance','locked']),
    ...mapGetters('polkadot', ['available'])
  },
  components: {
    BalanceView,
    UserNominations,
    LockedBalanceView
  },
  async mounted() {
  },
};
</script>

<style lang="less" scoped>
.dot-wallet {
}
</style>
