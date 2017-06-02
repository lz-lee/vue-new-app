<template>
  <div class="recommend">
    <scroll class="recommend-content" :data="distList" ref='scroll'>
      <div>
          <div v-if="recommends.length" class="slider-wrapper">
              <slider>
                  <div v-for="item in recommends">
                      <a :href="item.linkUrl">
                          <img @load="loadImage" class="needsclick" :src="item.picUrl">
                      </a>
                  </div>
              </slider>
          </div>
          <div class="recommend-list">
            <h1 class="list-title">热门歌单推荐</h1>
            <ul>
              <li v-for="item in distList" class="item" @click="selectItem(item)">
                <div class="icon">
                  <img v-lazy="item.imgurl" width="60" height="60">
                </div>
                <div class="text">
                  <h2 class="name" v-html="item.creator.name"></h2>
                  <p class="desc" v-html="item.dissname"></p>
                </div>
              </li>
            </ul>
          </div>
      </div>
      <div class="loading-content" v-show="!distList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>
<script>
  import {getRecommend, getDistList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import slider from 'base/slider'
  import Scroll from 'base/scroll'
  import loading from 'base/loading'
  export default {
      data() {
          return {
              recommends: [],
              distList: [],
              checkLoaded: false
          }
      },
      created() {
          this._getRecommend()
          setTimeout(() => {
            this._getDistList()
          }, 500)
      },
      methods: {
          _getRecommend() {
              getRecommend().then((res) => {
                  if (res.code === ERR_OK) {
                      this.recommends = res.data.slider
                  }
              })
          },
          _getDistList() {
            getDistList().then((res) => {
              if (res.code === ERR_OK) {
                this.distList = res.data.list
              } else {
                throw new Error('get song list errcode' + res.data.code)
              }
            }).catch((err) => {
              console.log(err)
            })
          },
          loadImage() {
            // 设置标识位，让refresh只触发一次
            if (!this.checkLoaded) {
              this.$refs.scroll.refresh()
              this.checkLoaded = true
            }
          }
      },
      components: {
          slider,
          Scroll,
          loading
      }
  }
</script>
<style lang="stylus" scoped>
@import "~common/styl/variable"
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
      .recommend-list
        .list-title
          height 65px
          line-height 65px
          text-align center
          font-size $font-size-medium
          color $color-theme
        .item
          display flex
          box-sizing border-box
          align-items center
          padding 0 20px 20px 20px
          .icon
            flex 0 0 60px
            width 60px
            padding-right 20px
            img
              display block
          .text
            flex 1
            display flex
            flex-direction column
            justify-content center
            line-height 20px
            overflow hidden
            font-size $font-size-medium
            .name
              margin-bottom 10px
              color $color-text
            .desc
              color $color-text-d
      .loading-content
        width 100%  
        position absolute
        top 50%
        transform translateY(-50%)
</style>