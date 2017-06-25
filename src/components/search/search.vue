<template>
    <div class="search">
    	<div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onQueryChange"></search-box>
    	</div>
    	<div class="shortcut-wrapper" v-show="!query">
    		<div class="shortcut">
    			<div class="hot-key">
    				<h1 class="title">热门搜索</h1>
    				<ul>
    					<li v-for="item in hotKey"
    							class="item"
    							@click="addQuery(item.k)">
    						<span>
    							{{item.k}}
    						</span>
    					</li>
    				</ul>
    			</div>
					<div class="search-history" v-show="searchHistory.length">
						<h1 class="title">
							<span class="text">搜索历史</span>
							<span class="clear" @click="clearSearchHistory">
								<i class="icon-clear"></i>
							</span>
						</h1>
						<search-list :searches="searchHistory"
													@select="addQuery"
													@delete="deleteSearchHistory"></search-list>
					</div>
    		</div>
    	</div>
    	<div class="search-reuslt" v-show="query">
    		<suggest :query="query" 
    						 @listScroll="blurInput"
    						 @select="saveSearch"></suggest>
    	</div>
    	<router-view></router-view>
    </div>
</template>
<script>
	import searchBox from 'base/search-box'
	import {getHotKey} from 'api/search'
	import {ERR_OK} from 'api/config'
	import suggest from 'components/suggest/suggest'
	import searchList from 'base/search-list'
	import {mapActions, mapGetters} from 'vuex'

	export default {
		data() {
			return {
				hotKey: [],
				query: ''
			}
		},
		created() {
			this._getHotKey()
		},
		methods: {
			addQuery(query) {
				this.$refs.searchBox.setQuery(query)
			},
			onQueryChange(query) {
				this.query = query
			},
			blurInput() {
				this.$refs.searchBox.blur()
			},
			saveSearch() {
				this.saveSearchHistory(this.query)
			},
			...mapActions([
				'saveSearchHistory',
				'deleteSearchHistory',
				'clearSearchHistory'
				]),
			_getHotKey() {
				getHotKey().then((res) => {
					if (res.code === ERR_OK) {
						this.hotKey = res.data.hotkey.slice(0, 10)
					}
				})
			}
		},
		computed: {
			...mapGetters([
				'searchHistory'
				])
		},
		components: {
			searchBox,
			suggest,
			searchList
		}
	}
</script>
<style lang="stylus" scoped>
    @import "~common/styl/variable"
    @import "~common/styl/mixin"
    .search
    	.search-box-wrapper
    		margin: 20px
    	.shortcut-wrapper
    		position fixed
    		top 178px
    		bottom 0
    		width: 100%
    		.shortcut
    			height: 100%
    			overflow hidden
    			.hot-key
    				margin 0 20px 20px 20px 
    				.title
    					margin-bottom: 20px
    					color: $color-text-l
    					font-size: $font-size-medium
    				.item
    					display inline-block
    					padding 5px 10px
    					margin 0 20px 10px 0
    					border-radius 6px
    					background: $color-highlight-background
    					font-size: $font-size-medium
    					color: $color-text-d
    			.search-history
    				position relative
    				margin 0 20px
    				.title
    					display flex
    					align-items center
    					height 40px
    					font-size: $font-size-medium
    					color color $color-text-l
    					.text
    						flex: 1
    					.clear
    						.icon-clear
    							font-size: $font-size-medium
    							color color $color-text-d
    	.search-reuslt
    		position fixed
    		width: 100%
    		top 178px
    		bottom 0
</style>