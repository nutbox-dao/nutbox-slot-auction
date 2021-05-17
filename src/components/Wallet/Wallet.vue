<template>
  <div class="wallet" @click="showLogout=false">
    <h3>
      {{ this.$t("wallet.wallet") }}
    </h3>
    <div class="nav">
      <router-link to="/wallet" exact>Steem</router-link>
      <router-link to="/wallet/tron">Tron</router-link>
      <router-link to="/wallet/swap">{{ this.$t("wallet.swap") }}</router-link>
      <div class="center-blank"></div>
      <!-- 用户名 -->
      <button
        class="steem-account"
        @click.stop="showLogout = !showLogout"
        v-if="steemAccount && steemAccount.trim().length > 0"
      >
        <p>
        <span>
        {{ steemAccount }}
        </span>
        <img src="../../static/images/list-down-arrow.svg" alt="">
        </p>

        <button @click="logout" v-if="showLogout">
          {{ $t("message.logout") }}
        </button>
      </button>
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
    ...mapState(["steemAccount"]),
  },
  methods: {
    logout() {
      this.$store.commit("clearSteemAccount");
      
    },
  },
  mounted() {},
};
</script>

<style lang="less" scoped>
.wallet {
  padding: 0px 40px 64px;
  .nav {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--dividers);
    a {
      border: 0;
      font-size: 16px;
      padding: 18px 28px 14px 28px;
      color: #666;
      box-sizing: border-box;
      color: var(--secondary-text);
      font-weight: 600;
      line-height: 16px !important;
    }
    a:hover {
      background: linear-gradient(
        270deg,
        rgba(227, 229, 232, 0) 0%,
        rgba(227, 229, 232, 0.4) 100%
      ) !important;
      text-decoration: none;

      font-weight: 300;
      line-height: 16px;
    }
    .active {
      color: var(--primary-text);
      border-bottom: 3px solid var(--primary);
    }
    .center-blank {
      flex: 1;
    }
    .steem-account {
      height: 38px;
      background-color: #ffffff;
      box-shadow: 0px 10px 60px -5px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      border: 0;
      position: relative;
      box-sizing: border-box;
      font-size: 15px;
      background-repeat: no-repeat;
      background-position: center right;
      p {
        margin: 0;
        line-height: 38px;
        padding-left: 36px;
        padding-right: 4px;
        img{
          margin-left: 16px;
        }
      }
      button {
        position: relative;
        background-color:white;
        top: 8px;
        border: 0;
        width: 100%;
        padding: 8px 0px;
        font-size: 15px;
        box-sizing: border-box;
    
      }
    }
  }
}
</style>
