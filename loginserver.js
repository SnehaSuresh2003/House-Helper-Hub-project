const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'househelper hub')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password:'root123', // Replace with your MySQL password
    database: 'userdeatils' // Replace with your MySQL database name
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



app.post('/login', (req, res) => {
    const { emailid, password } = req.body;

    // Check if user exists in the database (serviceseekers and serviceprovider tables)
    const query = 'SELECT * FROM serviceseekers WHERE emailid = ? UNION SELECT * FROM serviceprovider WHERE emailid = ?';

    connection.query(query, [emailid, emailid], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            // User not found
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password
        bcrypt.compare(password, user.password, (compareErr, compareResult) => {
            if (compareErr || !compareResult) {
                // Failed login
                return res.json({ success: false, message: 'Invalid credentials' });
            }

            // Successful login
            return res.json({ success: true, message: 'Login successful' });
        });
    });
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
