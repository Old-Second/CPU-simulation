import mysql from 'mysql2';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({path: '.env.local'});

// 连接到MySQL数据库
const dbPool = mysql.createPool({
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
dbPool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    loginTime DATETIME NOT NULL,
    leaveTime DATETIME NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('创建用户表时出错:', err);
  }
});

export default dbPool;