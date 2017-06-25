<template>
	<div class="no-result">
		<div class="no-result-icon"></div>
		<p class="no-result-text">{{title}}</p>
	</div>
</template>
<script>
	export default {
		props: {
			title: {
				type: String,
				default: ''
			}
		}
	}
</script>
<style lang="stylus">
	@import "~common/styl/variable"
	@import "~common/styl/mixin"
	.no-result
		text-align center
		.no-result-icon
			width: 86px
			height 90px
			margin 0 auto
			bg-image('../common/image/no-result')
			background-size cover
			margin-bottom: 20px
		.no-result-text
			margin-bottom: 30px
			font-size: $font-size-medium
			color $color-text-d
</style>