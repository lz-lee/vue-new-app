<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" :data="distList" ref='scroll'>
      <div>
          <div v-if="recommends.length" class="slider-wrapper">
            <div class="slider-content">
              <slider ref="slider">
                  <div v-for="item in recommends">
                      <a :href="item.linkUrl">
                          <img @load="loadImage" class="needsclick" :src="item.picUrl">
                      </a>
                  </div>
              </slider>
            </div>
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
    <router-view></router-view>
  </div>
</template>
<script>
  import {getRecommend, getDistList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import slider from 'base/slider'
  import Scroll from 'base/scroll'
  import loading from 'base/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
      mixins: [playlistMixin],
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
          handPlaylist(playlist) {
            const bottom = playlist.length > 0 ? '60px' : 0.4
            this.$refs.recommend.style.bottom = bottom
            this.$refs.scroll.refresh()
          },
          _getRecommend() {
              getRecommend().then((res) => {
                  if (res.code === ERR_OK) {
                      this.recommends = res.data.slider
                  } else {
                    throw new Error('get recommends errcode' + res.code)
                  }
              }).catch((err) => {
                console.log(err)
                // modal err
              })
          },
          _getDistList() {
            getDistList().then((res) => {
              if (res.code === ERR_OK) {
                this.distList = res.data.list
              } else {
                throw new Error('get song list errcode' + res.code)
              }
            }).catch((err) => {
              console.log(err)
              // do something
            })
          },
          loadImage() {
            // 设置标识位，让refresh只触发一次
            if (!this.checkLoaded) {
              this.checkLoaded = true
              setTimeout(() => {
                this.$refs.scroll.refresh()
              }, 20)
            }
          },
          selectItem(item) {
            this.$router.push({
              path: `/recommend/${item.dissid}`
            })
            this.setDisc(item)
          },
          ...mapMutations({
            setDisc: 'SET_DISC'
          })
      },
      activated() {
        setTimeout(() => {
          this.$refs.slider && this.$refs.slider.refresh()
        })
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
        height 0 
        padding-top 40%
        .slider-content
          position absolute
          top 0 
          left 0
          width 100%
          height 100%
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