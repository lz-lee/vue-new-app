<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/header/header'
import Tab from 'components/tab/tab'
import player from 'components/player/player'
export default {
  name: 'app',
  components: {
    MHeader,
    Tab,
    player
  }
}
</script>

<style lang="stylus">
  #app 
    color: #FFF
</style>
