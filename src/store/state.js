import {playMode} from 'common/js/config'

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
    topList: {}
}
export default state