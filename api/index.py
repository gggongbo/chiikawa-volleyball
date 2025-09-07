import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory, redirect, Blueprint
import logging # 로깅 추가

# .env 파일로부터 환경 변수 로드
load_dotenv()

# 환경변수 세팅
BE_ENV = os.getenv('BE_ENV', 'local').lower()
IS_BE_LOCAL = BE_ENV == 'local'

# --- Logging Setup ---
logging.basicConfig(level= logging.DEBUG if IS_BE_LOCAL else logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Flask 앱 초기화
app = Flask(__name__)
# Set maximum content length to 1MB (to account for multiple images)
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024

# API url prefix 설정
api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/')
def root():
    return jsonify({"message": "api test"})

@api.route('/hello')
def hello():
    return jsonify({"message": "hello test"})

## api prefix 등록 (라우트 정의 이후에 등록해야 함)
app.register_blueprint(api)    

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(debug=True, host='0.0.0.0', port=port) 