// Load environment variables
require('dotenv').config({ path: './config/database.env' });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const layouts = require('express-ejs-layouts');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const communityRouter = require('./routes/communityRoute');

const app = express();
const port = 3000;

// DB 연결 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  insecureAuth: true,
  charset: 'utf8mb4'
});

module.exports = pool;

// Express 미들웨어 설정
app.set('view engine', 'ejs');
app.use(express.static('public/'));
app.use('/uploads', express.static('uploads/'));
app.use(layouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// 커뮤니티 라우터만 등록
app.use('/community', communityRouter);

// 기본 페이지
app.get('/', (req, res) => {
  res.render('users/login.ejs');
});

// uploads 폴더 생성 및 서버 실행
app.listen(port, () => {
  const dir = './uploads';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  console.log(`서버 실행 중 (포트: ${port})`);
});
