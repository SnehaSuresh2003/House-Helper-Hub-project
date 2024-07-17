document.addEventListener('DOMContentLoaded', function () {
    var applyJobButton = document.getElementById('applyJobButton');
    var jobListingsContainer;
    const viewAvailableJobsButton = document.getElementById('viewAvailableJobsBtn');//new

    let jobListVisible = false;//new
   

    applyJobButton.addEventListener('click', function () {
        fetchJobListings();
    });
    viewAvailableJobsButton.addEventListener('click', function () {//new
        jobListVisible = !jobListVisible; // Toggle the visibility state
    
        // Get the available jobs container
        const availableJobsContainer = document.getElementById('availableJobsContainer');
    
        // Check the visibility state and toggle it
        if (jobListVisible) {
            // If jobListVisible is true, fetch and display job listings
            fetchJobListings();
        } else {
            // If jobListVisible is false, hide the available jobs container
            availableJobsContainer.innerHTML = ''; // Clear the content or hide the container
        }
    });//new

    

   

    function fetchJobListings() {
        fetch('/getJobListings')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched job listings:', data.jobListings);
                if (data.success) {
                   
                    displayJobListings(data.jobListings);
                } 
              
                else {
                    console.error('Failed to fetch job listings:', data.message);
                
            }
            })
        
        
            .catch(error => {
                console.error('Error fetching job listings:', error);
            });
    
      
    }
    function displayJobListings(jobListings) {
         jobListingsContainer = document.getElementById('jobListings');
    
        
        // Clear existing content
        jobListingsContainer.innerHTML = '';
         //new
         
        // Display each job in a box
        jobListings.forEach(function (job) {
            var jobBox = createJobBox(job);
            jobListingsContainer.appendChild(jobBox);
        });

        
    }
    

    function createJobBox(job) {
        console.log('Job object:', job);
        var jobBox = document.createElement('div');
        jobBox.classList.add('job-box');
       
        jobBox.id = `jobBox_${job.id}`;

        var titleElement = document.createElement('h2');
        titleElement.textContent = job.title;

        var descriptionElement = document.createElement('p');
        descriptionElement.textContent = job.description;

        var salaryElement = document.createElement('p');
        salaryElement.textContent = 'Salary: ' + job.salary;


        var applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', function () {
            // Implement logic to handle job application
            console.log('Job object before showApplyForm:', job);
          
            showApplyForm(job.title,job);

           
        });
        var deleteButton = document.createElement('button');//new
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            // Implement logic to handle job deletion
            deleteJob(job.id);
        });//new

        jobBox.appendChild(titleElement);
        jobBox.appendChild(descriptionElement);
        jobBox.appendChild(salaryElement);
       
        jobBox.appendChild(applyButton);
        jobBox.appendChild(deleteButton);

        return jobBox;
    }
    function showApplyForm(title,job) {
        console.log('Job object in showApplyForm:', job);
        // Create the form
        var applyForm = document.createElement('div');
        applyForm.classList.add('apply-form');
        applyForm.innerHTML = `
            <!-- Your form elements go here -->
            <p>Your are applying for the job: ${title}</p>
            <form id="applyForm">
                <!-- Form fields (name, address, phonenumber, emailid) go here -->
                <input type="text" name="name" placeholder="Name" required>
                <br>
                <input type="text" name="address" placeholder="Address" required>
                <br>
                <input type="text" name="phonenumber" placeholder="Phone Number" required pattern="\\d{10}">
                <br>
                <input type="text" name="emailid" placeholder="Email" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$">
                
                <br>
                <input type="number" name="jobId" placeholder="jobId" required>
                <br>
                <hr>
                <button type="submit">Submit</button>
            </form>
        `;

        // Append the form to the body
        document.body.appendChild(applyForm);

        // Blur the background job details
        jobListingsContainer.classList.add('blur-background');

        // Add a submit event listener for the form
        var applyFormElement = document.getElementById('applyForm');
        applyFormElement.addEventListener('submit', function (event) {
            event.preventDefault();
            // Implement logic to handle form submission and storing details in the database

            // Remove the form and clear the blur effect
            var formData = new FormData(applyFormElement);
            
            // Convert form data to an object
            var formObject = {};
            formData.forEach(function (value, key) {
                formObject[key] = value;
            });
// Log the formObject to the console
console.log('Form Object:', formObject);

            // Fetch API to submit the application
            fetch('/submitApplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    
                    showSuccessMessage(data.message);
                } else {
                    console.error('Failed to submit application:', data.message);
                }
              
            })
            .catch(error => {
                console.error('Error submitting application:', error);

                if (error.response) {
                    console.error('Response Status:', error.response.status);
                    error.response.text().then(text => console.error('Response Text:', text));
                }
            
                response.status(500).json({ success: false, message: 'Internal Server Error' });
            })
            .finally(() => {
                // Remove the form and clear the blur effect
                document.body.removeChild(applyForm);
                jobListingsContainer.classList.remove('blur-background');
            });
           
        });
    }
    
    function showSuccessMessage(message) {
        // Create the success message box
        var successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.textContent = message;

        // Append the message box to the body
        document.body.appendChild(successMessage);

        // Display the message box
        successMessage.style.display = 'block';

        // Hide the message box after a delay (e.g., 3 seconds)
        setTimeout(function () {
            successMessage.style.display = 'none';
            // Remove the message box from the DOM
            document.body.removeChild(successMessage);
        }, 3000); // 3000 milliseconds (adjust as needed)
    }
    // Function to delete a job
function deleteJob(jobId) {
fetch('/deleteJob', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId: jobId }),
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Job deleted successfully:', data.message);
        
        // Implement any UI update logic if needed
        const jobBox = document.getElementById(`jobBox_${jobId}`);
        if (jobBox && jobBox.parentNode) {
            jobBox.parentNode.removeChild(jobBox);
        }
    } else {
        console.error('Error deleting job:', data.message);
        // Implement error handling or UI update logic
    }
})
.catch(error => {
    console.error('Error deleting job:', error);
    // Implement error handling or UI update logic
});
}
   
    
});
showSuccessMessage(data.message);

