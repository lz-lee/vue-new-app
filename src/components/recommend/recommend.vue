<template>
  <div class="recommend">
      <div class="recommend-content">
          <div v-if="recommends.length" class="slider-wrapper">
              <slider>
                  <div v-for="item in recommends">
                      <a :href="item.linkUrl">
                          <img class="needsclick" :src="item.picUrl">
                      </a>
                  </div>
              </slider>
          </div>
      </div>
  </div>
</template>
<script>
  import {getRecommend} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import slider from 'base/slider'

  export default {
      data() {
          return {
              recommends: []
          }
      },
      created() {
          this._getRecommend()
      },
      methods: {
          _getRecommend() {
              getRecommend().then((res) => {
                  if (res.code === ERR_OK) {
                      this.recommends = res.data.slider
                  }
              })
          }
      },
      components: {
          slider
      }
  }
</script>
<style lang="stylus" scoped>
  .recommend
    position fixed
    width 100%
    top 88px
    bottom 0
    .recommend-content
      height 100%
      overflow hidden
      .slider-wrapper
        position relative
        overflow hidden
        width 100%
</style>