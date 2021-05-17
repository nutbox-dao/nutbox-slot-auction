<template>
  <div id="stake">
    <h3>
      {{ this.$t("stake.stake") }}
    </h3>
    <!-- <div class="nav"></div> -->
    <div class="stake-box">
      <SPPool />
      <FarmBox symbol="TSP_POOL" />
      <FarmBox symbol="TSTEEM_POOL" />
    </div>
  </div>
</template>

<script>
import SPPool from "./SPPool";
import FarmBox from "../Farm/FarmBox";
import {storeApy} from "../../utils/helper"

export default {
  name: "Stake",
  data() {
    return {};
  },
  components: {
    SPPool,
    FarmBox,
  },
  mounted() {
    storeApy()
    if (
      this.$store.state.tronAddress &&
      this.$store.state.tronAddress.length > 0
    ) {
      this.$store.dispatch("getPnut");
    }
  },
};
</script>

<style lang="less" scoped>
#stake {
  padding: 0px 40px 64px;
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
  .stake-box {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
  }
}
</style>
