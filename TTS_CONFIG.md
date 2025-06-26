# Kokoro TTS 配置说明

## 端口配置
- 默认端口：5050（避免与macOS AirPlay冲突）
- 备用端口：5001, 5005, 8088

## macOS用户注意事项
macOS Monterey及以上版本，AirPlay Receiver默认占用5000端口。

解决方案：
1. 使用其他端口（推荐5050）
2. 关闭AirPlay Receiver：
   - 系统设置 → 通用 → 隔空投送与接力 → 关闭"隔空播放接收器"

## 快速启动
```bash
# 使用便捷脚本
./start-kokoro-tts.sh

# 或手动启动
cd /Users/yunboxiong/projects/kokoro-tts-zh
source venv/bin/activate
python app.py
```

## API端点
- 主页：http://localhost:5050
- TTS生成：http://localhost:5050/api/tts
- 服务状态：http://localhost:5050/api/status

## 测试TTS
```bash
# 测试服务是否正常
curl http://localhost:5050/api/status

# 生成语音测试
curl -X POST http://localhost:5050/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，欢迎使用Kokoro语音合成", "voice": "zf_shishan"}'
```