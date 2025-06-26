#!/bin/bash
# 启动TTS服务的快捷脚本

echo "🚀 启动 Kokoro TTS 服务..."
cd /Users/yunboxiong/projects/kokoro-tts-zh

# 检查虚拟环境
if [ -d "venv" ]; then
    echo "✅ 使用虚拟环境"
    source venv/bin/activate
else
    echo "⚠️  未找到虚拟环境，使用系统Python"
fi

# 启动服务
echo "📡 服务地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务"
python app.py