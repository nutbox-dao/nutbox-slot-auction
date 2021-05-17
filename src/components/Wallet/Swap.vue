<template>
  <div class="wallet-swap">
    <template>
      <div class="tab">
        <div
          :class="['tab-card', currentTab === 'steem' ? 'checked' : '']"
          @click="change('steem')"
        >
          <img src="../../static/images/tokens/tsteem.png" alt="" />
          <h5>TSTEEM</h5>
        </div>
        <div
          :class="['tab-card', currentTab === 'sbd' ? 'checked' : '']"
          @click="change('sbd')"
        >
          <img src="../../static/images/tokens/tsbd.png" alt="" />
          <h5>TSBD</h5>
        </div>
      </div>
      <TSteemSwap v-show="currentTab === 'steem'" />
      <TSbdSwap v-show="currentTab === 'sbd'" />
    </template>
  </div>
</template>

<script>
import TSteemSwap from "./TSteemSwap";
import TSbdSwap from "./TSbdSwap";
export default {
  name: "Swap",
  data() {
    return {
      currentTab: "steem",
    };
  },
  components: {
    TSteemSwap,
    TSbdSwap,
  },
  methods: {
    change(tab) {
      if (tab === "steem") {
        this.currentTab = "steem";
      } else if (tab === "sbd") {
        this.currentTab = "sbd";
      }
    },
  },
  mounted() {},
};
</script>

<style lang="less" scoped>
.wallet-swap {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  @import "../../static/css/tab.less";
}
</style>
