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
                <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                  <div class="lyric-wrapper">
                    <div v-if="currentLyric">
                      <p ref="lyricLine"
                         class="text"
                         :class="{'current': currentLineNum === index}"
                         v-for="(line, index) in currentLyric.lines">{{line.txt}}</p>
                    </div>
                  </div>
                </scroll>
            </div>
            <div class="bottom">
                <div class="progress-wrapper">
                    <span class="time time-l">{{format(currentTime)}}</span>
                    <div class="progress-bar-wrapper">
                        <progress-bar :percent="percent" @percentChange="onPercentChange"></progress-bar>
                    </div>
                    <span class="time time-r">{{format(currentSong.duration)}}</span>
                </div>
                <div class="operators">
                    <div class="icon i-left" @click="changeMode">
                        <i :class="iconMode"></i>
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
                <progress-circle :radius="radius" :percent="percent">
                    <i :class="miniIcon" class="icon-mini" @click.stop.prevent="togglePlaying"></i>
                </progress-circle>
            </div>
            <div class="control">
                    <i class="icon-playlist"></i>
            </div>
        </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>
<script>
    import {mapGetters, mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefix} from 'common/js/prefix'
    import {playMode} from 'common/js/config'
    import {shuffle} from 'common/js/util'
    import Lyric from 'lyric-parser'
    import ProgressBar from 'base/progress-bar'
    import ProgressCircle from 'base/progress-circle'
    import scroll from 'base/scroll'

    const transform = prefix('transform')

    export default {
        data() {
            return {
                // 可快速点击 prev 和next
                songReady: false,
                currentTime: 0,
                radius: 32,
                currentLyric: null,
                currentLineNum: 0
            }
        },
        watch: {
            currentSong(newSong, oldSong) {
                if (newSong.id === oldSong.id) return
                this.$nextTick(() => {
                    this.$refs.audio.play()
                    this.getLyric()
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
            iconMode() {
                return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
            },
            disableCls() {
                return this.songReady ? '' : 'disable'
            },
            percent() {
                return this.currentTime / this.currentSong.duration
            },
            ...mapGetters([
                'fullscreen',
                'playlist',
                'currentSong',
                'playing',
                'currentIndex',
                'mode',
                'sequencelist'
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
            end() {
              if (this.mode === playMode.loop) {
                this.loop()
              } else {
                this.next()
              }
            },
            loop() {
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
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
            updateTime(e) {
                this.currentTime = e.target.currentTime
            },
            format(interval) {
                // 整数向下取整
                interval = interval | 0
                const minute = interval / 60 | 0
                const second = this._leftPad(interval % 60)
                return `${minute}:${second}`
            },
            onPercentChange(percent) {
              const currentTime = this.currentSong.duration * percent
              this.$refs.audio.currentTime = currentTime
              // 暂停状态下拖动结束后改变状态
              if (!this.playing) this.togglePlaying()
            },
            changeMode() {
                const mode = (this.mode + 1) % 3
                this.setMode(mode)
                let list = null
                if (mode === playMode.random) {
                    list = shuffle(this.sequencelist)
                } else {
                    list = this.sequencelist
                }
                this.resetCurrentIndex(list)
                this.setPlaylist(list)
            },
            resetCurrentIndex(list) {
                let index = list.findIndex((item) => {
                    return this.currentSong.id === item.id
                })
                this.setCurrentIndex(index)
            },
            getLyric() {
              this.currentSong.getLyric().then((res) => {
                this.currentLyric = new Lyric(res, this.handleLyric)
                if (this.playing) {
                  this.currentLyric.play()
                }
              })
            },
            handleLyric({lineNum, txt}) {
              this.currentLineNum = lineNum
              if (lineNum > 5) {
                let lineEl = this.$refs.lyricLine[lineNum - 5]
                this.$refs.lyricList.scrollToElement(lineEl, 1000)
              } else {
                this.$refs.lyricList.scrollToElement(0, 0, 1000)
              }
            },
            _leftPad(num, n = 2) {
                let len = num.toString().length
                while (len < n) {
                    num = '0' + num
                    len++
                }
                return num
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
                setCurrentIndex: 'SET_CURRENT_INDEX',
                setMode: 'SET_PLAY_MODE',
                setPlaylist: 'SET_PLAYLIST'
            })
        },
        components: {
            ProgressBar,
            ProgressCircle,
            scroll
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
                .middle-r
                  display inline-block
                  vertical-align top
                  width 100%
                  height 100%
                  overflow hidden
                  .lyric-wrapper
                    width 80%
                    margin 0 auto
                    text-align center
                    .text
                      line-height 32px
                      color $color-text-l
                      font-size $font-size-medium
                      &.current
                        color $color-text
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .progress-wrapper
                    display flex
                    align-items center
                    width 80%
                    margin 0 auto
                    padding 10px 0
                    .progress-bar-wrapper
                        flex 1
                    .time
                        color $color-text
                        font-size $font-size-small
                        flex 0 0 30px
                        width 30px
                        &.time-l
                            text-align left
                        &.time-r
                            text-align right
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
                .icon-mini
                    font-size 32px
                    position absolute
                    left 0
                    top 0
    @keyframes rotate 
        0%
            transform rotate(0)
        100%
            transform rotate(360deg)
    
</style>