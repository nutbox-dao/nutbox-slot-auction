<template>
  <div v-show="items.length > 0">
    <b-card class="table-card">
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

export default {
  name: "UserContributions",
  props: {
    chain: {
      type: String,
      default: 'polkadot'
    },
  },
  computed: {
    ...mapState('polkadot', ["account"]),
  },
  data() {
    return {
      fields: []
    }
  },
  methods: {
  },
  async mounted() {
    this.fields = [
        { key: "icon", label: "", class: "test-left" },
        { key: "validator", label: this.$t('validator.validator'), class: "test-left" },
        { key: "other-staking", label: this.$t('validator.otherStake'), class: "test-right" },
        { key: "own-staking", label: this.$t('validator.ownStake'), class: "test-right" },
        { key: "commission", label: this.$t('validator.commission'), class: "test-right" },
      ]
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