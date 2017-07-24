import {mapGetters, mapMutations} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playlistMixin = {
  watch: {
    playlist(newVal) {
      this.handPlaylist(newVal)
    }
  },
  computed: {
    ...mapGetters([
        'playlist'
      ])
  },
  mounted() {
    this.handPlaylist(this.playlist)
  },
  activated() {
    this.handPlaylist(this.playlist)
  },
  methods: {
    handPlaylist() {
      throw new Error('component must implement handPlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequencelist',
      'currentSong',
      'mode',
      'playlist'
    ])
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setMode(mode)
      let list = null
      if (mode === playMode.random) {
          list = shuffle(this.sequencelist)
      } else {
          list = this.sequencelist
      }
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
          return this.currentSong.id === item.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    })
  }
}