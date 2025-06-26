#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的TTS服务启动脚本
用于配合自动练习模式的语音朗读功能
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("=" * 50)
    print("🔊 启动 Kokoro TTS 服务")
    print("=" * 50)
    
    # 检查kokoro-tts-zh项目路径
    kokoro_path = Path("/Users/yunboxiong/projects/kokoro-tts-zh")
    
    if not kokoro_path.exists():
        print("❌ 错误：找不到 kokoro-tts-zh 项目")
        print(f"   请确保项目位于：{kokoro_path}")
        return
    
    # 切换到项目目录
    os.chdir(kokoro_path)
    print(f"📁 工作目录：{kokoro_path}")
    
    # 检查是否有虚拟环境
    venv_path = kokoro_path / "venv"
    if venv_path.exists():
        print("✅ 检测到虚拟环境")
        
        # 激活虚拟环境并运行
        if sys.platform == "win32":
            python_exe = venv_path / "Scripts" / "python.exe"
        else:
            python_exe = venv_path / "bin" / "python"
        
        cmd = [str(python_exe), "app.py"]
    else:
        print("⚠️  未检测到虚拟环境，使用系统Python")
        cmd = ["python3", "app.py"]
    
    print("\n🚀 启动TTS服务...")
    print("   服务地址: http://localhost:5000")
    print("   按 Ctrl+C 停止服务\n")
    
    try:
        # 运行服务
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n\n👋 TTS服务已停止")
    except Exception as e:
        print(f"\n❌ 启动失败：{e}")
        print("\n可能的解决方案：")
        print("1. 确保已安装依赖：pip install -r requirements.txt")
        print("2. 确保模型文件存在")
        print("3. 检查端口5000是否被占用")

if __name__ == "__main__":
    main()