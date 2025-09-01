// tables/createTables.js
import pool from '../config/dbConfig.js';

export async function createTable() {
  pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(100) PRIMARY KEY,
      name VARCHAR(30) NOT NULL,
      surname VARCHAR(30) NOT NULL,
      password VARCHAR(255) NOT NULL,
      profile_picture VARCHAR(255),
      role ENUM('user','admin') DEFAULT 'user',
      status ENUM('active','blocked','deleted') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    (error) => {
      if (error) console.log("Failed to create users table.", error.message);
      else console.log("Users table created.");
    }
  );

  pool.query(
    `CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100),
      content TEXT NOT NULL,
      privacy ENUM('public','private') NOT NULL DEFAULT 'public',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE
    )`,
    (error) => {
      if (error) console.log("Failed to create posts table.", error.message);
      else console.log("Posts table created.");
    }
  );
}
