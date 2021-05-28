<template>
  <div class="wallet">
    <h3>
      {{ this.$t("wallet.wallet") }}
    </h3>
    <div class="nav sub-page-nav">
      <router-link to="/wallet" exact>Polkadot</router-link>
      <router-link to="/wallet/kusama">Kusama</router-link>
      <router-link to="/wallet/rococo">Rococo</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Wallet",
  data() {
    return {
      showLogout: false,
    };
  },
  computed: {
  },
  methods: {
  },
  mounted() {},
};
</script>

<style lang="less" scoped>
</style>
