<template>
  <div class="dot-wallet">
    <div class="dot-wallet">
      <p class="item-title">
        {{ $t('wallet.asset') }}
      </p>
      <div class="balance-box">
        <BalanceView
          name="DOT"
          :balances="balance / 1e10 - locked / 1e10"
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
import BalanceView from "@/components/Wallet/BalanceView";
import { mapState } from 'vuex'
import UserNominations from '@/components/Wallet/UserNominations'

export default {
  name: "SteemWallet",
  data() {
    return {
      dotLogo: require("../../static/images/tokens/dot.png"),
    };
  },
  computed: {
    ...mapState('polkadot',['balance','locked', 'bonded'])
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
  .item-title{
    text-align: left;
    color: var(--primary-text);
    font-size: 16px;
    line-height: 32px;
    margin-top: 32px;
    border-bottom: 1px solid var(--dividers);
  }
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
