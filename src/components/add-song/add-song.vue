<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box placeholder="搜索歌曲"
                    ref="searchBox"
                    @query="onQueryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches"
                  :currentIndex="currentIndex"
                  @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll v-if="currentIndex === 0"
                  ref="songList"
                  class="list-scroll"
                  :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory"
                         @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll v-if="currentIndex === 1"
                  ref="searchList"
                  class="list-scroll"
                  :data="searchHistory">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory"
                           @select="addQuery"
                           :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query"
                 :showSinger="showSinger"
                 @select="selectSuggest"
                 @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip" :delay="1500">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">成功添加1首歌曲到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
  import searchBox from 'base/search-box'
  import suggest from 'components/suggest/suggest'
  import {searchMixin} from 'common/js/mixin'
  import switches from 'base/switches'
  import scroll from 'base/scroll'
  import songList from 'base/song-list'
  import {mapGetters, mapActions} from 'vuex'
  import Song from 'common/js/song'
  import searchList from 'base/search-list'
  import topTip from 'base/top-tip'

  export default {
    mixins: [searchMixin],
    data() {
      return {
        showFlag: false,
        showSinger: false,
        currentIndex: 0,
        switches: [
          {
            name: '最近播放'
          },
          {
            name: '搜索历史'
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchList.refresh()
          }
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      selectSuggest() {
        this.saveSearch()
        this.showTip()
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
          this.showTip()
        }
      },
      showTip() {
        this.$refs.topTip.show()
      },
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      searchBox,
      suggest,
      switches,
      scroll,
      songList,
      searchList,
      topTip
    }
  }
</script>

<style lang="stylus" scoped>
  @import "~common/styl/variable"
  @import "~common/styl/mixin"

  .add-song
    position fixed
    top 0
    bottom  0
    width 100%
    z-index 5
    background $color-background
    &.slide-enter-active,&.slide-leave-active
      transition all .3s
    &.slide-enter,&.slide-leave-to
      transform translate3d(100%, 0, 0)
    .header
      position relative
      height 44px
      text-align center
      .title
        line-height 44px
        font-size $font-size-large
        color $color-text
       .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
