<template>
  <div id="app">
    <div class="page-layout">
      <div class="page-header">
        <img src="./static/images/logo.png" alt="nutbox" class="logo"/>
        <div class="small-logo-container">
          <img src="./static/images/logo_small.png" alt="nutbox" class="logo-small"/>
          <img src="./static/images/menu.png" alt="" class="menu" v-b-toggle.sidebar-menu/>
        </div>
        <div class="account-header" v-if="$route.path!=='/blog'">
          <b-dropdown toggle-class="accounts-toggle" variant="text" right no-caret>
            <template #button-content>
              <div class="flex-between-center font18" @click="accountsPop = !accountsPop">
                <Identicon :size="30" theme="polkadot" v-if="account" :value="account.address"/>
                <b-avatar v-else class="mr-2" size="sm" text=""></b-avatar>
                <span style="margin-left: 8px">{{
                    formatUserAddress(
                      account && account.meta && account.meta.name
                    )
                  }}</span>
              </div>
            </template>
            <b-dropdown-item v-for="(item, index) of allAccounts ? allAccounts : []" :key="index"
                             @click="changeAccount(item)">
              <template>
                <div class="flex-between-center">
                  <Identicon class="ident-icon" :size="30" theme="polkadot" :value="item.address"/>
                  <div class="account-info">
                    <div class="font-bold">
                      {{ item.meta ? item.meta.name : "" }}
                    </div>
                    <div class="address">
                      {{ formatUserAddress(item.address) }}
                    </div>
                  </div>
                  <img class="ml-3" v-if="item.address === (account && account.address)"
                       src="~@/static/images/selected.png" alt=""/>
                </div>
              </template>
            </b-dropdown-item>
            <!-- <b-dropdown-item>
              <div
                class="flex-start-center"
                @click="selectMenu('dashboard', '/dashboard')"
                v-if="isProjectAdmin"
              >
                <img class="menu-icon" :src="dashboardIcon" alt="" />
                <span class="menu-text">{{ $t("account.dashboard") }}</span>
              </div>
            </b-dropdown-item> -->
          </b-dropdown>
        </div>
      </div>
      <div class="page-container">
        <b-sidebar id="sidebar-menu" no-header :backdrop="screenWidth<960">
          <div class="left">
            <div class="top">
              <b-nav pills vertical align="center" class="menu">
                <b-nav-item to="/wallet" router-tag="div">
                  <p id="wallet-icon" class="my-icon" />
                  <span>{{ $t("wallet.wallet") }}</span>
                </b-nav-item>
                <b-nav-item to="/crowdloan">
                  <p id="farming-icon" class="my-icon" />
                  <span>{{ $t("cl.crowdloan") }}</span>
                </b-nav-item>
                <b-nav-item to="/crowdstaking" router-tag="div">
                  <p id="stake-icon" class="my-icon" />
                  <span>{{ $t("cs.crowdstaking") }}</span>
                </b-nav-item>
                <b-nav-item to="/blog">
                  <p id="blog-icon" class="my-icon" />
                  <span>{{ $t("message.blog") }}</span>
                </b-nav-item>
                <b-nav-item to="/admin" v-if="isAdmin">
                  <p id="admin-icon" class="my-icon" />
                  <span>{{ $t("message.admin") }}</span>
                </b-nav-item>
              </b-nav>
            </div>
            <div class="bottom">
              <div class="links">
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
                <b-popover
                  target="docs-icon"
                  triggers="hover focus"
                  placement="top"
                >
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
                <a
                  id="telegram-icon"
                  href="https://t.me/nutbox_defi"
                  target="_blank"
                >
                </a>
                <b-popover
                  target="telegram-icon"
                  triggers="hover focus"
                  placement="top"
                >
                  Telegram
                </b-popover>
              </div>
              <div class="h-line"></div>
              <div class="settings">
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
                  <!-- <b-dropdown-item @click="setLanguage('kr')">
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
                  </b-dropdown-item> -->
                </b-dd>
              </div>
            </div>
          </div>
        </b-sidebar>
        <TipMessage
          :showMessage="tipMessage"
          :title="tipTitle"
          v-if="showMessage"
          @hideMask="showMessage = false"
        />
        <div class="right">
          <div class="container">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { LOCALE_KEY } from "./config";
import TipMessage from "./components/ToolsComponents/TipMessage";
import { mapState, mapMutations } from "vuex";
import Identicon from "@polkadot/vue-identicon";
import { getCommnunitys, getCrowdstacking } from "@/apis/api";
import {
  getBalance as getPolkadotBalance,
  loadAccounts as loadPolkadotAccounts,
} from "./utils/polkadot/account";
import { getBalance as getKusamaBalance } from "./utils/kusama/account";
import { subBlock as subPolkadotBlock } from "./utils/polkadot/block";
import { subBlock as subKusamaBlock } from "./utils/kusama/block";
import {
  subBonded,
  subNominators,
  getValidatorsInfo,
} from "./utils/polkadot/staking";
import { subBonded as subKusamaBonded } from "./utils/kusama/staking";
import { stanfiAddress } from "./utils/polkadot/polkadot";

