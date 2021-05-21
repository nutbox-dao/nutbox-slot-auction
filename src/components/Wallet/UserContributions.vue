<template>
  <div v-show="items.length > 0">
    <b-card class="table-card">
      <b-card-text class="font20 font-bold text-left"
        >My contributions on {{ chain }}</b-card-text
      >
      <b-table
        :items="items"
        :fields="fields"
        thead-tr-class="th-cell"
        table-class="c-table"
        hover
        tbody-tr-class="c-tr"
        thead-class="c-th"
      >
        <template #cell(community)="row">
          <!-- <b-avatar size="sm" class="mr-2">C</b-avatar> -->
          <span>{{ row.item.community }}</span>
        </template>
        <template #cell(chain)="row">
          <!-- <b-avatar size="sm" class="mr-2">C</b-avatar> -->
          <span>{{ row.item.chain }}</span>
        </template>
      </b-table>
    </b-card>
    <b-pagination
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      class="change-page-box"
    ></b-pagination>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { CROWD_LOAN_API_URL } from "@/config";
import axios from "axios";
import BN from 'bn.js'
import { formatDate } from "@/utils/polkadot/utils"

export default {
  name: "UserContributions",
  props: {
    chain: {
      type: String,
      default: 'polkadot'
    },
  },
  computed: {
    ...mapState(["account"]),
  },
  data() {
    return {
      cancelToken: null,
      fields: [
        { key: "community", label: "Community", class: "text-left" },
        { key: "chain", label: "Chain", class: "text-left" },
        { key: "trieIndex", label: "TrieIndex", class: "text-right" },
        { key: "date", label: "Lease period", class: "text-right" },
        { key: "amount", label: "Staking amount", class: "text-right" },
        { key: "time", label: "Staking time" },
        { key: "operate", label: "", class: "text-left" },
      ],
      items: [],
      currentPage: 1,
      totalRows: 0,
      perPage: 7,
    };
  },
  watch: {
    currentPage(newValue, oldValue) {
      if (newValue == oldValue) return;
      this.requstData((newValue - 1)*this.perPage, this.perPage);
    },
  },
  methods: {
    async requstData(offset, limit) {
      this.cancelToken && this.cancelToken(cancel => {
        cancel()
      });
      this.cancelToken = axios.CancelToken;
      const decimal = new BN(this.chain === 'polkadot' ? 10 : 12)
      axios.post(CROWD_LOAN_API_URL + "/contrib/find/contributor", {
          relaychain: this.chain.toLowerCase(),
          contributor: this.account.address,
          offset,
          limit,
        })
        .then((res) => {
          this.totalRows = res && res.data && res.data.count;
          this.items = res && res.data && res.data.data.map((c) => ({
            community: c.communityName,
            chain: c.paraName,
            trieIndex: c.trieIndex,
            date: c.firstSlot + "-" + c.lastSlot,
            amount: ((new BN(c.amount).div(new BN(10).pow(decimal.sub(new BN(4))))).toNumber()/1e4).toFixed(4),
            time: formatDate(c.createdAt),
          }));
          console.log({ chain: this.chain, res: res.data });
        })
        .catch((err) => {});
    },
  },
  async mounted() {
    this.requstData(0, this.perPage);
  },
};
</script>

<style lang="less" scoped>
.table-card {
  border-radius: 1.4rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.02);
  border: none;
  .card-body {
    padding: 0;
    margin: 1rem;
    overflow: auto;
  }
}

.Active {
  color: rgba(80, 191, 0, 1);
}
.Retired {
  color: rgba(248, 182, 42, 1);
}
.Completed {
  color: rgba(255, 91, 77, 1);
}
.change-page-box {
  margin: 1rem auto;
}
</style>