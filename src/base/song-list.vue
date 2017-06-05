<template>
    <div class="song-list">
        <ul>
            <li v-for="(song, index) in songs" class="item" @click="selectItem(song, index)">
                <div class="content">
                    <h2 class="name">{{song.name}}</h2>
                    <div class="desc">{{getDesc(song)}}</div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
    export default {
        props: {
            songs: {
                type: Array,
                default: []
            }
        },
        methods: {
            getDesc(song) {
                return `${song.singer} · ${song.album}`
            },
            selectItem(item, index) {
                this.$emit('select', item, index)
            }
        }
    }
</script>
<style lang="stylus">
    @import "~common/styl/variable"
    @import "~common/styl/mixin"
    .song-list
        .item
            display flex
            align-items: center
            box-sizing: border-box
            height: 64px
            font-size: $font-size-medium
            .content
                lex: 1
                line-height: 20px
                overflow: hidden
                .name
                    no-wrap()
                    color: $color-text
                .desc
                    no-wrap()
                    margin-top: 4px
                    color: $color-text-d
</style>