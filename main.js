//connect database
const mysql = require('mysql2/promise');

const requiredEnvVars = [
  { key: 'PORT', message: 'Missing community env: PORT' },
  { key: 'DB_HOST', message: 'Missing community env: DB_HOST' },
  { key: 'DB_USER', message: 'Missing community env: DB_USER' },
  { key: 'DB_PW', message: 'Missing community env: DB_PW' },
  { key: 'DB_PORT', message: 'Missing community env: DB_PORT' },
  { key: 'DB_NAME', message: 'Missing community env: DB_NAME' },
];

for (const env of requiredEnvVars) {
  if (!process.env[env.key]) {
    throw new Error(env.message);
  }
}

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

module.exports = pool;  //모듈로 내보내기

// 기본 설정
const port = process.env.PORT,
    express = require("express"),
    cors = require("cors")
    app = express(),
    fs = require("fs"),
    layouts = require("express-ejs-layouts"),
    usersRouter = require('./routes/usersRoute'),
    communityRouter = require('./routes/communityRoute');

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.static("public/"));
app.use('/uploads',express.static("uploads/"));
app.use(layouts);
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

//라우터 등록
app.use('/users', usersRouter);
app.use('/community', communityRouter);


//주기적인 작업 스케줄링
// schedule.scheduleJob('* * * * *', function() { //1분
//     reminderController.sendSMS();
//   });
  
// root - 로그인
app.get(
    "/", (req,res) =>
    {res.render("users/login");}
);



app.listen(port,() => {
  const dir = "./uploads";
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
  console.log("서버 실행 중");
  }
);


async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'cc-db.c32segwywmue.ap-northeast-2.rds.amazonaws.com',
      user: 'admin',
      password: 'admin12345',
      port: 3306,
      database: 'community',
    });

    console.log('✅ DB 연결 성공!');

    // 테스트 쿼리 (예: SHOW TABLES)
    const [rows] = await connection.query('SHOW TABLES');
    console.log('📦 현재 테이블 목록:', rows);

    await connection.end();
  } catch (error) {
    console.error('❌ DB 연결 실패:', error.message);
  }
}

testConnection();

// const spawn = require('child_process').spawn;

// const result = spawn('python', ['graph.py'));

// result.stdout.on('data', function(data) {
//     console.log(data.toString());
// });

// result.stderr.on('data', function(data) {
//     console.log(data.toString());
// });
