#!/bin/bash
# 启动Kokoro TTS服务

echo "🚀 启动 Kokoro TTS 服务..."
echo "================================"

# 进入项目目录
cd /Users/yunboxiong/projects/kokoro-tts-zh

# 检查并激活虚拟环境
if [ -d "venv" ]; then
    echo "✅ 激活虚拟环境..."
    source venv/bin/activate
else
    echo "⚠️  未找到虚拟环境，使用系统Python"
fi

# 检查端口占用
if lsof -Pi :5050 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 5050 已被占用，尝试关闭..."
    lsof -ti:5050 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动服务
echo ""
echo "📡 服务地址: http://localhost:5050"
echo "📡 API文档: http://localhost:5050/api/docs"
echo ""
echo "🎤 可用音色："
echo "   女声: 诗珊、小芳、小玲"
echo "   男声: 浩子、小宇"
echo ""
echo "按 Ctrl+C 停止服务"
echo "================================"

# 启动Flask应用
python app.py