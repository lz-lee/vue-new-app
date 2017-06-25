import {playMode} from 'common/js/config'
import {loadSearch} from 'common/js/cache'

const state = {
    singer: {},
    playing: false,
    fullscreen: false,
    playlist: [],
    // 随机 单曲循环模式下 playlist与sequencelist不同
    sequencelist: [],
    mode: playMode.sequence,
    currentIndex: -1,
    disc: {},
    topList: {},
    searchHistory: loadSearch()
}
export default state