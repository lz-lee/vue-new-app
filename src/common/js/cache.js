import storage from 'good-storage'

const SEARCH_KEY = '__search__'

const MAX_LENGTH = 15

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