export default {
  data() {
    return {
      tipMessage: "",
      tipTitle: "",
      showMessage: false,
      accountsPop: false,
      screenWidth: document.body.clientWidth,
    };
  },
  computed: {
    ...mapState("polkadot", [
      "isConnected",
      "allAccounts",
      "account",
      "crowdstakings",
      "communitys",
      "projects",
    ]),
    ...mapState("kusama", ["clCommunitys"]),
    ...mapState(["lang"]),
    contributionsIcon() {
      return this.activeNav === "contributions"
        ? require("./static/images/contributions_selected.png")
        : require("./static/images/contributions.png");
    },
    dashboardIcon() {
      return this.activeNav === "dashboard"
        ? require("./static/images/dashboard_selected.png")
        : require("./static/images/dashboard.png");
    },
    isAdmin() {
      if (!this.clCommunitys || !this.projects) return false;
      const isCrowdloanAdmin = this.clCommunitys?.indexOf(this.account?.address) !== -1
      const isCrowdstakingAdmin = this.projects?.indexOf(this.account?.address) !== -1
      const res = isCrowdloanAdmin || isCrowdstakingAdmin;
      return res;
    },
    showMenu() {
      return this.screenWidth > 960
    }
  },
  components: {
    TipMessage,
    Identicon,
  },
  methods: {
    ...mapMutations("polkadot", [
      "saveCrowdstakings",
      "saveCommunitys",
      "saveProjects",
      "saveAccount",
    ]),
    ...mapMutations("kusama", ["saveClCommunitys"]),
    setLanguage(lang) {
      localStorage.setItem(LOCALE_KEY, lang);
      this.$store.commit("saveLang", lang);
      this.$i18n.locale = lang;
    },
    formatUserAddress(address, long = true) {
      if (!address) return "Loading Account";
      if (long) {
        if (address.length < 16) return address;
        const start = address.slice(0, 28);
        const end = address.slice(-5);
        return `${start}...`;
      } else {
        const start = address.slice(0, 6);
        const end = address.slice(-6);
        return `${start}...${end}`;
      }
    },
    changeAccount(acc) {
      if (!this.isConnected) return;
      if (this.$route.path === '/admin'){
        //调到主页去
        this.$router.push('/crowdloan')
      }
      this.saveAccount(acc);
      getPolkadotBalance(acc);
      getKusamaBalance(acc);
      subKusamaBonded();
      subBonded();
      subNominators();
      this.getCommnunitys();
      this.getCrowdstacking();
    },
    getCommnunitys() {
      // 获取支持平行链项目的社区信息  -   kusama
      getCommnunitys().then((res) => {
        const ccc = res.map((r) => stanfiAddress(r.communityId))
        this.saveClCommunitys(ccc);
      });
    },

    getCrowdstacking() {
      // 获取验证者节点投票卡片信息 --- polkadot
      getCrowdstacking().then((res) => {
        const crowdstaking = res.map(({ community, project }) => ({
          community: {
            ...community,
            communityId: stanfiAddress(community.communityId),
          },
          project: {
            ...project,
            projectId: stanfiAddress(project.projectId),
            validators: project.validators.map((v) => stanfiAddress(v)),
          },
        }));
        this.saveCrowdstakings(crowdstaking);
        this.saveCommunitys(
          crowdstaking.map(({ community }) => community.communityId)
        );
        this.saveProjects(crowdstaking.map(({ project }) => project.projectId));
        let validators = crowdstaking.map(({ project }) => project.validators);
        validators = validators.reduce((t, v) => t.concat(...v), []);
        validators = [...new Set(validators)];
        getValidatorsInfo(validators);
      });
    },
  },
  async mounted() {
    let _this = this
    window.onresize= () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        _this.screenWidth = window.screenWidth;
      })();
    }
    this.setLanguage(localStorage.getItem(LOCALE_KEY));
    this.getCommnunitys();
    this.getCrowdstacking();
  },
  watch: {
    screenWidth(val) {
      this.screenWidth = val;
    }
  },
  async created() {
    await Promise.all([subPolkadotBlock(), subKusamaBlock()]);
    await loadPolkadotAccounts();
  },
};
</script>

