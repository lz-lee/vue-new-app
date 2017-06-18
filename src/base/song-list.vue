<template>
    <div class="song-list">
        <ul>
            <li v-for="(song, index) in songs" class="item" @click="selectItem(song, index)">
                <div class="rank" v-show="rank">
                    <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
                </div>
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
            },
            rank: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            getDesc(song) {
                return `${song.singer} · ${song.album}`
            },
            selectItem(item, index) {
                this.$emit('select', item, index)
            },
            getRankCls(index) {
                if (index <= 2) {
                    return `icon icon${index}`
                }
            },
            getRankText(index) {
                if (index > 2) {
                    return index + 1
                }
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
            .rank
                flex: 0 0 25px
                width 25px
                margin-right 30px
                text-align center
                .icon
                    display inline-block
                    width 25px
                    height 24px
                    background-size 25px 24px
                    &.icon0
                        bg-image('../common/image/first')
                    &.icon1
                        bg-image('../common/image/second')
                    &.icon2
                        bg-image('../common/image/third')
                .text
                    color $color-theme
                    font-size $font-size-large
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