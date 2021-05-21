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
            </div>
          </div>
          <div class="balance">
            <span class="title">
              {{ balances | amountForm(balanceDigit) }}
            </span>
          </div>
        </div>
      </div>
      <div class="bottom">
        <b-button variant="primary" @click="showTransfer=true">
          {{ $t('wallet.transfer') }}
        </b-button>
      </div>
    </Card>
    <TipMessage
      :showMessage="tipMessage"
      :title="tipTitle"
      :type="tipType"
      v-if="showMessage"
      @hideMask="showMessage = false"
    />
    <b-modal
      v-model="showTransfer"
      modal-class="custom-modal"
      centered
      hide-header
      hide-footer
      no-close-on-backdrop
    >
      <TipTransfer
        @hideTransfer="showTransfer = false"
      />
    </b-modal>
  </div>
</template>

<script>
import Card from "@/components/ToolsComponents/Card";
import TipMessage from "@/components/ToolsComponents/TipMessage";
import TipTransfer from "./TipTransfer"

export default {
  name: "BalanceView",
  data() {
    return {
      tipType: "error",
      tipTitle: "",
      tipMessage: "",
      showMessage: false,
      showTransfer: false
    };
  },
  props: {
    name: {
      type: String,
      default: "DOT",
    },
    balances: {
      type: Number,
      default: 0.00,
    },
    logo: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      default: "DOT",
    },
    balanceDigit: {
      type: Number,
      default: 4,
    },
  },
  components: {
    Card,
    TipMessage,
    TipTransfer
  },
  methods: {
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
  .bottom{
    padding: 14px 0 0 0 ;
  }
  button {
    width: 90% !important;
  }
}
</style>