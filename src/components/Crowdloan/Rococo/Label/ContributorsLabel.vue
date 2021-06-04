<template>
  <div>
    <span class="text-grey-light">
      {{ percent + " " }}
    </span>
    <span>
      {{ " " + getFundInfo && getFundInfo.funds.length + " " }}
    </span>
    <span class="text-grey-light"> {{ lang === 'en' ? 'Contributors' : '人投票' }} </span>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  props: {
    paraId: {
      type: Number,
    },
  },
  computed: {
    ...mapGetters('rococo', ["fundInfo"]),
    ...mapState(['lang']),
    getFundInfo() {
      return this.fundInfo(this.paraId);
    },
    
    percent() {
      if (!this.getFundInfo) return;
      return (
        this.getFundInfo.cap.isZero()
        ? "100.00%"
        : (this.getFundInfo.raised.muln(10000).div(this.getFundInfo.cap).toNumber() / 100).toFixed(2) + "% "
      );
    },
  },
};
</script>

<style lang="less" scoped>
</style>