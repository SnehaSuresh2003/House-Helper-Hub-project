const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'userdeatils'
});
app.use(express.static(__dirname));


app.post('/register', (req, res) => {
    const { userType,  emailid, firstname, lastname, phonenumber, adharnumber, password, confirmpassword } = req.body;

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error('Error hashing password:', hashErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        // Check the length of the email before inserting
if ( emailid.length > 50) {
  return res.status(400).json({ error: 'Email is too long' });
}



console.log('User Type:', userType);
const tableName = userType === 'serviceseekers' ? 'serviceseekers' : 'serviceprovider';
console.log('Table Name:', tableName);
const sqlQuery = `INSERT INTO ${tableName} (emailid, firstname, lastname, phonenumber, adharnumber, password, confirmpassword) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
          sqlQuery,
            [emailid, firstname, lastname, phonenumber, adharnumber, hashedPassword, confirmpassword],
            (insertErr,results) => {
                if (insertErr) {
                    console.error('Error inserting user into MySQL:', insertErr);
                    res.status(500).json({ error: 'Internal Server Error' });
                }  else {
                  console.log('Inserted into MySQL:', results);
                  res.writeHead(302, {
                    'Location': '/index?message=success'
                  });
                  res.end();
                }
            }
        );
    });
});
app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
