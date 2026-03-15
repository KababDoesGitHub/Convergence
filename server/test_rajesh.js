const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('database.db'); db.get('SELECT * FROM users WHERE username=\'rajesh.sharma\'', (err, row) => console.log(row));
