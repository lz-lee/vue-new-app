<template>
    <transition name="slide">
        <div class="singer-detail"></div>
    </transition>
</template>
<script>
    export default {}
</script>
<style lang="stylus" scoped>
    @import "~common/styl/variable"
    .singer-detail
        position: fixed
        left:0
        top 0
        bottom 0
        right 0
        z-index 3
        background $color-background
        transition:all .3s linear
        transform: translate3d(0, 0, 0)
        &.slide-enter,&.slide-leave-active
            transform translate3d(100%, 0, 0)
        
</style>