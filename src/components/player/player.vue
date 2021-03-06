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
            <div class="middle"
                 @touchstart.prevent="middleTouchStart"
                 @touchmove.prevent="middleTouchMove"
                 @touchend="middleTouchEnd">
                <div class="middle-l" ref="middlel">
                    <div class="cd-wrapper" ref="cdWrapper">
                        <div class="cd" :class="cdCls">
                            <img class="image" :src="currentSong.image">
                        </div>
                    </div>
                    <div class="playing-lyric-wrapper">
                      <div class="playing-lyric">{{playingLyric}}</div>
                    </div>
                </div>
                <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                  <div class="lyric-wrapper">
                    <div v-if="currentLyric">
                      <p ref="lyricLine"
                         class="text"
                         :key="index"
                         :class="{'current': currentLineNum === index}"
                         v-for="(line, index) in currentLyric.lines">{{line.txt}}
                         </p>
                    </div>
                    <div class="pure-music" v-show="isPureMusic">
                        <p>{{pureMusicLyric}}</p>
                    </div>
                  </div>
                </scroll>
            </div>
            <div class="bottom">
                <div class="dot-wrapper">
                  <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
                  <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
                </div>
                <div class="progress-wrapper">
                    <span class="time time-l">{{format(currentTime)}}</span>
                    <div class="progress-bar-wrapper">
                        <progress-bar :percent="percent"
                                      ref="progressBar"
                                      @percentChange="onPercentChange"
                                      @percentChanging="onPercentChanging"></progress-bar>
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
                        <i class="icon"
                            @click="toggleFavorite(currentSong)"
                           :class="getFavoriteIcon(currentSong)"></i>
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
                    <i class="icon-playlist" @click.stop="showPlaylist"></i>
            </div>
        </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>
