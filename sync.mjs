'use strict';

import fetch from 'node-fetch'
import plex from 'plex-api'
import Datastore from '@seald-io/nedb'
import path from 'path'
import fs from 'fs'
const db = new Datastore({ filename: './music.db', autoload: true });
// 读取本地的 config.json
const __dirname = path.resolve()
const config = fs.readFileSync(path.resolve(__dirname, './config.json'), 'utf-8')
const configJson = JSON.parse(config)

async function loginYun(phone, password) {
  try {
    const login = await fetch(`http://localhost:3000/login/cellphone?phone=${phone}&password=${password}`)
    const body = await login.json()
    return body.cookie
  } catch (error) {
    console.log(error)
  }
}

async function setupDB() {
  try {
    // 首先 load 数据库
    await db.loadDatabaseAsync()
    // 查看数据库中是否有用户信息
    const user = await db.findAsync({ type: 'user' })
    // 如果没有用户信息，则需要登录
    if (user.length === 0) {
      const cookie = await loginYun(configJson.phone, configJson.password)
      // 将用户信息存入数据库
      await db.insertAsync({ type: 'user', cookie })
    }
    // 查看数据库中是否有歌单信息
    const playlist = await db.findAsync({ type: 'playlist' })
    // 如果没有歌单信息，则需要同步歌单
    if (playlist.length === 0) {
      const playlists = await fetch(`http://localhost:3000/user/playlist?uid=${user[0].uid}&limit=50`)
      const playlistsBody = await playlists.json()
      const playlistNames = playlistsBody.playlist.map(item => item.name)
      // 将歌单信息存入数据库
      await db.insertAsync({ type: 'playlist', playlistNames })
    }
    // 查看数据库中是否有歌曲信息
    const song = await db.findAsync({ type: 'song' })
    // 如果没有歌曲信息，则需要同步歌曲
    if (song.length === 0) {
      const playlistDetail = await fetch(`http://localhost:3000/playlist/detail?id=${playlist[0].playlistId}`)
      const playlistDetailBody = await playlistDetail.json()
      //循环获取歌单中的歌曲详细信息,每次 500 个,每个请求之后延迟 5s
      let songNamesBodySongs = []
      for (let i = 0; i < Math.ceil(playlistDetailBody.playlist.trackIds.length / 50) +1; i++) {
        const playlistDetailSongs = playlistDetailBody.playlist.trackIds.slice(i * 50, (i + 1) * 50).map(item => item.id).join(',')
        const songNames = await fetch(`http://music.163.com/api/song/detail/?id=&ids=[${playlistDetailSongs}]`)
        const songNamesBody = await songNames.json()
        songNamesBodySongs = songNamesBodySongs.concat(songNamesBody.songs)
        // 每次请求之后延迟 5s
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 500)
        })
      }

      // 将歌曲信息存入数据库
      await db.insertAsync({ type: 'song', songNamesBodySongs })
    }
  } catch (error) {
    console.log(error)
  }
}

async function main() {
  try {
    // 首先 load 数据库
    await db.loadDatabaseAsync()

    console.log('♿️ - file: sync.mjs:25 - main - config:', config);
    // const playlists = await fetch('http://localhost:3000/user/playlist?uid=51762210&limit=50')
    // const playlistsBody = await playlists.json()8478023183
    // const playlistNames = playlistsBody.playlist.map(item => item.name)
    // console.log('♿️ - file: sync.mjs:20 - main - playlistNames:', playlistNames);
    // console.log('♿️ - file: sync.mjs:16 - main - playlistsBody:', playlistsBody.playlist[0].id, playlistsBody.playlist[1].id);
    const playlistDetail = await fetch('http://localhost:3000/playlist/detail?id=49061121')
    const playlistDetailBody = await playlistDetail.json()
    console.log('♿️ - file: sync.mjs:91 - main - playlistDetailBody.playlist.trackIds.length :', playlistDetailBody.playlist.trackIds.length );
    //循环获取歌单中的歌曲详细信息,每次 50 个,每个请求之后延迟 50ms
    let songNamesBodySongs = []
    for (let i = 0; i < Math.ceil(playlistDetailBody.playlist.trackIds.length / 50) +1; i++) {
      const playlistDetailSongs = playlistDetailBody.playlist.trackIds.slice(i * 50, (i + 1) * 50).map(item => item.id).join(',')
      const songNames = await fetch(`http://music.163.com/api/song/detail/?id=&ids=[${playlistDetailSongs}]`)
      const songNamesBody = await songNames.json()
      songNamesBodySongs = songNamesBodySongs.concat(songNamesBody.songs)
      // 每次请求之后延迟 5s
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    }
    console.log('♿️ - file: sync.mjs:32 - main - songNamesBodySongs:', songNamesBodySongs.length);


    const client = new plex({
      hostname: 'loicawu.synology.me',
      port: 5003,
      token: 'LPXsVuAyvDyrGsKHp8kD',
      options: {
        identifier: 'com.plexapp.plugins.library',
        product: 'Plex Web',
        version: '3.0.1',
        deviceName: 'Plex Web (Chrome)',
        platform: 'Chrome',
        platformVersion: '37.0',
        device: 'Windows'
      }
    })
    /* 查找同名歌单 */
    const playlist = await client.query('/playlists')
    // console.log('♿️ - file: sync.mjs:50 - main - playlist:', playlist.MediaContainer.Metadata);
    const syncList = await client.query('/playlists/33389/items')
    const titles = syncList.MediaContainer.Metadata.map(item => item.title)
    console.log('♿️ - file: sync.mjs:61 - main - titles:', titles.length);

  } catch (error) {
    console.log(error)
  }
}
await main()