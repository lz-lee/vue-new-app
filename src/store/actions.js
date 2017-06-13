import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const selectPlay = function({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    // 当点击随机播放全部时，此时list为randomlist，需要多mode判断
    if (state.mode === playMode.random) {
      let randomList = shuffle(list)
      // 修改播放list
      commit(types.SET_PLAYLIST, randomList)
      // 找到顺序列表里的歌曲在randomlist中的index
      index = findIndex(randomList, list[index])
    } else {
      commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
    commit(types.SET_CURRENT_INDEX, index)
}
export const randomPlay = function({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_CURRENT_INDEX, 0)
}

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}