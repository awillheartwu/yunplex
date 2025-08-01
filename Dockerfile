# 使用官方 Node.js 镜像作为基础镜像
FROM node:16-alpine

# 安装 flac 工具（包含 metaflac 命令）
RUN apk add --no-cache flac

# 设置工作目录为 /app
WORKDIR /app

# 将主项目文件复制到镜像的 /app 目录下
COPY . .

# 环境变量建议写成 ENV 块，方便维护
ENV SCAN_INTERVAL=30 \
    SONG_LIMIT=10 \
    DOWNLOAD_DIR=/mnt/nas \
    PLAYLIST="" \
    PLEX_SERVER="" \
    PLEX_PORT="" \
    PLEX_TOKEN="" \
    PLEX_SECTION="" \
    YUN_COOKIE="" \
    LEVEL="超清母带"

# 启动应用程序
CMD ["npm", "start"]
