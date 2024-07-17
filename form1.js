function showSignUpForm(role) {
    var form = document.getElementById("signup-form");
    form.innerHTML = ""; // Clear existing content

    // Create SignUp Form based on role
    var formHTML = `
       <form id="myform" action="/register" method="post">
            <label>Email:</label>
            <input type="email" name="emailid" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"><br>

            <label>First Name:</label>
            <input type="text" name="firstname" required><br>

            <label>Last Name:</label>
            <input type="text" name="lastname" required><br>

            <label>Phone Number:</label>
            <input type="tel" name="phonenumber" required pattern="\\d{10}"><br>

            <label>Aadhar Number:</label>
            <input type="text" name="adharnumber" id="adharnumber" required pattern="[0-9 ]{12}" title="Enter 12 digits with or without spaces">

            <label>Password:</label>
            <input type="password" name="password" required pattern=".{6,}"><br>

            <label>Confirm Password:</label>
            <input type="password" id="confirmpassword" name="confirmpassword" required><br>

            <input type="hidden" name="userType" value="${role}">
            <button type="submit">Submit</button>
        </form>
        <button onclick="goBack()">Back</button>
    `;
 
    form.innerHTML = formHTML;
    form.style.display = "block";
}

function goBack() {
    window.history.back();
}
