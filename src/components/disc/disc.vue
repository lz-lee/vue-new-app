<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import musicList from 'components/music-list/music-list'
  export default {
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getSongList()
    },
    methods: {
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.back()
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSong(res.cdlist[0].songlist)
          } else {
            throw new Error('get song list errcode ' + res.code)
          }
        }).catch((err) => {
          console.log(err)
        })
      },
      _normalizeSong(list) {
        let result = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
              result.push(createSong(musicData))
          }
        })
        return result
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
        ])
    },
    components: {
      musicList
    }
  }
</script>
<style lang="stylus" scoped>
  .slide-enter,.slide-leave-active
    transform tranlate3d(100%, 0, 0)  
</style>