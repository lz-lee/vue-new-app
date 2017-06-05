<template>
    <div class="player" v-show="playlist.length > 0">
        <div class="normal-player" v-show="fullscreen">
            播放器
        </div>
        <div class="min-player" v-show="!fullscreen"></div>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex'
    export default {
        computed: {
            ...mapGetters([
                'fullscreen',
                'playlist'
                ])
        }
    }
</script>
<style scoped lang="stylus">
    @import "~common/styl/variable"
    @import "~common/styl/mixin"
    .player
        .normal-player
            position fixed
            left 0
            right 0
            top 0
            bottom 0
            z-index 4
            background $color-background
        .min-player
            display flex
            align-items center
            position fixed
            left 0
            bottom 0
            z-index 4
            width 100%
            height 60px
            background: $color-highlight-background
</style>