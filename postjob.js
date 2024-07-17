document.addEventListener('DOMContentLoaded', function () {
    var jobPostForm = document.getElementById('jobPostForm');

    jobPostForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get form data
        var formData = new FormData(jobPostForm);
        var formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Send form data to the server for storage
        fetch('/postJob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Job posted successfully! Thanks for posting.');
            } else {
                alert('Failed to post the job. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error posting job:', error);
        });
    });
});
