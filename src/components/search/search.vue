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
    		</div>
    	</div>
    	<div class="search-reuslt" v-show="query">
    		<suggest :query="query"></suggest>
    	</div>
    </div>
</template>
<script>
	import searchBox from 'base/search-box'
	import {getHotKey} from 'api/search'
	import {ERR_OK} from 'api/config'
	import suggest from 'components/suggest/suggest'

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
			_getHotKey() {
				getHotKey().then((res) => {
					if (res.code === ERR_OK) {
						this.hotKey = res.data.hotkey.slice(0, 10)
					}
				})
			}
		},
		components: {
			searchBox,
			suggest
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
    	.search-reuslt
    		position fixed
    		width: 100%
    		top 178px
    		bottom 0
</style>