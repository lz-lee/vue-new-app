<template>
    <transition name="slide">
        <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
    </transition>
</template>
<script>
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from 'api/singer'
    import {ERR_OK} from 'api/config'
    import {createSong} from 'common/js/song'
    import musicList from 'components/music-list/music-list'
    export default {
        created() {
            this._getDetail()
        },
        data() {
            return {
                songs: []
            }
        },
        methods: {
            _getDetail() {
                // 当前页刷新，重新路由
                if (!this.singer.id) {
                    this.$router.push({
                        path: '/singer'
                    })
                }
                getSingerDetail(this.singer.id).then((res) => {
                    if (res.code === ERR_OK) {
                        this.songs = this._formatSong(res.data.list)
                    } else {
                        throw new Error('get singer detail error' + res.code)
                    }
                }).catch((err) => {
                    console.log(err)
                    // doing something
                })
            },
            _formatSong(list) {
                let result = []
                list.forEach((item) => {
                    let {musicData} = item
                    if (musicData.songid && musicData.albummid) {
                        result.push(createSong(musicData))
                    }
                })
                return result
            }
        },
        computed: {
            title() {
                return this.singer.name
            },
            bgImage() {
                return this.singer.avatar
            },
            ...mapGetters(['singer'])
        },
        components: {
            musicList
        }
    }
</script>
<style lang="stylus" scoped>
    @import "~common/styl/variable"
    .slide-enter,.slide-leave-active
        transform translate3d(100%, 0, 0)
</style>