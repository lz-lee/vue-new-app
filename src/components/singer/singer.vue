<template>
    <div ref="singer" class="singer">
        <listview :data="singers" @select="selectSinger"></listview>
        <router-view></router-view>
    </div>
</template>
<script>
    import {getSingerList} from 'api/singer'
    import {ERR_OK} from 'api/config'
    import Singer from 'common/js/singer'
    import listview from 'base/listview'

    const HOT_LEN = 10
    const HOT_NAME = '热门'

    export default {
        data() {
            return {
                singers: []
            }
        },
        created() {
            this._getSingerList()
        },
        methods: {
            selectSinger(item) {
                this.$router.push({
                    path: `/singer/${item.id}`
                })
            },
            _getSingerList() {
                getSingerList().then((res) => {
                    if (res.code === ERR_OK) {
                        this.singers = this._formatSingerList(res.data.list)
                    } else {
                        throw new Error('get singer list error' + res.code)
                    }
                }).catch((err) => {
                    console.log(err)
                    // do something
                })
            },
            _formatSingerList(list) {
                let result = {
                    hot: {
                        title: HOT_NAME,
                        items: []
                    }
                }
                list.forEach((item, index) => {
                    if (index < HOT_LEN) {
                        result.hot.items.push(new Singer({
                            id: item.Fsinger_mid,
                            name: item.Fsinger_name
                        }))
                    }
                    let key = item.Findex
                    if (!result[key]) {
                        result[key] = {
                            title: key,
                            items: []
                        }
                    }
                    // 用对象的key来归类
                    result[key].items.push(new Singer({
                        id: item.Fsinger_mid,
                        name: item.Fsinger_name
                    }))
                })
                let ret = []
                let hot = []
                for (let key in result) {
                    let val = result[key]
                    if (val.title.match(/[a-zA-Z]/)) {
                        ret.push(val)
                    } else if (val.title === HOT_NAME) {
                        hot.push(val)
                    }
                }
                // 排序
                ret.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                return hot.concat(ret)
            }
        },
        components: {
            listview
        }
    }
</script>
<style lang="stylus" scoped>
    .singer
        position fixed
        top 88px
        width 100%
        bottom 0
</style>