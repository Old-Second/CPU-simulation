import express from 'express';
import bodyParser from 'body-parser';
import {getDbPool} from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({path: '.env.local'});

// 设置Express应用程序
const app = express();
app.use(bodyParser.json());
app.use('/api', (req, res, next) => {
  next();
});

// 配置CORS以允许特定域名
const allowedOrigins = process.env.ALLOWED_ORIGINS;
app.use(cors({
  origin: function (origin, callback) {
    // 允许请求没有来源（如移动应用程序或同源请求）
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = '此来源不允许通过CORS';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// 接收登录时间
app.post('/api/login', (req, res) => {
  const {username, userId} = req.body;
  const query = 'INSERT INTO users (username, userId, loginTime, leaveTime) VALUES (?, ?, ?, ?)';
  getDbPool().query(query, [username, userId, new Date(), new Date()], (err) => {
    if (err) {
      console.error('记录登录时间时出错:', err);
      res.status(500).send('服务器错误');
      return;
    }
    res.status(200).send('登录时间已记录');
  });
});

// 设置心跳检测
app.post('/api/heartbeat', (req, res) => {
  const {userId} = req.body;
  const query = 'UPDATE users SET leaveTime = ? WHERE userId = ?';
  getDbPool().query(query, [new Date(), userId], (err) => {
    if (err) {
      console.error('心跳检测时出错:', err);
      res.status(500).send('服务器错误');
      return;
    }
    res.status(200).send('心跳信号已更新');
  });
});

// 启动服务器
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`服务器正在运行在 http://localhost:${PORT}`);
});