<style lang="scss">
$blue: #ffdb1b;
:root {
  --yellow-background: #f5ecd8;
  --primary-custom: #ffdb1b;
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
::-webkit-scrollbar{display:none;}
@import "./static/css/responsive";
@import "./static/css/common.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
@import "static/css/modal";
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
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 14px;
  background-color: var(--background);
}
.page-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 600px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.6rem;
  background: white;
  height: 3.8rem;
  .logo {
    width: 6.8rem;
    height: 2.8rem;
  }
  .logo-small {
    height: 2.8rem;
    width: 2.8rem;
  }
  .small-logo-container {
    display: none;
    .menu {
      width: 1.5rem;
      height: 1.5rem;
      margin-left: .5rem;
    }
  }
  .account-header {
    height: 2.8rem;
    button {
      border: none;
    }
  }
}
.page-container {
  position: relative;
  overflow: hidden;
  flex: 1;
  #sidebar-menu {
    position: fixed;
    top: 3.8rem;
    bottom: 0;
    width: 240px;
    height: auto;
  }
  .left {
    width: 100%;
    background-color: #ffffff;
    padding-top: 2rem;
    padding-left: .6rem;
    box-shadow: 4px 40px 48px 0 rgba(0, 0, 0, 0.06);
    border-radius: 0 0 4vh 0;
    position: absolute;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
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
.right {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--background);
  padding-left: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .container {
    padding: 40px 40px 46px;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
    text-align: left;
    >div {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
  .scroll-content {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .sub-page-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.5rem auto 1.2rem auto;
    height: 1.6rem;
    border-radius: 1.6rem;
    background-color: #E3E5E8;
    a {
      border: 0;
      font-size: .8rem;
      color: #666;
      box-sizing: border-box;
      font-weight: 600;
      line-height: 1.6rem;
      padding: 0 1rem;
      border-radius: 1.6rem;
    }
    a:hover {
      text-decoration: none;
      font-weight: 300;
    }
    .active {
      color: var(--primary-text);
      background-color: var(--primary-custom);
    }
  }
}

.left .nav-item {
  height: 2.4rem;
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
  width: 100%;
  margin-bottom: 30px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0);
  .links {
    display: flex;
    align-content: center;
    justify-content: center;
    margin-bottom: 1rem;
    margin-right: .6rem;
    a {
      width: 1.6rem;
      height: 1.6rem;
      margin: .2rem;
    }
  }
  .h-line {
    width: 100%;
    height: 1px;
    background-color: #E2E7EF;
    margin: 0;
  }
  .settings {
    margin: 1.2rem .6rem 1.2rem 0;
    background: #f6f7f9;
    border-radius: 16px;
    padding: .8rem 1.1rem;
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
      background-position: .4rem center;
      background-size: .8rem .8rem;
      height: 1.6rem;
      background-color: white;
      border-radius: .6rem;
    }
    .btn {
      color: var(--primary-text) !important;
      background-color: rgba(0, 0, 0, 0);
      border: none;
      font-size: .6rem;
      text-align: left;
      padding: 0 1.6rem !important;
      height: 1.6rem;
    }
    .dropdown-menu {
      transform: translate3d(0, -130px, 0px)!important;
      box-shadow: 0 2px 20px 0 rgba(0, 0, 0, .2);
    }
  }
}
.loading-bg {
  display: flex;
  align-content: center;
  align-items: center;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  img {
    margin-top: 12rem;
  }
  p {
    margin-top: 1rem;
    font-weight: 400;
    color: #bdbfc2;
    line-height: 22px;
  }
}
.item-title {
  text-align: left;
  color: var(--primary-text);
  font-size: 1rem;
  line-height: 1rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.dropdown-menu {
  border-radius: 1.2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.02);
  border: none;
  margin-top: 0.5rem;
  min-width: 15rem;
  padding: 0.8rem;
  .dropdown-item {
    padding: 0.2rem 0.5rem;
  }
  .account-info {
    flex: 1;
    font-size: 0.7rem;
    margin-left: 6px;
  }
  .dropdown-item:hover {
    background: transparent;
  }
  .menu-icon {
    width: 28px;
    height: 28px;
  }
  .menu-text {
    padding: 0.4rem 0;
    display: inline-block;
    font-size: 0.7rem;
    font-weight: bold;
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
#admin-icon {
  background-image: url("./static/images/admin.svg");
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
  #admin-icon {
    background-image: url("./static/images/admin-hover.svg");
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
.logo {
  display: block;
}
.logo_small {
  display: none;
}
@media only screen and (max-width: 960px) {
  .page-header {
    padding: .5rem .8rem;
  }
  .small-logo-container {
    display: block !important;
  }
  .logo {
    display: none;
  }
  .right {
    padding-left: 0;
  }
  .container {
    padding: 15px!important;
  }
}
@media (min-width: 960px) {
  #sidebar-menu {
    display: block!important;
  }
}
.bg-dark {
  background-color: rgba(0,0,0,0) !important;
}
</style>
