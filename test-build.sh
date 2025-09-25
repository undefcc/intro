#!/bin/bash

# 本地测试脚本 - 模拟 GitHub Actions 构建流程
set -e

echo "🚀 开始本地测试构建流程..."

# 清理之前的构建
echo "📦 清理之前的构建产物..."
rm -rf docker-build-context .next

# 安装依赖并构建
echo "📋 安装依赖..."
npm ci

echo "🏗️  构建 Next.js 应用..."
npm run build

# 准备 Docker 构建上下文（模拟 GitHub Actions）
echo "📂 准备 Docker 构建上下文..."
mkdir -p docker-build-context

# 复制 standalone 模式生成的所有运行文件（包括隐藏文件）
shopt -s dotglob  # 启用隐藏文件匹配
cp -r .next/standalone/* docker-build-context/
shopt -u dotglob  # 关闭隐藏文件匹配

# 确保静态资源是最新的（合并而不是覆盖）
cp -r .next/static/* docker-build-context/.next/static/ 2>/dev/null || echo "Warning: No additional static files to copy"

# 复制 public 目录
cp -r public docker-build-context/ 2>/dev/null || echo "Warning: public directory not found"

# 查看目录结构
echo "=== Docker build context structure ==="
ls -la docker-build-context/
echo "=== .next directory ==="
ls -la docker-build-context/.next/ 2>/dev/null || echo "No .next directory"
echo "=== .next/server directory ==="
ls -la docker-build-context/.next/server/ 2>/dev/null || echo "No .next/server directory"

# 构建 Docker 镜像
echo "🐳 构建 Docker 镜像..."
docker build -t web-intro-test -f script/Dockerfile docker-build-context

# 测试运行容器
echo "🧪 测试运行容器..."
CONTAINER_ID=$(docker run -d -p 3001:3000 --name web-intro-test web-intro-test)
echo "容器 ID: $CONTAINER_ID"

# 等待容器启动
echo "⏱️  等待容器启动..."
sleep 3

# 检查容器状态
echo "🔍 检查容器状态..."
docker ps -a --filter "name=web-intro-test"

# 获取容器日志
echo "📜 容器日志："
docker logs web-intro-test

# 检查容器是否还在运行
if docker ps --filter "name=web-intro-test" --filter "status=running" | grep -q web-intro-test; then
    echo "✅ 容器正在运行，测试连接..."
    sleep 2
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 测试成功！应用正常运行"
    else
        echo "⚠️  应用可能还在启动中，请查看日志"
    fi
else
    echo "❌ 容器已退出，检查上方日志了解原因"
fi

# 清理测试容器
echo "🧹 清理测试环境..."
docker stop web-intro-test 2>/dev/null || true
docker rm web-intro-test 2>/dev/null || true
docker rmi web-intro-test 2>/dev/null || true

echo "🎉 本地测试完成！"
