<template>
  <div id="app">
    <div class="left">
    <div class="logo-container">
      <img src="./static/images/logo.png" style="width:180px;height:70px" alt="nutbox" class="logo" />
      <img src="./static/images/logo_small.png" style="width:42px;height:42px;margin-bottom:12px" alt="nutbox" class="logo_small" />
    </div>
      <b-nav pills vertical align="center" class="menu">
        <b-nav-item to="/wallet">
          <p id="wallet-icon" class="my-icon" />
          <div style="padding: 0">
            <p class="memu-wallet">
              {{
                tronAddrFromat && tronAddrFromat.length > 0
                  ? tronAddrFromat
                  : $t("wallet.wallet")
              }}
            </p>
            <p style="font-size: 12px; font-weight: 400; color: var(--disable)"  class="memu-wallet">
              {{ pnutBalance | amountForm }}
            </p>
          </div>
        </b-nav-item>
        <b-nav-item to="/stake" router-tag="div">
          <p id="stake-icon" class="my-icon" />
          <span>{{ $t("stake.stake") }}</span>
        </b-nav-item>
        <b-nav-item to="/farm">
          <p id="farming-icon" class="my-icon" />
          <span>{{ $t("farm.farm") }}</span>
        </b-nav-item>
        <b-nav-item to="/liquid-staking">
          <p id="liquid-staking-icon" class="my-icon" />
          <span>{{ $t("liquidStaking.liquidStaking") }}</span>
        </b-nav-item>
        <b-nav-item to="/get-vote">
          <p id="upvote-icon" class="my-icon" />
          <span>{{ $t("vote.upvote") }}</span>
        </b-nav-item>
        <!-- <b-nav-item href="https://blog.nutbox.io/" target="_blank">
          <p id="blog-icon" class="my-icon" />
          <span>{{ $t("message.blog") }}</span>
        </b-nav-item> -->
         <b-nav-item to="/blog">
          <p id="blog-icon" class="my-icon" />
          <span>{{ $t("message.blog") }}</span>
        </b-nav-item>
        <b-nav-item to="/nps">
          <p id="nps-icon" class="my-icon" />
          <span>{{ $t("nps.nps") }}</span>
        </b-nav-item>
        <b-nav-item
          to="/admin"
          v-if="$store.state.steemAccount === nutboxMineAccount"
        >
          <p id="nps-icon" class="my-icon" />
          <span>{{ $t("message.admin") }}</span>
        </b-nav-item>
      </b-nav>
      <div class="bottom">
        <div class="links">
          <a
            id="justswap-icon"
            href="https://justswap.org/#/home?tokenAddress=TPZddNpQJHu8UtKPY1PYDBv2J5p5QpJ6XW&type=swap"
            target="_blank"
          >
            <b-popover
              target="justswap-icon"
              triggers="hover focus"
              placement="top"
            >
              Justswap
            </b-popover>
          </a>
          <a
            id="github-icon"
            href="https://github.com/nutbox-dao"
            target="_blank"
          >
            <b-popover
              target="github-icon"
              triggers="hover focus"
              placement="top"
            >
              Github
            </b-popover>
          </a>
          <a
            id="docs-icon"
            href="https://docs.nutbox.io/lite_paper_v1/"
            target="_blank"
          >
          </a>
          <b-popover target="docs-icon" triggers="hover focus" placement="top">
            {{ $t("message.docs") }}
          </b-popover>
          <a
            id="discord-icon"
            href="https://discord.com/invite/zPkMuGY"
            target="_blank"
          >
          </a>
          <b-popover
            target="discord-icon"
            triggers="hover focus"
            placement="top"
          >
            Discord
          </b-popover>
          <a id="telegram-icon" href="https://t.me/nutbox_defi" target="_blank">
          </a>
          <b-popover
            target="telegram-icon"
            triggers="hover focus"
            placement="top"
          >
            Telegram
          </b-popover>
        </div>

        <div class="settings">
          <b-dd
            id="steem-node"
            :text="$t('message.changeSteemNode')"
            size="sm"
            block
            dropup
            no-caret
          >
            <b-dropdown-item
              v-for="item in steemUrls"
              :key="item"
              @click="selectNode(item)"
            >
              <b-icon
                :icon="item == currentSteemNode ? 'check' : 'blank'"
                aria-hidden="true"
                style="font-size: 20px"
              ></b-icon>
              <span style="font-size: 14px">{{ item }}</span>
            </b-dropdown-item>
          </b-dd>

          <b-dd
            id="language"
            :text="lang.toUpperCase()"
            size="sm"
            block
            dropup
            no-caret
          >
            <b-dropdown-item @click="setLanguage('en')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'en' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.en") }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="setLanguage('zh')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'zh' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.zh") }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="setLanguage('kr')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'kr' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.kr") }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="setLanguage('es')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'es' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.es") }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="setLanguage('my')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'my' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.my") }}</span>
            </b-dropdown-item>
            <b-dropdown-item @click="setLanguage('jp')">
              <b-icon
                style="font-size: 20px"
                :icon="lang == 'jp' ? 'check' : 'blank'"
                aria-hidden="true"
              ></b-icon>
              <span style="font-size: 14px">{{ $t("message.jp") }}</span>
            </b-dropdown-item>
          </b-dd>
        </div>
      </div>
    </div>
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { watchWallet, getTronLinkAddr } from "./utils/chain/tron";
import {
  TRON_LINK_ADDR_NOT_FOUND,
  STEEM_API_URLS,
  STEEM_CONF_KEY,
  LOCALE_KEY,
  STEEM_MINE_ACCOUNT,
} from "./config";
import TipMessage from "./components/ToolsComponents/TipMessage";
import { mapState, mapGetters } from "vuex";
import { storeApy } from "./utils/helper";

