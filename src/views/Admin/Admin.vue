<template>
  <div class="admin">
    <h3>
      {{ this.$t("admin.admin") }}
    </h3>
    <div class="nav sub-page-nav">
      <router-link to="/admin" exact>Pokadot</router-link>
      <router-link to="/admin/kusama">Kusama</router-link>
      <router-link to="/admin/rococo">Rococo</router-link>
      <div class="center-blank"></div>
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
