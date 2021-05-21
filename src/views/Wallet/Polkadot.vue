<template>
  <div class="dot-wallet">
    <div class="dot-wallet">
      <p class="item-title">
        {{ $t('wallet.asset') }}
      </p>
      <div class="balance-box">
        <BalanceView
          name="DOT"
          :balances="available / 1e10"
          desc="DOT"
          :logo="dotLogo"
          :transfer='true'
          walletType="DOT"
        />
        <BalanceView
          name="DOT"
          :balances="locked / 1e10"
          desc="Locked DOT"
          :logo="dotLogo"
          :transfer='true'
          walletType="DOT-Locked"
        />
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
    UserNominations
  },
  async mounted() {
  },
};
</script>

<style lang="less" scoped>
.dot-wallet {
  // margin-top: 20px;
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
