<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" v-for="(item, index) in dots" :class="{active: currentPageIndex === index}"></span>
        </div>
    </div>
</template>
<script>
    import BScroll from 'better-scroll'
    export default {
        props: {
            loop: {
                type: Boolean,
                default: true
            },
            autoPlay: {
                type: Boolean,
                default: true
            },
            interval: {
                type: Number,
                default: 3000
            }
        },
        data() {
            return {
                dots: [],
                currentPageIndex: 0
            }
        },
        created() {
        },
        methods: {
            _setSliderWidth(isResize) {
                this.children = this.$refs.sliderGroup.children
                let width = 0
                // 获取视口宽度
                let sliderWidth = this.$refs.slider.clientWidth
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i]
                    // 动态加class
                    if (child.classList && !child.classList.contains('slider-item')) {
                        child.classList.add('slider-item')
                    }
                    // 设置slider-item的宽度
                    child.style.width = sliderWidth + 'px'
                    width += sliderWidth
                }
                // 如果循环播放，设置容器需要加上两倍宽度,bsrcoll 会克隆前后两个元素
                if (this.loop && !isResize) {
                    width += 2 * sliderWidth
                }
                this.$refs.sliderGroup.style.width = width + 'px'
            },
            _initSlider() {
                this.slider = new BScroll(this.$refs.slider, {
                    scrollX: true,
                    scrollY: false,
                    click: true,
                    momentum: false,
                    snap: true,
                    // 是否无缝轮播
                    snapLoop: this.loop,
                    snapSpeed: 400,
                    snapThreshold: 0.3  // 滑动时页面可切换的阈值
                })
                this.slider.on('scrollEnd', () => {
                  let pageIndex = this.slider.getCurrentPage().pageX
                  if (this.loop) {
                    pageIndex -= 1
                  }
                  this.currentPageIndex = pageIndex
                  // 清除定时，防止手动操作时改变index与自动轮播相冲突
                  if (this.autoPlay) {
                    this._play()
                  }
                  this.slider.on('beforeScrollStart', () => {
                    if (this.autoPlay) {
                      clearTimeout(this.timer)
                    }
                  })
                })
            },
            _initDots() {
              this.dots = new Array(this.children.length)
            },
            _play() {
              let pageIndex = this.currentPageIndex + 1
              if (this.loop) {
                pageIndex += 1
              }
              this.timer = setTimeout(() => {
                // goToPage(x, y, time), snap为true时，滚动到对应的页面
                this.slider.goToPage(pageIndex, 0, 400)
              }, this.interval)
            }
        },
        mounted() {
            setTimeout(() => {
                // mounted 的时候，由于异步recommends数据，slot里的元素不一定会有，需要判断recommends.length
                this._setSliderWidth()
                this._initDots()
                this._initSlider()
                if (this.autoPlay) {
                  this._play()
                }
            }, 20)

            window.addEventListener('resize', () => {
              if (!this.slider) {
                return
              }
              // 设置一个标识，当resize时不需要将容器宽度加上两倍宽度，调用bsrcoll的refresh来重新计算width
              this._setSliderWidth(true)
              this.slider.refresh()
            })
        },
        activated() {
          if (this.autoPlay) {
            this._play()
          }
        },
        deactivated() {
          clearTimeout(this.timer)
        }
    }
</script>
<style lang="stylus" scoped>
@import "~common/styl/variable"
.slider
  min-height:1px
  .slider-group
    position relative
    overflow hidden
    white-space nowrap
    .slider-item
      float left
      box-sizing border-box
      overflow hidden
      text-align center
      a
        display block
        width 100%
        overflow hidden
      img
        display block
        width 100%
  .dots
    position absolute
    right 0
    left 0
    bottom 12px
    text-align center
    font-size 0
    .dot
      display inline-block
      margin 0 4px
      width 8px
      height 8px
      border-radius 50%
      background $color-text-l
      &.active
       width 20px
       border-radius 5px
       background $color-text-ll
</style>