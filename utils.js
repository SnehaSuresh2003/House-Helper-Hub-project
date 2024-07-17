function makeRequest(url, method, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                callback(response);
            } else {
                console.error('Request failed:', xhr.status);
            }
        }
    };

    if (data) {
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
}








function viewAvailableJobs() {
    makeRequest('/getAvailableJobCount', 'GET', null, (response) => {
        if (response.success) {
            const availableJobs = response.availableJobCount;

            // Assuming you have a function to dynamically create UI elements, create elements for each available job
            const jobsContainer = document.getElementById('availableJobsContainer');
            jobsContainer.innerHTML = ''; // Clear previous content

            availableJobs.forEach((job) => {
                const jobElement = createJobElement(job.title, job.availableJobs);
                jobsContainer.appendChild(jobElement);
              
            });
        } else {
            console.error('Error getting available job count:', response.message);
        }
    });
}

// Function to create UI element for a job
function createJobElement(title, count) {
    const jobElement = document.createElement('div');
    jobElement.innerHTML = `<p>${title}: ${count} available</p>`;
    // You can add more styling and structure as needed
    return jobElement;
}

// Attach an event listener to the button to trigger fetching and displaying available jobs
const viewAvailableJobsBtn = document.getElementById('viewAvailableJobsBtn');
viewAvailableJobsBtn.addEventListener('click', viewAvailableJobs);
