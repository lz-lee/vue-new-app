<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import musicList from 'components/music-list/music-list'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {createSong} from 'common/js/song'
  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      this._getMusicList()
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
      },
      ...mapGetters([
          'topList'
        ])
    },
    methods: {
      _getMusicList() {
        if (!this.topList.id) {
          this.$router.back()
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSong(res.songlist)
          } else {
            throw new Error('get music list errcode ' + res.code)
          }
        }).catch((err) => {
          console.log(err)
        })
      },
      _normalizeSong(list) {
        let result = []
        list.forEach(({data}) => {
          const musicData = data
          if (musicData.songid && musicData.albummid) {
            result.push(createSong(musicData))
          }
        })
        return result
      }
    },
    components: {
      musicList
    }
  }
</script>
<style lang="stylus" scoped>
  .slide-enter,.slide-leave-active
    transform translate3d(100%, 0, 0)
</style>