export default {
  data() {
    return {
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      steemUrls: STEEM_API_URLS,
      steemNodeKey: STEEM_CONF_KEY,
      currentSteemNode: window.localStorage.getItem(STEEM_CONF_KEY),
      nutboxMineAccount: STEEM_MINE_ACCOUNT,
      lang: "en",
    };
  },
  computed: {
    ...mapState(["tronAddress"]),
    ...mapGetters(["tronAddrFromat", "pnutBalance"]),
  },
  components: {
    TipMessage,
  },
  methods: {
    setLanguage(lang) {
      this.lang = lang;
      localStorage.setItem(LOCALE_KEY, this.lang);
      this.$i18n.locale = lang;
    },
    selectNode(node) {
      this.currentSteemNode = node;
      window.localStorage.setItem(this.steemNodeKey, node);
      this.$router.go(0);
    },
  },
  async mounted() {
    var store = this.$store;
    store.dispatch("setVestsToSteem");
    this.lang = localStorage.getItem(LOCALE_KEY);

    const address = await getTronLinkAddr();
    if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
      store.commit("saveTronAddress", "");
      // this.tipTitle = this.$t("error.needtronlink");
      // this.tipMessage = "TronLink: https://www.tronlink.org";
      // this.showMessage = true;
    } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
      store.commit("saveTronAddress", "");
      // this.tipTitle = this.$t("error.error");
      // this.tipMessage = this.$t("error.unlockWallet");
      // this.showMessage = true;
    } else if (address) {
      store.commit("saveTronAddress", address);
      store.dispatch("getPnut");
    }
    watchWallet((address) => {
      if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
        store.commit("saveTronAddress", "");
        // this.tipTitle = this.$t("error.needtronlink");
        // this.tipMessage = "TronLink: https://www.tronlink.org";
        // this.showMessage = true;
      } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
        store.commit("saveTronAddress", "");
        // this.tipTitle = this.$t("error.error");
        // this.tipMessage = this.$t("error.unlockWallet");
        // this.showMessage = true;
      } else if (address) {
        store.dispatch("initializeTronAccount", address);
      }
    });
    storeApy();
  },
};
</script>

<style lang="scss">
$blue: #ffdb1b;
:root {
  --yellow-background: #f5ecd8;
  --primary: #ffdb1b;
  --primary-text: #242629;
  --secondary-text: #717376;
  --disable: #bdbfc2;
  --dividers: #e3e5e8;
  --background: #f6f7f9;
  --error: #ff5040;
  --success: #50bf00;
  --link: #408fff;
  --warning: #ff9500;
  --backgroud-state: #b37012;
}

