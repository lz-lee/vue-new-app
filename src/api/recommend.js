import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    })
    return jsonp(url, data, options)
}

export function getDistList() {
    const url = '/api/getDistList'
    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'
    })
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}

// 歌单详情数据抓取
export function getSongList(disstid) {
    const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        g_tk: 67232076,
        platform: 'yqq',
        hostUin: 0,
        onlySong: 0,
        needNewCode: 0
    })
    return jsonp(url, data, options)
}