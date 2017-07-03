<template>
<transition name="confirm-fade">
  <div class="confirm" v-show="showFlag">
    <div class="confirm-wrapper">
      <div class="confirm-content">
        <p class="text">{{text}}</p>
        <div class="operate">
          <div class="operate-btn left" @click="cancle">{{cancleBtnText}}</div>
          <div class="operate-btn" @click="confirm">{{confirmBtnText}}</div>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>
<script type="text/javascript">
  export default {
    props: {
      text: {
        type: String,
        default: ''
      },
      confirmBtnText: {
        type: String,
        default: '确定'
      },
      cancleBtnText: {
        type: String,
        default: '取消'
      }
    },
    data() {
      return {
        showFlag: false
      }
    },
    methods: {
      show() {
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      cancle() {
        this.hide()
        this.$emit('cancle')
      },
      confirm() {
        this.hide()
        this.$emit('confirm')
      }
    }
  }
</script>
<style lang="stylus">
  @import "~common/styl/variable"
  .confirm
    position: fixed
    left 0
    right 0
    top 0
    bottom 0
    z-index 10
    background-color $color-background-d
    &.confirm-fade-enter-active
      animation: confirm-fadein .3s
      .confirm-content
        animation confirm-zoom .3s
    .confirm-wrapper
      position absolute
      top 50%
      left 50%
      transform translate(-50%,-50%)
      z-index 11
      .confirm-content
        width 270px
        border-radius 13px
        background $color-highlight-background
        text-align center
        .text
          padding 19px 15px
        .operate
          display: flex
          align-items center
          font-size  $font-size-large
          .operate-btn
            flex 1
            line-height 22px
            padding 10px 0
            border-top 1px solid $color-background-d
            color $color-text-d
            &.left 
              border-right 1px solid $color-background-d
  
  @keyframes confirm-fadein
    0%
      opacity 0
    100%
      opacity 1
  @keyframes confirm-zoom
    0%
      transform scale(0)
    50%
      transform scale(1.1)
    100%
      transform scale(1)
</style>