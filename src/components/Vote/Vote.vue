<template>
  <div id="vote">
    <h3>
      {{ $t("vote.upvote") }}
    </h3>
    <h5>
      {{ $t("vote.title") }}
    </h5>
    <div class="nav"></div>
    <div class="vote-container">
      <div class="vote-box">
        <p class="title">
          {{ $t("vote.vote") }}
        </p>
        <div style="display: flex">
          <span class="upvote-icon" />
        </div>
        <div class="link-input">
          <p>{{ $t("vote.link") }}</p>
          <input
            type="text"
            v-model="postLink"
            :placeholder="$t('vote.linkPlaceholder')"
          />
        </div>
        <div class="pnut-input">
          <p>{{ $t("vote.payPnut") }}</p>
          <div class="input-area" v-if="tronAddress && tronAddress.length > 0">
            <div>
              <input type="text" v-model="pnutAmount" placeholder="0" />
              <p style="margin-top: 8px">
                <span class="pnut-for-upvote">
                  {{ payRate + " " }}
                </span>
                <span class="tips">
                  {{ $t("vote.voteRate") }}
                </span>
              </p>
            </div>
            <b-button
              class="transfer-btn"
              variant="primary"
              @click="transferPnut"
              :disabled="isTransfering || !isReady"
            >
              <b-spinner
                small
                type="grow"
                v-show="isTransfering || !isReady"
              ></b-spinner>
              {{ $t("vote.transfer") }}
            </b-button>
          </div>
          <b-button
            class="login-btn"
            variant="primary"
            @click="connectTron"
            v-else
          >
            <b-spinner small type="grow" v-show="isLoging"></b-spinner>
            {{ $t("wallet.connectTron") }}
          </b-button>
        </div>
      </div>
    </div>
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
import TipMessage from "../ToolsComponents/TipMessage";
import ConnectWalletBtn from "../ToolsComponents/ConnectWalletBtn";
import InstallTronLink from "../ToolsComponents/InstallTronLink";
import { mapGetters, mapState } from "vuex";
import {
  PNUT_FOR_VOTE_RATE,
  POST_LINK_REG,
  TRON_PNUT_RECEIVE_ACCOUNT,
  TRON_LINK_ADDR_NOT_FOUND,
  STEEM_MINE_ACCOUNT,
} from "../../config";
import {
  amountToInt,
  getTronLinkAddr,
  transferPnut,
} from "../../utils/chain/tron";
import { getAccountInfo, postHasVotedByNutbox } from "../../utils/chain/steem";

