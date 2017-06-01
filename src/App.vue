<template>
  <div id="app">
    <m-header></m-header>
    <Tab></Tab>
    <router-view></router-view>
  </div>
</template>

<script>
import MHeader from 'components/header/header'
import Tab from 'components/tab/tab'
export default {
  name: 'app',
  components: {
    MHeader,
    Tab
  }
}
</script>

<style lang="stylus">
  #app 
    color: #FFF
</style>
