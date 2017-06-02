<template>
    <div class="loading">
      <img width="36" height="36" src="../common/image/loading.gif">
      <p class="desc">{{title}}</p>
    </div>
</template>
<script type="text/javascript">
  export default {
    props: {
      title: {
        type: String,
        default: '正在载入...'
      }
    }
  }
</script>
<style lang="stylus" scoped>
  @import "~common/styl/variable"
  .loading
    width 100%
    text-align center
    .desc
      line-height 20px
      font-size $font-size-small
      color $color-text-l
</style>