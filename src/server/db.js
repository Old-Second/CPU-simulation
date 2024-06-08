import mysql from 'mysql2';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({path: '.env.local'});

let dbPool;

async function initializeDbPool() {
  // 创建原始连接来检查/创建数据库
  const connection = mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  });

  try {
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
      connectionLimit: 10, // 连接池中最大连接数量
      queueLimit: 0
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
  } catch (err) {
    console.error('初始化数据库连接池时出错:', err);
  }
}

initializeDbPool().then(() => {
  console.log('数据库连接池初始化完成。');
}).catch(err => {
  console.error('初始化失败:', err);
});

// 导出一个函数来获取dbPool，确保初始化完成后才能访问
export const getDbPool = () => {
  return dbPool;
};