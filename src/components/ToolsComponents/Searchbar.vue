<template>
  <div class="search-bar flex-between-center" :class="isExpand?'expand': ''">
    <div class="input-box flex-between-center">
      <i class="search-icon" @click="isExpand=true"></i>
      <input class="search-input" type="text" name="" placeholder="Search" v-model="searchText">
      <i v-if="searchText.trim()!==''" class="clear-input-text text-grey" @click="searchText = ''"></i>
    </div>
    <span class="cancel-btn" @click="isExpand=false">取消</span>
  </div>
</template>

<script>
export default {
  name: 'Searchbar',
  data () {
    return {
      isExpand: false,
      searchText: ''
    }
  },
  methods: {
    onSearchIcon () {

    }
  }
}
</script>

<style scoped lang="scss">
@mixin icon($w: 1rem, $h: 1rem) {
  width: $w;
  min-width: $w;
  height: $h;
  min-height: $h;
  display: inline-block;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.search-bar {
  position: absolute;
  top: .5rem;
  right: 0;
  height: 2.4rem;
  padding: .6rem;
  background: white;
  transition: 0.4s;
  width: 15rem;
  max-width: 15rem;
  border-radius: .6rem;
  .search-icon {
    @include icon(1.2rem, 1.2rem);
    background-image: url("~@/static/images/search-icon.svg");
  }
  input {
    border:none;
    background: none;
    outline:none;
    flex: 1;
    padding: 0 .4rem;
  }
  .clear-input-text {
    display: flex;
  }
  .clear-input-text::after {
    content: '';
    display: inline-block;
    @include icon;
    background-image: url("~@/static/images/circle-close.png");
  }
  .cancel-btn {
    white-space: nowrap;
    display: none;
  }
}

@media (max-width: 620px) {
  .search-bar {
    background: transparent;
    width: 4rem;
    overflow: hidden;
    height: 3rem;
    top: 0;
    right: -15px;
    border-radius: 0;
    .search-icon {
      margin-right: 2rem;
    }
    &.expand {
      background: white;
      width: calc(100% + 30px);
      max-width: calc(100% + 30px);
      transition: 0.4s;
      .search-icon {
        margin-right: .5rem;
      }
    }
    .cancel-btn {
      display: inline-block;
    }
  }
  .input-box {
    flex: 1;
    background: #F6F7F9;
    margin-right: 1rem;
    padding: .3rem .6rem;
    border-radius: 2rem;
  }
}
</style>
