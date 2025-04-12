const mysql = require("mysql2/promise");



const access = {
  database: 'my_database',
  host: '100.118.162.109',
  port: '3306',
  user: 'my_user',
  password: 'mypassword',
};

const pool = mysql.createPool(access);

module.exports=pool;