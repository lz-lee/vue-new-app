import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch, savePlay} from 'common/js/cache'

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

export const insertSong = function({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequencelist = state.sequencelist.slice()
  let currentIndex = state.currentIndex

  let currentSong = playlist[currentIndex]
  // 查找待插入歌曲在原有列表中的索引，删除的也是这个索引对应的歌曲
  let fpIndex = findIndex(playlist, song)

  currentIndex++

  playlist.splice(currentIndex, 0, song)

  if (fpIndex > -1) {
    // 插入的歌曲在原有列表中歌曲的后面
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // sequencelist 应该要插入的位置
  let currentSIndex = findIndex(sequencelist, currentSong) + 1
  // 找原有位置
  let fsIndex = findIndex(sequencelist, song)
  // 插入歌曲
  sequencelist.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequencelist.splice(fsIndex, 1)
    } else {
      sequencelist.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_SEQUENCE_LIST, sequencelist)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequencelist = state.sequencelist.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequencelist, song)
  sequencelist.splice(sIndex, 1)

  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequencelist)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  const playingState = playlist.length > 0

  commit(types.SET_PLAYING_STATE, playingState)
}

export const deleteSongList = function({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}