<template>
    <div class="crowdloan-community">
        <div class="community-info">
            <!-- 返回按钮 -->
            <img src="~@/static/images/left-arrow.png" alt="">
            <!-- 背景 -->
            <img src="" alt="">
            <!-- logo -->
            <img src="" alt="">
            <p class="community-title"></p>
            <!-- outlink -->
            <img src="" alt="">
            <p class="community-desc"></p>
        </div>

    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        data() {
            return {
                key: value
            }
        },
        components: {
        },
        props: {
            
        },
        computed: {
            ...mapState('kusama', ['']),
            communityId() {
                return this.data 
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>