@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
html,
body {
  height: 100%;
  margin: 0;
}
#app {
  font-family: PingFangSC-Medium, PingFang SC, -apple-system, BlinkMacSystemFont,
    "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--primary-text);
  height: 100%;
  min-height: 700px;
  display: flex;
  align-items: left;
  background-color: var(--background);
}
h3 {
  margin-top: 56px;
  text-align: left;
  display: block;
  width: 100%;
  height: 36px;
  font-size: 36px;
  font-weight: 500;
  line-height: 36px;
}
.spinner-grow {
  margin-bottom: 2px;
  margin-right: 8px;
}
input {
  border: none;
  outline: none;
}
input::-webkit-input-placeholder {
  color: var(--disable);
}
.mask {
  z-index: 2000;
  overflow: hidden;
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.btn-primary {
  font-size: 16px;
  border-radius: 16px !important;
  box-shadow: 0px 8px 12px -4px #ffec88;
  border: 0px !important;
  padding: 12px 24px;
  font-weight: 600;
  color: var(--primary-text) !important;
}

.btn-primary:hover {
  background: #ffeb75 !important;
}

.menu .nav-link {
  display: flex !important;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  svg {
    margin-right: 16px;
  }
  p {
    margin: 0;
    height: 22px;
    line-height: 22px;
  }
}

.logo-container{
  display: flex;
  align-content: center;
  justify-content: center;
  margin-left: -12px;
}

.logo {
  margin-bottom: 30px;
}

.left {
  background-color: #ffffff;
  padding-top: 55px;
  padding-left: 12px;
  width: 240px;
  position: relative;
  box-shadow: 4px 0px 48px 0px rgba(0, 0, 0, 0.06);
  border-radius: 0px 4vh 4vh 0px;
}
.right {
  flex: 1;
  height: 100vh;
  max-height: 100vh;
  min-height: 100vh;
  min-width: 640px;
  overflow-y: overlay;
  background-color: var(--background);
}

.left .nav-item {
  height: 48px;
  text-align: left;
  box-sizing: border-box;
}

.left .nav-item:hover {
  background: linear-gradient(
    270deg,
    rgba(227, 229, 232, 0) 0%,
    rgba(227, 229, 232, 0.4) 100%
  ) !important;
  font-weight: 500;
  color: #242629;
}

.left .nav-item .b-icon {
  margin-right: 12px;
}

.left .nav-link {
  height: 100%;
  font-size: 16px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: var(--disable);
  line-height: 14px;
  padding-left: 36px;
  span {
    flex: 1;
  }
}

.left .active {
  background: linear-gradient(
    270deg,
    rgba(255, 219, 27, 0) 0%,
    rgba(255, 219, 27, 0.2) 100%
  ) !important;
  border-radius: 0px;
  border-left: 3px solid var(--primary);
  padding-left: 33px;
  font-weight: 500 !important;
  color: #242629 !important;
}

.left .bottom {
  position: absolute;
  padding: 0 20px;
  margin-left: -12px;
  width: 240px;
  bottom: 30px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0);

  .links {
    width: 100%;
    display: flex;
    align-content: center;
    justify-content: space-around;
    margin-top: 19px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--dividers);
    a {
      width: 32px;
      height: 32px;
    }
  }
  .settings {
    margin-top: 18px;
    width: 192;
    height: 84px;
    margin-bottom: 12px;
    background: #f6f7f9;
    border-radius: 16px;
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    #steem-node {
      width: 100%;
      background-image: url("./static/images/node.svg");
      background-repeat: no-repeat;
      background-position: center left;
    }
    #language {
      width: 100%;
      background-image: url("./static/images/lang.svg");
      background-repeat: no-repeat;
      background-position: center left;
    }
    .btn-secondary {
      color: var(--primary-text) !important;
      background-color: rgba(0, 0, 0, 0);
      border: none;
      font-size: 12px;
      text-align: left;
      padding-left: 22px;
    }
  }
}

.my-icon {
  width: 24px;
  height: 24px;
  margin: 0px 12px 0px 0px !important;
}

#wallet-icon {
  background-image: url("./static/images/wallet.svg");
}
#stake-icon {
  background-image: url("./static/images/stake.svg");
}
#farming-icon {
  background-image: url("./static/images/farming.svg");
}
#liquid-staking-icon {
  background-image: url("./static/images/swap.svg");
}
#upvote-icon {
  background-image: url("./static/images/upvote.svg");
}
#blog-icon {
  background-image: url("./static/images/blog.svg");
}
#nps-icon {
  background-image: url("./static/images/nps.svg");
}

.active {
  #wallet-icon {
    background-image: url("./static/images/wallet-hover.svg");
  }
  #stake-icon {
    background-image: url("./static/images/stake-hover.svg");
  }
  #farming-icon {
    background-image: url("./static/images/farming-hover.svg");
  }
  #liquid-staking-icon {
    background-image: url("./static/images/swap-hover.svg");
  }
  #upvote-icon {
    background-image: url("./static/images/upvote-hover.svg");
  }
  #blog-icon {
    background-image: url("./static/images/blog-hover.svg");
  }
  #nps-icon {
    background-image: url("./static/images/nps-hover.svg");
  }
}

#justswap-icon {
  background-image: url("./static/images/just-swap.svg");
}
#github-icon {
  background-image: url("./static/images/GitHub.svg");
}
#docs-icon {
  background-image: url("./static/images/docs.svg");
}
#discord-icon {
  background-image: url("./static/images/Discord.svg");
}
#telegram-icon {
  background-image: url("./static/images/telegram.svg");
}

#justswap-icon:hover {
  background-image: url("./static/images/just-swap-hover.svg");
}
#github-icon:hover {
  background-image: url("./static/images/GitHub-hover.svg");
}
#docs-icon:hover {
  background-image: url("./static/images/docs-hover.svg");
}
#discord-icon:hover {
  background-image: url("./static/images/Discord-hover.svg");
}
#telegram-icon:hover {
  background-image: url("./static/images/telegram-hover.svg");
}
.logo{
  display: block;
}
  .logo_small{
    display: none;
  }
@media only screen and (max-width: 991px){
  .logo_small{
    display: block;
  }
   .logo{
    display: none;
  }
.nav-item span  {
   display: none;
}
.left{
width: 75px;
min-width: 75px;
}
.nav-link{
  display: inherit;

}
.left .nav-item{
  height: 40px;
}
.left .nav-link {
     padding-left: 0px;
}
.left .bottom {
  width: 100%;
}
.left .bottom .links {
    display: block;
}
.left .bottom .links a {
  margin-bottom: 6px;
    display: block;
}
.menu .nav-link{
  flex-wrap:inherit;
}
.memu-wallet{
  display: none;
}
.left .bottom .settings{
  background: transparent;
}
.left .bottom .settings .btn-secondary{
   color: transparent !important;
}
.left .bottom .settings{
  padding: 0;
  display: block;
}
}
</style>
