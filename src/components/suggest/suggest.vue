<template>
	<scroll class="suggest"
					:data="result"
					:pull-up="pullUp"
					@scrollToEnd="searchMore"
					ref="suggest">
		<ul class="suggest-list">
			<li class="suggest-item"
					v-for="item in result"
					@click="selectItem(item)">
				<div class="icon">
					<i :class="getItemCls(item)"></i>
				</div>
				<div class="name">
					<p class="text" v-html="getItemName(item)"></p>
				</div>
			</li>
			<loading v-show="hasMore"></loading>
		</ul>
		<div class="no-result-wrapper"
				 v-show="!result.length && !hasMore">
			<no-result title="抱歉，暂无搜索结果"></no-result>
		</div>
	</scroll>
</template>
<script type="text/javascript">
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'

import scroll from 'base/scroll'
import loading from 'base/loading'

import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'

import noResult from 'base/no-result'
// 区分item样式
const TYPE_SINGER = 'singer'
const perpage = 20
	export default {
		props: {
			query: {
				type: String,
				default: ''
			},
			showSinger: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				page: 1,
				result: [],
				pullUp: true,
				hasMore: true
			}
		},
		watch: {
			query() {
				this.search()
			}
		},
		methods: {
			search() {
				this.page = 1
				this.hasMore = true
				this.$refs.suggest.scrollTo(0, 0)
				search(this.query, this.page, this.showSinger, perpage).then((res) => {
					if (res.code === ERR_OK) {
						this.result = this._normalize(res.data)
						this._checkMore(res.data)
					}
				})
			},
			searchMore() {
				if (!this.hasMore) return
				this.page++
				search(this.query, this.page, this.showSinger, perpage).then((res) => {
					if (res.code === ERR_OK) {
						this.result = this.result.concat(this._normalize(res.data))
						this._checkMore(res.data)
					}
				})
			},
			getItemCls(item) {
				return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
			},
			getItemName(item) {
				return item.type === TYPE_SINGER ? item.singername : `${item.name}-${item.singer}`
			},
			selectItem(item) {
				if (item.type === TYPE_SINGER) {
					const singer = new Singer({
						id: item.singermid,
						name: item.singername
					})
					this.$router.push({
						path: `/search/${singer.id}`
					})
					this.set_singer(singer)
				} else {
					this.insertSong(item)
				}
			},
			...mapMutations({
          set_singer: 'SET_SINGER'
      }),
			...mapActions([
				'insertSong'
			]),
			_normalize(data) {
				let ret = []
				if (data.zhida && data.zhida.singerid) {
					ret.push({...data.zhida, ...{type: TYPE_SINGER}})
				}
				if (data.song) {
					ret = ret.concat(this._normalizeSong(data.song.list))
				}
				return ret
			},
			_normalizeSong(list) {
				let ret = []
				list.forEach((item) => {
					if (item.songid && item.albumid) {
						ret.push(createSong(item))
					}
				})
				return ret
			},
			_checkMore(data) {
				const song = data.song
				if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
					this.hasMore = false
				}
			}
		},
		components: {
			scroll,
			loading,
			noResult
		}
	}
</script>
<style lang="stylus" scoped>
	@import "~common/styl/variable"
	@import "~common/styl/mixin"
	
	.suggest
		height: 100%
		overflow hidden
		.suggest-list
			padding 0 30px
			.suggest-item
				display flex
				align-items center
				padding-bottom 20px
			.icon
				flex: 0 0 30px
				width: 30px
				[class^="icon-"]
					font-size: 14px
					color $color-text-d
			.name
				flex 1
				font-size:  $font-size-medium
				color $color-text-d
				overflow hidden
				.text
					no-wrap()
		.no-result-wrapper
			position absolute
			width: 100%
			top 50%
			transform translateY(-50%)
</style>