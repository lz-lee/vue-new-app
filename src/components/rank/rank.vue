<template>
    <div class="rank" ref="rank">
        <scroll :data="topList" class="topList" ref="topList">
          <ul>
            <li class="item" v-for="item in topList" @click="selectItem(item)">
              <div class="icon">
                <img width="100" height="100" v-lazy="item.picUrl">
              </div>
              <ul class="songlist">
                <li class="song" v-for="(song, index) in item.songList">
                  <span>{{index + 1}}</span>
                  <span>{{song.songname}}</span>
                </li>
              </ul>
            </li>
          </ul>
          <div class="loading-container" v-show="!topList.length">
            <loading></loading>
          </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>
<script>
    import {getTopList} from 'api/rank'
    import {ERR_OK} from 'api/config'
    import {playlistMixin} from 'common/js/mixin'
    import {mapMutations} from 'vuex'
    import loading from 'base/loading'
    import scroll from 'base/scroll'

    export default {
      mixins: [playlistMixin],
      data() {
        return {
          topList: []
        }
      },
      created() {
        setTimeout(() => {
          this._getTopList()
        }, 300)
      },
      methods: {
        handPlaylist(playlist) {
          const bottom = playlist.length > 0 ? '60px' : 0
          this.$refs.rank.style.bottom = bottom
          this.$refs.topList.refresh()
        },
        selectItem(item) {
          this.$router.push({
            path: `rank/${item.id}`
          })
          this.setTopList(item)
        },
        _getTopList() {
          getTopList().then((res) => {
            if (res.code === ERR_OK) {
              this.topList = res.data.topList
            } else {
              throw new Error('get rank list errcode ' + res.code)
            }
          }).catch((err) => {
            console.log(err)
          })
        },
        ...mapMutations({
          setTopList: 'SET_TOP_LIST'
        })
      },
      components: {
        loading,
        scroll
      }
    }
</script>
<style lang="stylus" scoped>
    @import "~common/styl/variable"
    @import "~common/styl/mixin"
    
    .rank
      position fixed
      width 100%
      top 88px
      bottom 0px
      .topList
        height 100%
        overflow hidden
        .item
          display flex
          margin 0 20px
          padding-top 20px
          height 100px
          &:last-child
            padding-bottom 20px
          .icon
            flex 0 0 100px
            width 100px
            height 100px
          .songlist
            flex 1
            display flex
            flex-direction column
            justify-content center
            padding 0 20px
            height 100px
            overflow hidden
            background $color-highlight-background
            color $color-text-d
            font-size $font-size-small
            .song
              no-wrap()
              line-height 26px
        .loading-container
          position absolute
          width 100%
          top 50%
          transform translateY(-50%)
</style>