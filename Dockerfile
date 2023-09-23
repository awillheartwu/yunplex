# 使用官方 Node.js 镜像作为基础镜像
FROM node:16

# 设置工作目录为 /app
WORKDIR /app

# 将主项目文件复制到镜像的 /app 目录下
COPY . .

# 设置默认环境变量
ENV DOWNLOAD_DIR /mnt/nas
ENV PHONE ""
ENV PASSWORD ""
ENV PLAYLIST ""
ENV PLEX_SERVER ""
ENV PLEX_PORT ""
ENV PLEX_TOKEN ""

# 暴露应用程序需要的端口
EXPOSE 4396

# 启动应用程序
CMD ["npm", "start"]