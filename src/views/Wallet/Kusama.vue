<template>
  <div class="steem-wallet">
    <div class="steem-wallet">
      <div class="balance-box">
        <BalanceView
          name="KSM"
          :balances="balance / 1e12"
          desc="KSM"
          :logo="steemLogo"
          :transfer='true'
          walletType="KSM"
        />
        <BalanceView
          name="KSM"
          :balances="bonded / 1e12"
          desc="Bonded KSM"
          :logo="steemLogo"
          :transfer='true'
          walletType="KSM-BONDED"
        />
      </div>
      <div class="nominations">

      </div>
    </div>
  </div>
</template>

<script>
import BalanceView from "@/components/Wallet/BalanceView";
import { mapState } from 'vuex'

export default {
  name: "SteemWallet",
  data() {
    return {
    };
  },
  computed: {
    ...mapState('kusama',['balance','bonded'])
  },
  components: {
    BalanceView,
  },
  async mounted() {
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
