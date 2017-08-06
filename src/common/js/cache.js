import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favoriteList__'
const FAVORITE_MAX_LENGTH = 200

// 将query值插入至arr，最新搜索结果总是在最前面
function insertArr(arr, val, compare, maxlen) {
	const index = arr.findIndex(compare)

	if (index === 0) {
		return
	}

	// 如果有，删除后插入，没有index则直接插入
	if (index > 0) {
		arr.splice(index, 1)
	}
	arr.unshift(val)
	// 插入后的判断
	if (maxlen && arr.length > maxlen) {
		arr.pop()
	}
}

function deleteFromArr(arr, compare) {
	const index = arr.findIndex(compare)

	if (index > -1) {
		arr.splice(index, 1)
	}
}

export function saveSearch(query) {
	let searches = storage.get(SEARCH_KEY, [])
	insertArr(searches, query, (item) => {
		return item === query
	}, MAX_LENGTH)
	storage.set(SEARCH_KEY, searches)
	return searches
}

export function loadSearch() {
	return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query) {
	let searches = storage.get(SEARCH_KEY, [])
	deleteFromArr(searches, (item) => {
		return item === query
	})
	storage.set(SEARCH_KEY, searches)
	return searches
}

export function clearSearch() {
	storage.remove(SEARCH_KEY)
	return []
}

export function savePlay(song) {
	let songs = storage.get(PLAY_KEY, [])
	insertArr(songs, song, (item) => {
		return item.id === song.id
	}, PLAY_MAX_LENGTH)
	storage.set(PLAY_KEY, songs)
	return songs
}

export function loadPlay() {
	return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {
	let songs = storage.get(FAVORITE_KEY, [])
	insertArr(songs, song, (item) => {
		return songs.id === item.id
	}, FAVORITE_MAX_LENGTH)
	storage.set(FAVORITE_KEY, songs)
	return songs
}

export function deleteFavorite(song) {
	let songs = storage.get(FAVORITE_KEY, [])
	deleteFromArr(songs, (item) => {
		return item.id === song.id
	})
	storage.set(FAVORITE_KEY, songs)
	return songs
}

export function loadFavorite() {
	return storage.get(FAVORITE_KEY, [])
}