# yunplex

一个用来同步plex歌曲资料库和网易云歌单的工具

## 实现思路

30分钟（可以通过环境变量改变）轮询一次，将你要对比的网易云歌单的前N首（默认10首，可以通过环境变量修改）和Plex的同名歌单的前N首歌进行对比

如果网易云有Plex歌单中没有的歌曲，那么就下载这首歌的最高音质版本（如果登陆的网易云账号不是vip，那就是320kps，如果是vip，那就是无损）到Plex的音乐文件夹（需要添加到环境变量）中

然后刷新Plex的音乐资料库，并把新导入的歌曲按顺序加入到同名歌单的最上面

## 环境要求

需要 拥有可以访问的已经启动的 Plex Media Server

__需要__ Plex Media Server 的音乐资料库中有一个和网易云同名的歌单

__需要__ Plex 的这个歌单中至少有一首歌！！！！！（否则会报错）

需要可以访问 Plex 音乐资源文件夹的权限

需要 Node.js v16 或更高版本(Docker版本不需要)

## 安装

```bash
$ git clone https://github.com/awillheartwu/yunplex.git
$ cd yunplex
$ npm install # 或者使用 yarn cnpm pnpm 随你的大小便
```

## 使用方法

### 本地部署版本

```bash
$ node sync.mjs # 可以添加第二个参数，代表要同步的网易云歌单的id，不添加的话会询问
```

初次调用会询问
1. 请输入登录网易云的手机号:
2. 请输入登录网易云的密码:
3. 请输入Plex的地址:
4. 请输入Plex的端口:
5. 请输入Plex的token:
6. _（如果没有输入第二个参数）_ 请输入要同步的网易云歌单的id: 

输入后会打印plex和网易云的歌单列表，选择要同步的歌单的序号，回车即可开始同步

之后服务会一直轮询，每隔30分钟会自动同步一次
_（如果是第二次打开，可以直接用`node sync.mjs xxx &`这样使之一直在后台运行）_

### Docker版本（推荐）

```bash
$ # docker build -t yunplex . 最新版本已经上传到docker hub，可以直接拉取
$ docker pull neverlosewu/yunplex:v1.0
$ docker run -d --name yunplex yunplex  \
    -e SCAN_INTERVAL=30 \ # 轮询间隔，单位分钟 
    -e SONG_LIMIT=10 \ # 对比歌单的歌曲数量
    -e DOWNLOAD_DIR=/mnt/nas \ # 下载歌曲到docker内部的目录
    -e PHONE=your_phone \ # 网易云账号
    -e PASSWORD=your_password \ # 网易云密码
    -e PLAYLIST=your_playlist \ # 要同步的网易云歌单id
    -e PLEX_SERVER=your_plex_server \ # Plex服务器地址
    -e PLEX_PORT=your_plex_port \ # Plex服务器端口
    -e PLEX_TOKEN=your_plex_token \ # Plex服务器token
    -v /mnt/nas:/mnt/nas \ # 冒号前面是宿主机的目录（也就是你plex音乐库的目录），冒号后面是docker内部的目录
```

## TODO

  - [ ] 支持QQ音乐
  - [ ] 判断新添加的歌曲是否已经在Plex的音乐库中，如果在就不下载，而是直接添加到歌单中
  - [ ] 支持修改下载后的目录格式（歌手/专辑.年份/序号 - 歌名.格式）
  - [ ] 歌词把翻译和原文都放到同一个文件中
  - [ ] 搜索歌曲时，按照歌名歌手置信区间判断，如果置信区间太低，就不下载
  - [ ] WEBUI
  - [ ] 优化代码
  - [ ] 优化日志
  - [ ] 优化下载逻辑
  - [ ] 优化同步逻辑

## 贡献和灵感

感谢以下项目的作者们，本项目的实现离不开他们的贡献和灵感

1. [Plex Media Server API](https://github.com/phillipj/node-plex-api)
2. [网易云音乐 NodeJS 版 API](https://github.com/Binaryify/NeteaseCloudMusicApi)
3. [plex导入网易云音乐或QQ音乐歌单的工具](https://github.com/timmy0209/PLEX-import-musiclist)

如果你有任何问题或者建议，欢迎提issue或者pr

## License

在GPL许可证下发布。更多信息见  `LICENSE` 。

## 联系方式

我的邮箱 [gmail](neverlosewu@gmail.com) - neverlosewu@gmail.com

更多我的项目: [https://github.com/awillheartwu](https://github.com/awillheartwu)
