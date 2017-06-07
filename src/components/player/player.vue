<template>
    <div class="player" v-show="playlist.length > 0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
        <div class="normal-player" v-show="fullscreen">
            <div class="background">
                <img width="100%" height="100%" :src="currentSong.image">
            </div>
            <div class="top">
                <div class="back" @click="back">
                    <i class="icon-back"></i>
                </div>
                <h1 class="title" v-html="currentSong.name"></h1>
                <h2 class="subtitle" v-html="currentSong.singer"></h2>
            </div>
            <div class="middle">
                <div class="middle-l">
                    <div class="cd-wrapper" ref="cdWrapper">
                        <div class="cd" :class="cdCls">
                            <img class="image" :src="currentSong.image">
                        </div>
                    </div>
                </div>
            </div>
            <div class="bottom">
                <div class="operators">
                    <div class="icon i-left">
                        <i class="icon-sequence"></i>
                    </div>
                    <div class="icon i-left" :class="disableCls">
                        <i class="icon-prev" @click="prev"></i>
                    </div>
                    <div class="icon i-center" :class="disableCls">
                        <i :class="playIcon" @click="togglePlaying"></i>
                    </div>
                    <div class="icon i-right" :class="disableCls">
                        <i class="icon-next" @click="next"></i>
                    </div>
                    <div class="icon i-right">
                        <i class="icon icon-not-favorite"></i>
                    </div>
                </div>
            </div>
        </div>
    </transition>
    <transition name="mini">
        <div class="min-player" v-show="!fullscreen" @click="open">
            <div class="icon">
                <img width="40" height="40" :src="currentSong.image" :class="cdCls">
            </div>
            <div class="text">
                <h2 class="name" v-html="currentSong.name"></h2>
                <p class="desc" v-html="currentSong.singer"></p>
            </div>
            <div class="control">
                <i :class="miniIcon" @click.stop.prevent="togglePlaying"></i>
            </div>
            <div class="control">
                <i class="icon-playlist"></i>
            </div>
        </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error"></audio>
    </div>
</template>
<script>
    import {mapGetters, mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefix} from 'common/js/prefix'

    const transform = prefix('transform')

    export default {
        data() {
            return {
                // 可快速点击 prev 和next
                songReady: false
            }
        },
        watch: {
            currentSong() {
                this.$nextTick(() => {
                    this.$refs.audio.play()
                })
            },
            playing(newVal) {
                // 缓存audio
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newVal ? audio.play() : audio.pause()
                })
            }
        },
        computed: {
            cdCls() {
                return this.playing ? 'play' : 'play pause'
            },
            playIcon() {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            miniIcon() {
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
            },
            disableCls() {
                return this.songReady ? '' : 'disable'
            },
            ...mapGetters([
                'fullscreen',
                'playlist',
                'currentSong',
                'playing',
                'currentIndex'
                ])
        },
        methods: {
            back() {
                this.setFullScreen(false)
            },
            open() {
                this.setFullScreen(true)
            },
            enter(el, done) {
                const {x, y, scale} = this._getPosandScale()

                let animation = {
                    0: {
                        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0, 0, 0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0, 0, 0) scale(1)`
                    }
                }
                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 500,
                        easing: 'linear'
                    }
                })

                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            afterEnter() {
                // 动画执行完后，清空动画，移除动画样式
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation = ''
            },
            leave(el, done) {
                this.$refs.cdWrapper.style.transition = 'all .4s'
                const {x, y, scale} = this._getPosandScale()
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave() {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            togglePlaying() {
                this.setPlayingState(!this.playing)
            },
            prev() {
                if (!this.songReady) return
                let index = this.currentIndex - 1
                if (index === -1) index = this.playlist.length - 1
                this.setCurrentIndex(index)
                // 暂停状态切换歌曲，需要改变图标状态
                if (!this.playing) {
                    this.togglePlaying()
                }
                this.songReady = false
            },
            next() {
                if (!this.songReady) return
                let index = this.currentIndex + 1
                if (index === this.playlist.length) index = 0
                this.setCurrentIndex(index)
                if (!this.playing) {
                    this.togglePlaying()
                }
                this.songReady = false
            },
            ready() {
                this.songReady = true
            },
            error() {
                this.songReady = true
            },
            _getPosandScale() {
                const targetWidth = 40
                const paddingTop = 80
                const paddingBottom = 30
                const paddingLeft = 40
                const width = window.innerWidth * 0.8
                const scale = targetWidth / width
                // 起始位置 相对于 终止位置的坐标，x为负值，y为正值
                const x = -(window.innerWidth / 2 - paddingLeft)
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
                return {x, y, scale}
            },
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN',
                setPlayingState: 'SET_PLAYING_STATE',
                setCurrentIndex: 'SET_CURRENT_INDEX'
            })
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
            &.normal-enter-active,&.normal-leave-active
                transition all .4s
                .top, .bottom
                    transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            // 起始状态
            &.normal-enter,&.normal-leave-to
                opacity 0
                .top
                    transform translate3d(0, -100px, 0)
                .bottom
                    transform translate3d(0, 100px, 0)
            .background
                position absolute
                left 0
                top 0
                width 100%
                height 100%
                z-index -1
                filter blur(20px)
            .top
                position relative
                margin-bottom 25px
                .back
                    position absolute
                    top 0
                    left 6px
                    z-index 5
                    .icon-back
                        display block
                        padding 10px
                        font-size $font-size-large-x
                        color $color-theme
                        transform rotate(-90deg)
                .title
                    width 70%
                    margin 0 auto
                    line-height 40px
                    text-align center
                    no-wrap()
                    font-size $font-size-large
                    color $color-text
                .subtitle
                    line-height 20px
                    text-align center
                    font-size $font-size-medium
                    color $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused;
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
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
            &.mini-enter-active,&.mini-leave-active
                transition all .4s ease
            &.mini-enter,&.mini-leave-to
                opacity 0
            .icon
                flex 0 0 40px
                width 40px
                padding 0 10px 0 20px
                img
                    border-radius 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display flex
                flex-direciton columm
                justify-content center
                flex 1
                line-height 20px
                overflow hidden
                .name
                    margin-bottom 2px
                    np-wrap()
                    font-size $font-size-medium
                    color $color-text
                .desc
                    np-wrap()
                    font-size $font-size-small
                    color $color-text-d
            .control
                flex 0 0 30px
                width 30px
                padding 0 10px
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                  font-size: 30px
                  color: $color-theme-d
    
    @keyframes rotate 
        0%
            transform rotate(0)
        100%
            transform rotate(360deg)
    
</style>