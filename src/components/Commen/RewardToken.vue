<template>
  <div>
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
            console.log(this.icon, this.token);;
        },
    }
</script>

<style lang="scss" scoped>
</style>