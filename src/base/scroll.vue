<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>
<script>
    import BScroll from 'better-scroll'
    export default {
        props: {
            probeType: {
                type: Number,
                // 默认1 为截流
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            },
            listenScroll: {
                type: Boolean,
                default: false
            }
        },
        mounted() {
            setTimeout(() => {
                this._initScroll()
            }, 20)
        },
        methods: {
            _initScroll() {
                if (!this.$refs.wrapper) return
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click
                })
                if (this.listenScroll) {
                    // let that = this
                    this.scroll.on('scroll', (pos) => {
                        this.$emit('scroll', pos)
                    })
                }
            },
            enable() {
                this.scroll && this.scroll.enable()
            },
            disable() {
                this.scroll && this.scroll.disable()
            },
            refresh() {
                this.scroll && this.scroll.refresh()
            },
            scrollToElement() {
                // 用apply将scrollToElement的参数传入scorll实例
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            },
            scrollTo() {
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            }
        },
        watch: {
            data() {
                setTimeout(() => {
                    this.refresh()
                }, 20)
            }
        }
    }
</script>
<style lang="stylus">
    
</style>