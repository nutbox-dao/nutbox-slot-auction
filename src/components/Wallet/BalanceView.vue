<template>
  <div>
    <Card>
      <div class="top">
        <img :src="logo" alt="" class="icon" />
        <div class="balance-right">
          <div class="balance-name">
            <span class="title">
              {{ name }}
            </span>
            <div>
              <span style="font-size: 12px; color: var(--secondary-text)">
                {{ desc }}
              </span>
              <img
                style="width: 14px; height: 14px"
                src="../../static/images/copy.svg"
                :id="address"
                :data-clipboard-text="address"
                v-if="address.length > 0"
                @click="copyAddress"
              />
              <b-popover
                :target="address"
                triggers="hover focus"
                placement="bottom"
              >
                copy address
              </b-popover>
            </div>
          </div>
          <div class="balance">
            <span class="title">
              {{ balances | amountForm(balanceDigit) }}
            </span>
          </div>
        </div>
      </div>
      <ConnectWalletBtn
        :type="walletType"
        @steemLogin="showSteemLogin = true"
        @tronLogin="tronLogin"
      >
      </ConnectWalletBtn>
    </Card>
    <Login v-if="showSteemLogin" @hideMask="showSteemLogin = false" />
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      :type="tipType"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
    <InstallTronLink
      v-if="showInstallTronLink"
      @hideMask="showInstallTronLink = false"
    />
  </div>
</template>

<script>
import Clipboard from "clipboard";
import Card from "../ToolsComponents/Card";
import Login from "../Login";
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn";
import TipMessage from "../ToolsComponents/TipMessage";
import InstallTronLink from "../ToolsComponents/InstallTronLink";
import { getTronLinkAddr } from "../../utils/chain/tron";
import { TRON_LINK_ADDR_NOT_FOUND } from "../../config";

export default {
  name: "BalanceView",
  data() {
    return {
      showSteemLogin: false,
      tipType: "error",
      tipTitle: "",
      tipMessage: "",
      showMessage: false,
      showInstallTronLink: false,
    };
  },
  props: {
    name: {
      type: String,
      default: "TRON",
    },
    balances: {
      type: String,
      default: "0.00",
    },
    logo: {
      type: String,
      default: "",
    },
    walletType: {
      type: String,
      default: "STEEM", // 0:steem  1: tron
    },
    desc: {
      type: String,
      default: "STEEM",
    },
    balanceDigit: {
      type: Number,
      default: 3,
    },
    address: {
      type: String,
      default: "",
    },
  },
  components: {
    Card,
    ConnectWalletBtn,
    Login,
    TipMessage,
    InstallTronLink,
  },
  methods: {
    copyAddress() {
      var clipboard = new Clipboard("#" + this.address);
      clipboard.on("success", (e) => {
        clipboard.destroy();
      });
      clipboard.on("error", (e) => {
        clipboard.destroy;
      });
    },
    async tronLogin() {
      const store = this.$store;
      const address = await getTronLinkAddr();
      if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
        store.commit("saveTronAddress", "");
        this.showInstallTronLink = true;
      } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
        store.commit("saveTronAddress", "");
        this.tipTitle = this.$t("message.tips");
        this.tipType = "tip";
        this.tipMessage = this.$t("error.unlockWallet");
        this.showMessage = true;
      } else if (address) {
        store.commit("saveTronAddress", address);
        store.dispatch("getPnut");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  width: 30%;
  min-width: 320px;
  .top {
    margin: 0;
    padding: 0;
    display: flex;
    .icon {
      width: 56px;
      height: 56px;
      margin-right: 8px;
    }
    .balance-right {
      display: flex;
      flex: 1;
      align-content: center;
      justify-content: space-between;
      margin-top: 6px;
      span {
        text-align: left;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      .balance-name {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        img:hover {
          cursor: pointer;
        }
      }
    }
  }
  button {
    width: 90% !important;
  }
}
</style>