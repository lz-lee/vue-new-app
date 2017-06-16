import {mapGetters} from 'vuex'
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