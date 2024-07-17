const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const path = require('path');
const nodemailer = require('nodemailer'); 

const app = express();
const PORT = 3052;
app.use(session({
    secret: 'AppaAmma', // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: true,
}));
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(__dirname));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'userdeatils',
    multipleStatements: true,
});

// Serve your static files (index.html, etc.)
app.use(express.static(__dirname));

// Sign Up functionality
app.post('/register', (req, res) => {
    const { userType, emailid, firstname, lastname, phonenumber, adharnumber, password, confirmpassword } = req.body;

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error('Error hashing password:', hashErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Check the length of the email before inserting
        if (emailid.length > 50) {
            return res.status(400).json({ error: 'Email is too long' });
        }

        console.log('User Type:', userType);
        const tableName = userType === 'serviceseekers' ? 'serviceseekers' : 'serviceprovider';
        console.log('Table Name:', tableName);
        const sqlQuery = `INSERT INTO ${tableName} (emailid, firstname, lastname, phonenumber, adharnumber, password, confirmpassword) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
            sqlQuery,
            [emailid, firstname, lastname, phonenumber, adharnumber, hashedPassword, confirmpassword],
            (insertErr, results) => {
                if (insertErr) {
                    console.error('Error inserting user into MySQL:', insertErr);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('Inserted into MySQL:', results);
                    res.redirect('/index?message=success');
                }
            }
        );
    });
});

// Login functionality

app.post('/index', (req, res) => {
    const { emailid, password } = req.body;

    const query = 'SELECT * FROM serviceseekers WHERE emailid = ? UNION ALL SELECT * FROM serviceprovider WHERE emailid = ?';

    connection.query(query, [emailid, emailid], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        console.log('Received email:', emailid);

        console.log('Query Results:', results);

        if (results.length === 0) {
            // User not found in either table
            console.log('User not found');
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare the provided password with the stored plain text password
        if (password !== user.confirmpassword) {
            // Failed login
            console.log('Failed login');
            return res.json({ success: false, message: 'Please try again' });
        }

        // Successful login
         // Failed login
         console.log('sucessful login');
        return res.json({ success: true, message: 'Login successful' });
    });
});



app.post('/create-seeker-profile', (req, res) => {
    const { fullname, email, phonenumber, adharnumber, address } = req.body;
    

    // Check if a profile with the same email already exists
    const checkQuery = 'SELECT * FROM serviceprofile WHERE email = ?';

    connection.query(checkQuery, [email], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking existing Service Seeker profile:', checkErr);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (checkResults.length > 0) {
            // Profile with the same email already exists
            res.status(400).json({ error: 'Profile with the same email already exists' });
        } else {

    // Insert data into serviceseekers table
    const sqlQuery = 'INSERT INTO serviceprofile (fullname, email, phonenumber, adharnumber, address) VALUES (?, ?, ?, ?, ?)';

    connection.query(
        sqlQuery,
        [fullname, email, phonenumber, adharnumber, address],
        (insertErr, results) => {
            if (insertErr) {
                console.error('Error inserting Service Seeker profile into MySQL:', insertErr);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Inserted Service Seeker profile into MySQL:', results);
                req.session.email = email;
                res.redirect('/dashboard?message=profile-success');
               
                        

                
                
              
            }
        }
    );
}
});
});


// Create Service Provider Profile
app.post('/create-provider-profile', (req, res) => {
    const { fullname, email, phonenumber, adharnumber, work, field,address, } = req.body;
    const checkQuery = 'SELECT * FROM providerprofile WHERE email = ?';

    connection.query(checkQuery, [email], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking existing Service Provider profile:', checkErr);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (checkResults.length > 0) {
            // Profile with the same email already exists
            res.status(400).json({ error: 'Profile with the same email already exists' });
        } else {
            // Insert data into serviceprovider table
            const insertQuery = 'INSERT INTO providerprofile (fullname, email, phonenumber, adharnumber, work, field, address) VALUES (?, ?, ?, ?, ?, ?, ?)';

            connection.query(
                insertQuery,
                [fullname, email, phonenumber, adharnumber, work, field, address],
                (insertErr, results) => {
                    if (insertErr) {
                        console.error('Error inserting Service Provider profile into MySQL:', insertErr);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('Inserted Service Provider profile into MySQL:', results);
                        req.session.email = email;
                        // Redirect to index.html with success message
                        res.redirect('/dashboard?message=profile-success');
                        
                       
                       

                    }
                }
            );
        }
    });
});
app.post('/getUserDetails', (req, res) => {
    const userEmail = req.session.email;

    // Fetch user details based on the email from the respective table
    const query = `SELECT email, fullname, phonenumber, adharnumber, address, null as work, null as field FROM serviceprofile WHERE email = ?
    UNION ALL
    SELECT email, fullname, phonenumber, adharnumber, address, work, field FROM providerprofile WHERE email = ?
    `;

    connection.query(query, [userEmail, userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else if (results.length === 0) {
            console.log('User details not found');
            res.status(404).json({ success: false, message: 'User details not found' });
        } else {
            const userDetails = results[0];

            // Send user details as JSON response
            res.status(200).json({
                success: true,
                message: 'User details fetched successfully',
                userDetails: userDetails,
            });
        }
    });
})
// Handle job posting
app.post('/postJob', (req, res) => {
   
    const { title, description, salary, phoneNumber,emailid,jobId } = req.body;
    
    // Insert job posting data into the database (modify this according to your database schema)
    const insertQuery = 'INSERT INTO jobs (title, description, salary, phoneNumber,emailid,jobId) VALUES (?, ?, ?, ?,?,?)';
  
    connection.query(
        insertQuery,
        [title, description, salary, phoneNumber,emailid,jobId],
        (insertErr, results) => {
            if (insertErr) {
                console.error('Error posting job:', insertErr);
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else {
                console.log('Job posted:', results);
                res.status(200).json({ success: true, message: 'Job posted successfully!' });
                
            }
        }
    );
});

// Add this route to handle job listings

// Update the /getJobListings route to fetch job listings from the database
app.get('/getJobListings', (req, res) => {
    const query = 'SELECT id, title, description, salary, emailid FROM jobs';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching job listings from the database:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            const jobListings = results;
            console.log('Fetched job listings:', jobListings);
            res.json({ success: true, jobListings });
        }
    });
});
// ... (your existing code)

// Add this route to handle form submissions
// Add this route to handle form submissions
app.post('/submitApplication', async (req, res) => {//new
    const { name, address, phonenumber, emailid, jobId } = req.body;

    const insertQuery = 'INSERT INTO job_applications (name, address, phonenumber, emailid, jobId) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(insertQuery, [name, address, phonenumber, emailid, jobId], (insertErr, results) => {
        if (insertErr) {
            console.error('Error submitting application:', insertErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            console.log('Application submitted successfully:', results);

            // Fetch job title associated with the jobId
            const fetchJobTitleQuery = 'SELECT title FROM jobs WHERE jobId = ?';

            connection.query(fetchJobTitleQuery, [jobId], (fetchErr, fetchResults) => {
                if (fetchErr) {
                    console.error('Error fetching job title:', fetchErr);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                } else {
                    const jobTitle = fetchResults[0]?.title || 'Unknown Job';
                    
                    // Send success response with job title to the client
                    res.json({ success: true, message: 'Application submitted successfully', jobTitle });

                    // Notify the user who posted the job
                    notifyPoster(emailid, name, jobTitle);
                }
            });
        }
    });
});
function notifyPoster(posterEmail, applicantName,jobTitle) {//new
    // Assuming you have a function to send notifications to the poster
    // You need to implement this function to send notifications to the poster
    // You can use a similar approach as the notification fetching logic

    // Example:
    const notificationData = {
        posterEmail,
        applicantName,
        jobTitle, // Replace with the actual job title
    };

    // Send a notification to the poster
    sendNotificationToPoster(notificationData);
}

function sendNotificationToPoster(notificationData) {
    // Implement your logic to store the notification in the database
    // This could be a separate table for notifications or part of the user's data

    // Example:
    const insertNotificationQuery = 'INSERT INTO notifications (posterEmail, applicantName, jobTitle) VALUES (?, ?, ?)';
    
    connection.query(
        insertNotificationQuery,
        [notificationData.posterEmail, notificationData.applicantName, notificationData.jobTitle],
        (insertNotificationErr, notificationResults) => {
            if (insertNotificationErr) {
                console.error('Error storing notification:', insertNotificationErr);
            } else {
                console.log('Notification stored successfully:', notificationResults);
            }
        }
    );
}



// Function to send an email to the user who posted the job


// Add this route to call the stored procedure and get available job counts
app.get('/getAvailableJobCount', (req, res) => {//new
    const storedProcedure = 'CALL GetAvailableJobCount()';

    connection.query(storedProcedure, (err, results) => {
        if (err) {
            console.error('Error calling stored procedure:', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            const availableJobCount = results[0]; // Assuming the result is in the first element of the array
            res.json({ success: true, availableJobCount });
        }
    });
});

// Add this route to handle job deletion
app.post('/deleteJob', (req, res) => {
    const jobId = req.body.jobId;

    // Implement the logic to delete the job from the database
    const deleteQuery = 'DELETE FROM jobs WHERE id = ?';

    connection.query(deleteQuery, [jobId], (deleteErr, deleteResults) => {
        if (deleteErr) {
            console.error('Error deleting job:', deleteErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            console.log('Job deleted successfully:', deleteResults);
            res.status(200).json({ success: true, message: 'Job deleted successfully!' });
        }
    });
});
app.get('/api/notifications', async (req, res) => {                            //new
    try {
        const query = 'SELECT posterEmail, applicantName, jobTitle FROM notifications';
        const notifications = await executeQuery(query);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a function to execute database queries
function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}   ///neew




app.get('/index', (req, res) => {
    // Implement logic to render the index page
    res.sendFile(__dirname + '/index.html');
});





    // Insert data into serviceprovider table
    app.get('/dashboard', (req, res) => {
        res.sendFile(__dirname + '/dashboard.html');
    });
    
    
    // Dashboard route
    

    

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

