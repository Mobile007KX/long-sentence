#!/usr/bin/env python3
"""
简单的HTTP服务器，用于解决CORS问题
"""

import http.server
import socketserver
import os

PORT = 8080

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

os.chdir('/Users/yunboxiong/projects/long-sentence')

with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
    print(f"🌐 本地服务器启动成功！")
    print(f"📱 访问地址: http://localhost:{PORT}")
    print(f"📁 服务目录: {os.getcwd()}")
    print(f"\n请在浏览器中访问: http://localhost:{PORT}/index.html")
    print("按 Ctrl+C 停止服务")
    httpd.serve_forever()