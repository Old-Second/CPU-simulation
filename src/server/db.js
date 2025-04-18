import mysql from 'mysql2';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({path: '.env.local'});

let dbPool;

async function initializeDbPool() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // 创建原始连接来检查/创建数据库
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectTimeout: 10000, // 10秒连接超时
      });

      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // 尝试创建数据库（如果不存在）
      await new Promise((resolve, reject) => {
        connection.query(`CREATE DATABASE IF NOT EXISTS circuit_simulation_platform`, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      // 初始化连接池
      dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'circuit_simulation_platform',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // 测试连接池
      await new Promise((resolve, reject) => {
        dbPool.getConnection((err, connection) => {
          if (err) return reject(err);
          connection.release();
          resolve();
        });
      });

      // 创建用户表
      await new Promise((resolve, reject) => {
        dbPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            userId VARCHAR(255) NOT NULL,
            loginTime DATETIME NOT NULL,
            leaveTime DATETIME NOT NULL
          )
        `, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // 关闭原始连接
      connection.end();
      console.log('数据库连接池初始化成功');
      return;
    } catch (err) {
      retryCount++;
      console.error(`数据库连接尝试 ${retryCount}/${maxRetries} 失败:`, err);
      if (retryCount === maxRetries) {
        console.error('数据库连接失败，已达到最大重试次数');
        throw err;
      }
      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// 添加连接池错误处理
dbPool?.on('error', (err) => {
  console.error('数据库连接池错误:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('数据库连接丢失，尝试重新初始化连接池');
    initializeDbPool().catch(console.error);
  }
});

initializeDbPool().then(() => {
  console.log('数据库连接池初始化完成。');
}).catch(err => {
  console.error('初始化失败:', err);
});

// 导出一个函数来获取dbPool，确保初始化完成后才能访问
export const getDbPool = () => {
  return dbPool;
};