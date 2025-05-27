FROM node:18.16.0-alpine

# 일반 하이픈(-) 사용
RUN mkdir -p /app

# package.json, package-lock.json 복사
COPY package*.json /app/

# 전체 소스 복사
COPY . /app/

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
RUN npm install

# 앱 시작
CMD ["npm", "start"]
