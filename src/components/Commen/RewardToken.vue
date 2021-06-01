<template>
  <div class="reward-token-box">
    <img :src="icon" alt="" />
    <span>{{ token }}</span>
  </div>
</template>

<script>
    export default {
        name:'RewardToken',
        props: {
            icon: {
                type: String,
            },
            token: {
                type: String
            }
        },
        mounted () {
        },
    }
</script>

<style lang="scss" scoped>
.reward-token-box {
  display: inline-flex;
  align-items: center;
  margin-left: .5rem;
  img {
    width: .8rem;
    height: .8rem;
    margin-right: .2rem;
  }
}
</style>