export default {
  name: "Vote",
  computed: {
    ...mapState(["tronAddress"]),
    ...mapGetters(["pnutBalance"]),
  },
  data() {
    return {
      showMessage: false,
      tipTitle: "",
      tipType: "error",
      tipMessage: "",
      payRate: PNUT_FOR_VOTE_RATE,
      postLink: "",
      pnutAmount: "",
      isLoging: false,
      isTransfering: false,
      isReady: false,
      showInstallTronLink: false,
    };
  },
  components: {
    TipMessage,
    ConnectWalletBtn,
    InstallTronLink,
  },
  methods: {
    async connectTron() {
      this.isLoging = true;
      const address = await getTronLinkAddr();
      this.isLoging = false;
      if (address && address === TRON_LINK_ADDR_NOT_FOUND.noTronLink) {
        this.showInstallTronLink = true;
      } else if (address && address === TRON_LINK_ADDR_NOT_FOUND.walletLocked) {
        this.tipTitle = this.$t("message.tips");
        this.tipMessage = this.$t("error.unlockWallet");
        this.tipType = "tip";
        this.showMessage = true;
      } else if (address) {
        this.$store.dispatch("getPnut");
      }
    },
    checkLink() {
      const match = this.postLink.match(POST_LINK_REG);
      const res = match && match.length > 0;
      if (!res) {
        this.showTip(this.$t("error.error"), this.$t("error.inputLinkIllegal"));
      }
      return match;
    },
    checkPnutAmount() {
      const reg = /^\d+(\.\d+)?$/;
      const res = reg.test(this.pnutAmount);
      if (!res) {
        this.showTip(this.$t("error.error"), this.$t("error.inputError"));
        return res;
      }
      const amount = parseFloat(this.pnutAmount);
      if (parseFloat(this.pnutBalance) < amount) {
        this.showTip(this.$t("error.error"), this.$t("error.insufficentPnut"));
        return false;
      }
      if (amount < this.payRate || amount > this.payRate * 10) {
        this.showTip(
          this.$t("error.error"),
          this.$t("error.inputOutOfRange", {
            lowerPnutAmount: this.payRate,
            upperPnutAmount: this.payRate * 10,
          })
        );
        return false;
      }
      return true;
    },

    async transferPnut() {
      if (!this.checkLink() || !this.checkPnutAmount()) {
        return;
      }
      try {
        this.isTransfering = true;
        const match = this.postLink.match(POST_LINK_REG);
        const author = match[0].split("/")[0].replace("@", "");
        const permlink = match[0].split("/")[1];
        if (await postHasVotedByNutbox(author, permlink)) {
          this.showTip(this.$t("error.error"), this.$t("error.hasVoted"));
          return
        }
        const res = await transferPnut(
          TRON_PNUT_RECEIVE_ACCOUNT,
          amountToInt(this.pnutAmount),
          this.postLink
        );
        if (res) {
          this.postLink = "";
          this.pnutAmount = "";
        } else {
          this.showTip(this.$t("error.error"), this.$t("error.transferFail"));
        }
      } catch (e) {
        this.showTip(this.$t("error.error"), e.message);
      } finally {
        this.isTransfering = false;
      }
    },
    showTip(titel, message) {
      this.tipTitle = titel;
      this.tipMessage = message;
      this.tipType = "error";
      this.showMessage = true;
    },
  },
  async mounted() {
    if (
      this.$store.state.tronAddress &&
      this.$store.state.tronAddress.length > 0
    ) {
      this.$store.dispatch("getPnut");
    }
    let { posting_json_metadata } = await getAccountInfo(STEEM_MINE_ACCOUNT);
    const json = JSON.parse(posting_json_metadata);
    if (Object.keys(json).length > 0) {
      const rate = parseInt(json.config.pnut_for_upvote);
      if (rate > 0) {
        this.payRate = rate;
        this.isReady = true;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
#vote {
  padding: 0px 40px 64px;
  min-height: 680px;
  background-image: url('../../static/images/back-ground.png');
  background-position: center 340px;
  background-repeat: no-repeat;
  h5 {
    text-align: left;
    margin-top: 12px;
    font-size: 16px;
    font-weight: 300;
    color: var(--secondary-text);
  }
  .nav {
    display: flex;
    align-items: left;
    border-bottom: 1px solid #ddd;
    a {
      border: 0;
      font-size: 20px;
      padding: 10px 24px;
      margin-top: 30px;
      color: #666;
      box-sizing: border-box;
    }
    a:hover {
      background-color: var(--yellow-background);
      text-decoration: none;
    }
    .active {
      color: var(--primary);
      border-bottom: 2px solid var(--primary);
    }
  }
  .vote-container {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    padding-top: 66px;
    .vote-box {
      margin: 0;
      width: 492px;
      padding: 24px;
      background: #ffffff;
      box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.02);
      background-image: url("../../static/images/upvote-back.svg");
      background-position: right top;
      background-repeat: no-repeat;
      border-radius: 28px;
      border: 1px solid rgba(227, 229, 232, 0.5);
      .title {
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        margin: 0;
        color: var(--primary-text);
        line-height: 24px;
        font-size: 28px;
        text-align: left;
      }
      .upvote-icon {
        margin: 36px 0 0 0;
        width: 56px;
        height: 56px;
        border: 1px solid var(--primary);
        border-radius: 28px;
        background-image: url("../../static/images/upvote-hover.svg");
        background-repeat: no-repeat;
        background-position: center center;
      }
      .link-input {
        margin-top: 20px;
        p {
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text);
          line-height: 12px;
        }
        input {
          width: 100%;
          height: 48px;
          background: var(--background);
          border-radius: 16px;
          border: none;
          padding-left: 16px;
        }
      }
      .pnut-input {
        margin: 26px 0 0 0;
        p {
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text);
          line-height: 12px;
          margin-bottom: 8px;
        }
        .login-btn {
          width: 444px;
          height: 68px;
        }
        .input-area {
          display: flex;
          justify-content: space-between;
          input {
            font-size: 24px;
            font-family: DINAlternate-Bold, DINAlternate;
            background-color: var(--background);
            border-radius: 16px;
            padding-left: 16px;
            border: none;
            height: 48px;
          }
          p {
            display: flex;
            align-items: center;
          }
          .pnut-for-upvote {
            margin: 6px 2px 0 0;
            font-size: 18px;
            font-family: Helvetica-Bold, Helvetica;
            font-weight: bold;
            margin: 0 6px 0 0;
            color: var(--success);
          }
          .tips {
            font-size: 14px;
            font-weight: 600;
          }
          .transfer-btn {
            width: 164px;
            height: 68px;
            box-sizing: border-box;
          }
        }
      }
    }
  }
  .get-vote-info {
    font-size: 14px;
    margin-top: 24px;
    margin-bottom: 0px;
    text-align: left;
    color: var(--disable);
  }
}
</style>