<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefix} from 'common/js/prefix'
    import {playMode} from 'common/js/config'
    import Lyric from 'lyric-parser'
    import ProgressBar from 'base/progress-bar'
    import ProgressCircle from 'base/progress-circle'
    import scroll from 'base/scroll'
    import playlist from 'components/playlist/playlist'
    import {playerMixin} from 'common/js/mixin'

    const transform = prefix('transform')
    const transitionDuration = prefix('transitionDuration')
    const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g
    export default {
        mixins: [playerMixin],
        data() {
            return {
                // 可快速点击 prev 和next
                songReady: false,
                currentTime: 0,
                radius: 32,
                currentLyric: null,
                currentLineNum: 0,
                currentShow: 'cd',
                playingLyric: '',
                isPureMusic: false,
                pureMusicLyric: ''
            }
        },
        watch: {
            currentSong(newSong, oldSong) {
                // 当子组件playlist删除歌曲时，会改变currentSong，删除最后一条数据时currentSong为空，因此要做判断。
                if (!newSong.id) return

                if (newSong.id === oldSong.id) return
                this.songReady = false
                if (this.currentLyric) {
                  this.currentLyric.stop()
                  this.currentLyric = null
                  this.currentTime = 0
                  this.playingLyric = ''
                  this.currentLineNum = 0
                }
                clearTimeout(this.timer)
                // 保证微信从后台到前台仍能播放
                this.timer = setTimeout(() => {
                    this.$refs.audio.play()
                    this.getLyric()
                }, 1000)
            },
            playing(newVal) {
                // 当歌曲没有 ready 的时候，切换不要播放歌曲。
                if (!this.songReady) return
                // 缓存audio
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newVal ? audio.play() : audio.pause()
                })
            },
            fullscreen(newVal) {
              if (newVal) {
                setTimeout(() => {
                  this.$refs.lyricList.refresh()
                  this.$refs.progressBar.setProgressOffset(this.percent)
                })
              }
            }
        },
        created() {
          this.touch = {}
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
            percent() {
                return this.currentTime / this.currentSong.duration
            },
            ...mapGetters([
                'fullscreen',
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
                const timer = setTimeout(done, 400)
                this.$refs.cdWrapper.addEventListener('transitionend', () => {
                    clearTimeout(timer)
                    done()
                })
                // this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave() {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            togglePlaying() {
                this.setPlayingState(!this.playing)
                if (this.currentLyric) {
                  this.currentLyric.togglePlay()
                }
            },
            prev() {
                if (!this.songReady) return
                if (this.playlist.length === 1) {
                  this.loop()
                  return
                } else {
                  let index = this.currentIndex - 1
                  if (index === -1) index = this.playlist.length - 1
                  this.setCurrentIndex(index)
                  // 暂停状态切换歌曲，需要改变图标状态
                  if (!this.playing) {
                      this.togglePlaying()
                  }
                }
            },
            end() {
                this.currentTime = 0
              if (this.mode === playMode.loop) {
                this.loop()
              } else {
                this.next()
              }
            },
            loop() {
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
                this.setPlayingState(true)
                if (this.currentLyric) {
                  this.currentLyric.seek(0)
                }
            },
            next() {
                if (!this.songReady) return
                // 处理playlist 只有一条数据的情况
                if (this.playlist.length === 1) {
                  this.loop()
                  return
                } else {
                  let index = this.currentIndex + 1
                  if (index === this.playlist.length) index = 0
                  this.setCurrentIndex(index)
                  if (!this.playing) {
                      this.togglePlaying()
                  }
                }
            },
            ready() {
                this.songReady = true
                this.savePlayHistory(this.currentSong)
                if (this.currentLyric && !this.isPureMusic) {
                    this.currentLyric.seek(this.currentTime * 1000)
                }
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
              this.currentTime = this.$refs.audio.currentTime = currentTime
              // 暂停状态下拖动结束后改变状态
              if (!this.playing) this.togglePlaying()
              // 拖动滚动条，歌词找到对应位置
              if (this.currentLyric) {
                this.currentLyric.seek(currentTime * 1000)
              }
            },
            onPercentChanging(percent) {
                this.currentTime = this.currentSong.duration * percent
                if (this.currentLyric) {
                    this.currentLyric.seek(this.currentTime * 1000)
                }
            },
            getLyric() {
              this.currentSong.getLyric().then((res) => {
                // audio.play() 和getLyric是同步，而获取歌词是异步，当在获取歌词的时候切换歌曲，会发出多次获取歌词异步请求，因此要做判断。
                if (this.currentSong.lyric !== res) {
                    return
                }
                this.currentLyric = new Lyric(res, this.handleLyric)
                this.isPureMusic = !this.currentLyric.lines.length
                if (this.isPureMusic) {
                    this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim()
                    this.playingLyric = this.pureMusicLyric
                } else {
                    if (this.playing && this.songReady) {
                    // 此时用户有可能已经播放了歌曲，切到对应位置
                    const currentTime = this.currentSong.duration * this.percent * 1000
                    this.currentLyric.seek(currentTime)
                    }
                }
              }).catch(() => {
                this.currentLyric = null
                this.playingLyric = ''
                this.currentLineNum = 0
              })
            },
            handleLyric({lineNum, txt}) {
              if (!this.$refs.lyricLine) {
                return
              }
              this.currentLineNum = lineNum
              if (lineNum > 5) {
                let lineEl = this.$refs.lyricLine[lineNum - 5]
                this.$refs.lyricList.scrollToElement(lineEl, 1000)
              } else {
                this.$refs.lyricList.scrollToElement(0, 0, 1000)
              }
              // 实时歌词
              this.playingLyric = txt
            },
            middleTouchStart(e) {
              this.touch.initaited = true
              // 判断是否是一次移动, 解决点击bug
              // touchstart -> touchmove -> touchend -> click
              this.touch.moved = false
              this.touch.startX = e.touches[0].pageX
              this.touch.startY = e.touches[0].pageY
            },
            middleTouchMove(e) {
              if (!this.touch.initaited) return
              const diffX = e.touches[0].pageX - this.touch.startX
              const diffY = e.touches[0].pageY - this.touch.startY
              if (Math.abs(diffY) > Math.abs(diffX)) return
              if (!this.touch.moved) {
                this.touch.moved = true
              }
              const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
              const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + diffX))
              this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
              this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 , 0)`
              this.$refs.lyricList.$el.style[transitionDuration] = 0
              this.$refs.middlel.style.opacity = 1 - this.touch.percent
              this.$refs.middlel.style[transitionDuration] = 0
            },
            middleTouchEnd(e) {
              if (!this.touch.moved) {
                return
              }
              let offsetWidth
              let opacity
              if (this.currentShow === 'cd') {
                if (this.touch.percent > 0.1) {
                  offsetWidth = -window.innerWidth
                  this.currentShow = 'lyric'
                  opacity = 0
                } else {
                  offsetWidth = 0
                  opacity = 1
                }
              } else {
                if (this.touch.percent < 0.9) {
                  offsetWidth = 0
                  this.currentShow = 'cd'
                  // 不透明
                  opacity = 1
                } else {
                  offsetWidth = -window.innerWidth
                  // 透明
                  opacity = 0
                }
              }
              const time = 300
              this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 , 0)`
              this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
              this.$refs.middlel.style.opacity = opacity
              this.$refs.middlel.style[transitionDuration] = `${time}ms`
            },
            showPlaylist() {
                this.$refs.playlist.show()
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
                setFullScreen: 'SET_FULL_SCREEN'
            }),
            ...mapActions([
                'savePlayHistory'
            ])
        },
        components: {
            ProgressBar,
            ProgressCircle,
            scroll,
            playlist
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
                    .playing-lyric-wrapper
                      width 80%
                      margin 30px auto 0 auto
                      overflow hidden
                      text-align center
                      .playing-lyric
                        height 20px
                        line-height 20px
                        font-size $font-size-medium
                        color $color-text-l
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
                    .pure-music
                        padding-top 50%
                        line-height 32px
                        color: $color-text-l
                        font-size $font-size-medium
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                  text-align center
                  font-size 0
                  .dot
                    display inline-block
                    vertical-align middle
                    margin 0  4px
                    width 8px
                    height 8px
                    border-radius 50%
                    background $color-text-l
                    &.active
                      width 20px
                      border-radius 5px
                      background $color-text-ll
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
                flex-direction column
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