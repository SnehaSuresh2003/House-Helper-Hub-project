document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a session middleware configured that sets req.session.email
    // If not, you need to set req.session.email after login or profile creation
    const userEmail = 'email'; // Replace with the actual logic to get the user's email from the session

    // Fetch user details from the server
    fetchUserDetailsFromServer(userEmail);


    // Attach click event to jobListingButton
    var jobListingButton = document.getElementById('jobListingButton');
    jobListingButton.addEventListener('click', function () {
        // Redirect to job listing page or implement your logic
        window.location.href = 'joblisting.html';
    });

    function fetchUserDetailsFromServer(email) {
        fetch(`/getUserDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const userDetails = data.userDetails;
                // Save user details to localStorage (optional)
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
                // Display user details
                displayUserDetails(userDetails);
            } else {
                console.error('Failed to fetch user details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        });
    }
    function displayUserDetails(userDetails) {
        // Display the user's first letter as a logo
        
        
   
        var userDetailsDiv = document.getElementById('userDetails');
        userDetailsDiv.innerHTML = `
            <h2>${userDetails.fullname}</h2>
            <p>Email: ${userDetails.email}</p>
            <p>Phone Number: ${userDetails.phonenumber}</p>
            <p>Address: ${userDetails.address}</p>
            <p>Work: ${userDetails.work || 'Not Mentioned'}</p>
            <p>Field: ${userDetails.field || 'Not Mentioned'}</p>
        `;
    }

    
    
});
