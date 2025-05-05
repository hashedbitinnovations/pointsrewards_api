const mysql = require('mysql2');

//DEV
module.exports = mysql.createConnection({
    host: '162.241.85.140',
    user: 'codeapzu_jscmsadmin',
    password: 'jscmsadmin2023',
    database: 'codeapzu_jscms'
});
