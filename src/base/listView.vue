<template>
    <scroll class="listview" 
            :data="data"
            :listenScroll="listenScroll"
            :probeType="probeType"
            ref="listview"
            @scroll="scroll"
            >
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li v-for="item in group.items" class="list-group-item">
                        <img class="avatar" v-lazy="item.avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item, index) in shortcutLits" 
                    class="item"
                    :data-index="index"
                    :class="{current: currentIndex === index}">{{item}}</li>
            </ul>
        </div>
        <div class="list-fixed" v-show="fixedTitle" ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div class="loading-content" v-show="!data.length">
            <loading></loading>
        </div>
    </scroll>
</template>
<script>
    import Scroll from 'base/scroll'
    import loading from 'base/loading'
    const ANCHOR_HEIGHT = 18
    const TITLE_HEIGHT = 30

    export default {
        created() {
            // 不需要观测的数据在created里添加
            // 给当前vue组件实例添加一个空对象，用于存touch对象的pageY
            this.touch = {}
            // 触发scroll组件scroll事件
            this.listenScroll = true
        },
        props: {
            data: {
                type: Array,
                default: []
            }
        },
        data() {
            return {
                scrollY: -1,
                currentIndex: 0,
                listHeight: [],
                probeType: 3,
                diff: -1
            }
        },
        watch: {
            data() {
                // 计算高度必须等dom完全渲染完成
                setTimeout(() => {
                    this._calcHeight()
                }, 20)
            },
            // watch scrollY 实时改变currentIndex
            scrollY(newY) {
                // 滚动到顶端
                if (newY > 0) {
                    this.currentIndex = 0
                    return
                }
                // 中间部分
                for (let i = 0; i < this.listHeight.length - 1; i++) {
                    let now = this.listHeight[i]
                    let next = this.listHeight[i + 1]
                    if (!next || (-newY >= now && -newY < next)) {
                        this.currentIndex = i
                        // 差值为 滚过的高度与滚过的group的高度差
                        this.diff = next + newY
                        return
                    }
                }
                // 底部，-newY大于最后一个group（listHeight.length - 2）的高度
                this.currentIndex = this.listHeight.length - 2
            },
            diff(newVal) {
                // 向上偏移为负值
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
                // 缓存fixedTop，每次diff前判断，避免多次dom操作
                if (this.fixedTop === fixedTop) return
                this.fixedTop = fixedTop
                this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
            }
        },
        computed: {
            shortcutLits() {
                return this.data.map((group) => {
                    return group.title.substring(0, 1)
                })
            },
            fixedTitle() {
                if (this.scrollY > 0) return ''
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        methods: {
            onShortcutTouchStart(el) {
                let anchorIndex = el.target.dataset.index
                this.touch.y1 = el.touches[0].pageY
                this.touch.anchorIndex = anchorIndex
                this._scrollTo(anchorIndex)
            },
            onShortcutTouchMove(el) {
                this.touch.y2 = el.touches[0].pageY
                // 获取两次touch的pageY差 除以每个item的高度得到touch过的index差
                let diff = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
                let anchorIndex = Number(this.touch.anchorIndex) + diff
                this._scrollTo(anchorIndex)
            },
            scroll(pos) {
                // 滚动高度为负值
                this.scrollY = pos.y
                // console.log(this.scorllY)
            },
            _scrollTo(index) {
                if (!index && index !== 0) return
                // 处理边界
                if (index < 0) {
                    index = 0
                } else if (index > this.listHeight.length - 2) {
                    index = this.listHeight.length - 2
                }
                // 点击 获取 scrollY的位置
                this.scrollY = -this.listHeight[index]
                // 点击／触摸右侧字母，左侧联动
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
            },
            _calcHeight() {
                let group = this.$refs.listGroup
                let height = 0
                this.listHeight.push(height)
                // height 数组长度比group多1
                group.forEach((item, index) => {
                    height += item.clientHeight
                    this.listHeight.push(height)
                })
            }
        },
        components: {
            Scroll,
            loading
        }
    }
</script>
<style lang="stylus">
    @import "~common/styl/variable"
    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group
            padding-bottom 30px
            .list-group-title
                height 30px
                line-height 30px
                padding-left 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                  width: 50px
                  height: 50px
                  border-radius: 50%
                .name
                  margin-left: 20px
                  color: $color-text-l
                  font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-content
            width 100%  
            position absolute
            top 50%
            transform translateY(-50%)
</style>