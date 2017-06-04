<template>
    <div class="music-list">
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="filter" ref="filter"></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll :data="songs" 
                :probe-type="probeType"
                :listen-scroll="listenScroll"
                @scroll="scroll"
                class="list" 
                ref="list">
            <div class="song-list-wrapper">
                <song-list :songs="songs"></song-list>
            </div>
            <div class="loading-container" v-show="!songs.length">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>
<script>
    import scroll from 'base/scroll'
    import songList from 'base/song-list'
    import loading from 'base/loading'
    const RESERVED_HEIGHT = 40

    export default {
        props: {
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: []
            },
            title: {
                type: String,
                default: ''
            }
        },
        created() {
            this.probeType = 3
            this.listenScroll = true
        },
        data() {
            return {
                scrollY: 0
            }
        },
        watch: {
            scrollY(newY) {
                // newY是负值
                let translateY = Math.max(this.minTranslateY, newY)
                let zIndex = 0
                let scale = 1
                this.$refs.layer.style.transform = `translate3d(0, ${translateY}px, 0)`
                // 滚动到顶部,改变z-index和图片的高度
                if (newY < this.minTranslateY) {
                    zIndex = 2
                    this.$refs.bgImage.style.paddingTop = 0
                    this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                } else {
                    this.$refs.bgImage.style.paddingTop = '70%'
                    this.$refs.bgImage.style.height = 0
                }
                this.$refs.bgImage.style.zIndex = zIndex
            }
        },
        computed: {
            bgStyle() {
                return `background-image: url(${this.bgImage})`
            }
        },
        methods: {
            back() {
                this.$router.back()
            },
            scroll(pos) {
                this.scrollY = pos.y
            }
        },
        mounted() {
            this.imageHeight = this.$refs.bgImage.clientHeight
            // 缓存
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
            // 获取ref组件下的dom，用$el
            this.$refs.list.$el.style.top = `${this.imageHeight}px`
        },
        components: {
            scroll,
            songList,
            loading
        }
    }
</script>
<style lang="stylus">
    @import "~common/styl/variable"
    @import "~common/styl/mixin"
    .music-list
        position: fixed
        left:0
        top 0
        bottom 0
        right 0
        z-index 3
        background $color-background
        transition:all .3s linear
        transform: translate3d(0, 0, 0)
        .back
            position absolute
            top: 0
            left: 6px
            z-index: 3
            .icon-back
                display: block
                padding: 10px
                font-size: $font-size-large-x
                color: $color-theme
        .title
            position: absolute
            top: 0
            left: 10%
            z-index: 3
            width: 80%
            no-wrap()
            text-align: center
            line-height: 40px
            font-size: $font-size-large
            color: $color-text
        .bg-image
            position: relative
            width: 100%
            height: 0
            padding-top: 70%
            transform-origin: top
            background-size: cover
            .filter
                position absolute
                top 0
                left 0
                width 100%
                height 100%
                background rgba(7, 17, 27, 0.4)
        .bg-layer
            position relative
            height 100%
            background $color-background
        .list
            position: fixed
            top: 0
            bottom: 0
            width: 100%
            background: $color-background
            .song-list-wrapper
                padding: 20px 30px
            .loading-container
                position absolute
                top 50%
                width 100%
                transform translateY(-50%)
</style>