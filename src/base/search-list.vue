<template>
	<div class="search-list">
		<transition-group tag="ul" name="list">
			<li v-for="item in searches"
					class="item"
					@click="selectItem(item)"
					:key="item"
					>
				<span class="text">{{item}}</span>
				<span class="icon"
							@click.stop="deleteItem(item)">
					<i class="icon-delete"></i>
				</span>
			</li>
		</transition-group>
	</div>
</template>
<script>
	export default {
		props: {
			searches: {
				type: Array,
				default: []
			}
		},
		methods: {
			selectItem(item) {
				this.$emit('select', item)
			},
			deleteItem(item) {
				this.$emit('delete', item)
			}
		}
	}
</script>
<style lang="stylus" scoped>
	@import "~common/styl/variable"

	.search-list
		.item
			display flex
			align-items center
			height: 40px
			overflow: hidden
			&.list-enter-active,&.list-leave-active
				transition all .2s
			&.list-enter,&.list-leave-to
				height 0
			.text
				flex 1
				color $color-text-l
			.icon
				.icon-delete
					font-size: $font-size-small
					color: $color-text-d
</style>