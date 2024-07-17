document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailid = document.getElementById("emailid").value;
        const password = document.getElementById("password").value;
        console.log('Email for login:', emailid);
        // Send login credentials to the server
        fetch("/index", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ emailid, password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received from server:', data);
            if (data.success) {
                // Redirect to the home page on successful login
                window.location.href = "/";
              alert(`Login sucessful: ${data.message}`);
            } else {
                alert(`Login failed: ${data.message}`); // Display error message
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("Login failed. Please try again.");
        });
    });

    function showSignUpForm(role) {
        var form = document.getElementById("signup-form");
        form.innerHTML = ""; // Clear existing content

        // Create SignUp Form based on role
        var formHTML = `
        <form id="myform" action="/register" method="post" >
        <label>Email:</label>
        <input type="email" name="emailid" required  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"><br>

        <label>First Name:</label>
        <input type="text" name="firstname" required><br>

        <label>Last Name:</label>
        <input type="text" name="lastname" required><br>

        <label>Phone Number:</label>
        <input type="tel" name="phonenumber" required  pattern="\\d{10}"><br>

        <label>Aadhar Number:</label>
        <input type="text" name="adharnumber" required pattern="\\d{12}"><br>

        <label>Password:</label>
        <input type="password" name="password" required pattern=".{6,}"><br>
        

        <label>Confirm Password:</label>
        <input type="password" id="confirmpassword" name="confirmpassword" required  pattern=".{6,}"><br>
        

   
        <input type="hidden" name="userType" value="${role}">
        <button type="submit" id="simulateSignupButton">Submit</button>
    </form>
        `;
        form.innerHTML = formHTML;
        form.style.display = "block";
    }
});
