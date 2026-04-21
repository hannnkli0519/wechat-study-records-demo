#!/bin/bash

# 1. 获取版本号
echo "请输入本次发布的版本号 (例如 1.0.1): "
read VERSION

if [ -z "$VERSION" ]; then
  echo "❌ 错误: 版本号不能为空"
  exit 1
fi

# 2. 获取备注
echo "请输入发布备注 (例如 修复了XX Bug): "
read DESC

if [ -z "$DESC" ]; then
  DESC="Release v$VERSION"
fi

# 3. 检查密钥文件
if [ ! -f "./private.key" ]; then
  echo "❌ 错误: 未找到 private.key 文件，请先从微信后台下载并放入项目根目录"
  exit 1
fi

# 4. 提取 AppID
APPID=$(grep -o '"appid": "[^"]*"' project.config.json | head -1 | cut -d'"' -f4)
if [ -z "$APPID" ]; then
  echo "❌ 错误: 无法从 project.config.json 中提取 appid"
  exit 1
fi

echo "🚀 开始部署版本 v$VERSION (AppID: $APPID)..."

# 5. 使用 miniprogram-ci 上传代码
# 注意：这里需要先全局安装 npm install -g miniprogram-ci
miniprogram-ci upload \
  --pp ./miniprogram \
  --pkp ./private.key \
  --appid $APPID \
  --uv $VERSION \
  --ud "$DESC" \
  --r 1

if [ $? -eq 0 ]; then
  echo "✅ 微信代码上传成功！"
  
  # 6. Git 操作：打 Tag 并推送
  echo "📦 正在同步 GitHub 标签..."
  git add .
  git commit -m "Release v$VERSION: $DESC"
  git tag -a "v$VERSION" -m "Release version $VERSION: $DESC"
  git push origin main
  git push origin "v$VERSION"
  
  echo "🎉 部署完成！GitHub 标签 v$VERSION 已创建并推送。"
else
  echo "❌ 微信代码上传失败，请检查密钥或网络。"
  exit 1
fi
