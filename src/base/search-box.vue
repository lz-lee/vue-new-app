<template>
	<div class="search-box">
		<i class="icon-search"></i>
		<input class="box"
					 v-model="query"
					 :placeholder="placeholder"
					 ref="query">
		<i class="icon-dismiss"
			 v-show="query"
			 @click="clear"></i>
	</div>
</template>
<script>
import {debounce} from 'common/js/util'
	export default {
		props: {
			placeholder: {
				type: String,
				default: '搜索歌曲、歌手'
			}
		},
		data() {
			return	{
				query: ''
			}
		},
		// created() {
		// 	this.$watch('query', debounce((newVal) => {
		// 		this.$emit('query', newVal)
		// 	}, 300))
		// },
		watch: {
			query: debounce(function(newVal) {
				// 不能使用箭头函数，this不同
				this.$emit('query', newVal)
			}, 300)
		},
		methods: {
			clear() {
				this.query = ''
			},
			setQuery(query) {
				this.query = query
			},
			blur() {
				this.$refs.query.blur()
			}
		}
	}
</script>
<style lang="stylus" scoped>
	@import "~common/styl/variable"

	.search-box
		display flex
		align-items center
		box-sizing border-box
		width 100%
		height: 40px
		padding 0 6px
		background: $color-highlight-background
		border-radius 6px
		.icon-search
			font-size: 24px
			color $color-background
		.box
			flex 1
			margin 0 5px
			line-height 18px
			background: $color-highlight-background
			color $color-text
			font-size: $font-size-medium
			&::placeholder
				color: $color-text-d
		.icon-dismiss
			font-size: 16px
			color: $color-background
</style>