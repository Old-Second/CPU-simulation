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
  // 首先，找出该用户最新的登录记录的loginTime
  const getMaxLoginTimeQuery = `
    SELECT MAX(loginTime) AS maxLoginTime
    FROM users
    WHERE userId = ?
  `;

  getDbPool().query(getMaxLoginTimeQuery, [userId], (err, maxLoginTimeResult) => {
    if (err) {
      console.error('查询最大登录时间时出错:', err);
      res.status(500).send('服务器错误');
      return;
    }

    const maxLoginTime = maxLoginTimeResult[0].maxLoginTime;
    if (maxLoginTime !== null) {
      // 使用找到的最大loginTime来更新对应的leaveTime
      const updateLeaveTimeQuery = `
        UPDATE users
        SET leaveTime = ?
        WHERE userId = ? AND loginTime = ?
      `;
      getDbPool().query(updateLeaveTimeQuery, [new Date(), userId, maxLoginTime], (err, updateResult) => {
        if (err) {
          console.error('心跳检测时出错:', err);
          res.status(500).send('服务器错误');
          return;
        }

        if (updateResult.affectedRows > 0) { // 修改这里，使用updateResult而非updateErr
          res.status(200).send('心跳信号已更新');
        } else {
          // 如果没有记录被更新，可能是因为没有找到对应的登录记录
          res.status(404).send('没有找到匹配的登录记录进行更新');
        }
      });
    } else {
      // 如果用户没有任何登录记录
      res.status(404).send('用户没有登录记录');
    }
  });
});

// 启动服务器
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`服务器正在运行在 http://localhost:${PORT}`);
});