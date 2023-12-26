let normalCitizenCount = 0;
let seniorCitizenCount = 0;
let womenWithChildCount = 0;
let pwdCount = 0;
document.addEventListener('DOMContentLoaded', function () 
{
    let menuIcon = document.querySelector('#menu-icon');
    let navbar = document.querySelector('.navbar');

    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };

    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    let counter1Queue = [];
    let counter2Queue = [];
    let counter3Queue = [];

    // Add more arrays for additional counters if needed

    // Update the waiting customer information
    function updateWaitingCustomers(counterId) {
        let currentCustomerDiv = document.getElementById(`currentCustomer${counterId}`);
        let waitingCustomerDiv = document.getElementById(`waitingCustomer${counterId}`);
        let queue = getCounterQueue(counterId);

        // Display current customer
        if (queue.length > 0) {
            let currentCustomer = queue[0];
            currentCustomerDiv.innerHTML = `<p>Priority: ${currentCustomer.priority} <br> Name: ${currentCustomer.name}</p>`;
        } else {
            currentCustomerDiv.innerHTML = ''; // No current customer
        }

        // Display waiting customer
        if (queue.length > 1) {
            let waitingCustomer = queue[1];
            waitingCustomerDiv.innerHTML = `<p>Priority: ${waitingCustomer.priority} <br> Name: ${waitingCustomer.name}</p><br>`; // Add <br> for line break
        } else {
            waitingCustomerDiv.innerHTML = ''; // No waiting customer
        }

        // Check if the queue is updated and if it's a dequeue operation
        if (queue.length < 2 && waitingCustomerDiv.innerHTML !== '') {
            // This means a dequeue operation occurred, update the view accordingly
            handleQueueUpdate(counterId);
        }
    }

    // Call this function whenever the queue is updated
    function handleQueueUpdate(counterId) {
        updateCustomerBoxes(counterId);
        updateWaitingCustomers(counterId);
    }

    function addToCounter(counterId) {
        // Get form input values
        let customerName = document.getElementById('name').value;
        let customerAge = parseInt(document.getElementById('age').value);
        let customerMessage = document.getElementById('message').value;

        // Check if the form is filled
        if (!isFormFilled(customerName, customerAge, customerMessage)) {
            Swal.fire({
                icon: 'warning',
                title: 'Fill the form first',
                text: 'Please enter valid customer information before proceeding to the counter.'
            });
            return;
        }

        // Age validation
        if (customerAge <= 0 || customerAge > 150) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Age',
                text: 'Please enter a valid age between 1 and 150.'
            });
            return;
        }


        // Check if the counter is full
        if (getCounterQueue(counterId).length >= 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Counter Full',
                text: 'This counter is already at maximum capacity.'
            });
            return;
        }

        // Check for duplicate names across all counters
        if (isNameDuplicate(customerName)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Name',
                text: 'A customer with the same name already exists in the queue.'
            });
            return;
        }

        // Age-based validation for Senior Citizen
        let seniorCitizenRadio = document.getElementById('senior-citizen');
        if (customerAge < 60 && seniorCitizenRadio.checked) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: 'Senior Citizen option is only available for customers aged 60 and above.'
            });
            return;
        }

        // Get selected priority
        let priority = document.querySelector('input[name="priority"]:checked');

        if (!priority) {
            Swal.fire({
                icon: 'warning',
                title: 'Select Priority',
                text: 'Please select the priority for the customer.'
            });
            return;
        }

        // Create a new customer object
        let newCustomer = {
            priority: parseInt(priority.value),
            name: customerName,
            age: customerAge,
            message: customerMessage,
        };

        // Add type of disease for PWD
        if (priority.value === '4') {
            let disease = document.getElementById('disease').value;
            if (!disease.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Specify Disease',
                    text: 'Please specify the disease for PWD customers.',
                });
                return;
            }
            newCustomer.disease = disease;
        }

        // Insert the new customer into the queue
        let queue = getCounterQueue(counterId);
        queue.push(newCustomer);

        // Sort the queue in descending order based on priority
        queue.sort((a, b) => b.priority - a.priority);

        // Update the customer boxes and waiting customers
        handleQueueUpdate(counterId);

        updateChartCounts();

        // Reset the form
        document.getElementById('name').value = '';
        document.getElementById('age').value = '';
        document.getElementById('message').value = '';

        // Reset radio buttons
        document.querySelectorAll('input[name="priority"]').forEach((radio) => {
            radio.checked = false;
        });

        // Reset disease textbox for PWD
        document.getElementById('disease').value = '';
        document.getElementById('diseaseTextbox').style.display = 'none';
    }

    function updateCustomerBoxes(counterId) {
        let queue = getCounterQueue(counterId);
        let counterBoxes = document.getElementById(`counter${counterId}Boxes`);

        // Clear existing boxes
        counterBoxes.innerHTML = '';

        // Create new boxes for each customer
        queue.forEach((customer) => {
            let newBox = document.createElement('div');
            newBox.className = 'box';
            newBox.innerHTML = `<p style="font-size: 1.5rem; font-weight: bold; color: white;" >Priority: ${customer.priority},<br> Name: ${customer.name}<br></p>`;
            counterBoxes.appendChild(newBox);
        });
    }

    function isFormFilled(name, age, message) {
        return name.trim() !== '' && age > 0 && message.trim() !== '';
    }

    function isNameDuplicate(name) {
        for (let counterId = 1; counterId <= 3; counterId++) {
            let queue = getCounterQueue(counterId);
            for (let customer of queue) {
                if (customer.name === name) {
                    return true;
                }
            }
        }
        return false;
    }

    function getCounterQueue(counterId) {
        switch (counterId) {
            case 1:
                return counter1Queue;
            case 2:
                return counter2Queue;
            case 3:
                return counter3Queue;
            // Add more cases for additional counters if needed
            default:
                return [];
        }
    }

    function dequeueCustomer(queue, counterId) {
        if (queue.length > 0) {
            let servedCustomer = queue.shift();
            Swal.fire({
                icon: 'info',
                title: 'Customer Served',
                html: `<p style="font-size: 1.5rem;">Priority: ${servedCustomer.priority},<br> Name: ${servedCustomer.name},<br> Age: ${servedCustomer.age},<br> Message: ${servedCustomer.message}</p>`,
            });
            handleQueueUpdate(counterId);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'No Customers',
                text: 'There are no customers in the queue.',
            });
        }
    }

    document.getElementById('toCounter1').addEventListener('click', function () {
        addToCounter(1);
    });

    document.getElementById('toCounter2').addEventListener('click', function () {
        addToCounter(2);
    });

    document.getElementById('toCounter3').addEventListener('click', function () {
        addToCounter(3);
    });

    document.getElementById('queueSection1').addEventListener('click', function () {
        dequeueCustomer(counter1Queue, 1);
    });

    document.getElementById('queueSection2').addEventListener('click', function () {
        dequeueCustomer(counter2Queue, 2);
    });

    document.getElementById('queueSection3').addEventListener('click', function () {
        dequeueCustomer(counter3Queue, 3);
    });

    document.getElementById('viewcustomer-link').addEventListener('click', function () {
        var viewcustomerSection = document.getElementById('viewcustomer');
        viewcustomerSection.classList.toggle('active');
    });

    // Close menu when close button is clicked
    document.getElementById('close-menu').addEventListener('click', function () {
        var viewcustomerSection = document.getElementById('viewcustomer');
        viewcustomerSection.classList.remove('active');
    });

    document.getElementById('viewchart-link').addEventListener('click', function () {
        var viewcustomerSection = document.getElementById('viewchart');
        viewcustomerSection.classList.toggle('active');
    });

    document.getElementById('close-menu1').addEventListener('click', function () {
        var chartSection = document.getElementById('viewchart');
        chartSection.classList.toggle('active');
    });

    function updateCustomerTable() {
        let tableBody = document.getElementById('customers-table-body');
        tableBody.innerHTML = ''; // Clear existing rows

        // Iterate over all customers in all counters and add rows to the table
        for (let counterId = 1; counterId <= 3; counterId++) {
            let queue = getCounterQueue(counterId);

            // Sort the queue in descending order based on priority
            queue.sort((a, b) => b.priority - a.priority);

            queue.forEach((customer, index) => {
                let priorityText = getPriorityText(customer.priority); // Get the priority text

                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.priority}</td>
                    <td>${customer.age}</td>
                    <td>${priorityText}</td>
                    <td>${counterId}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // Helper function to get priority text based on priority value
    function getPriorityText(priority) {
        switch (priority) {
            case 1:
                return 'Normal Citizen';
            case 2:
                return 'Senior Citizen';
            case 3:
                return 'Women With Child';
            case 4:
                return 'PWD';
            default:
                return 'Unknown Priority';
        }
    }

    function updateChartCounts() {
        // Initialize arrays to store counts for each priority group
        normalCitizenCount = 0;
        seniorCitizenCount = 0;
        womenWithChildCount = 0;
        pwdCount = 0;
    
        // Iterate over all customers in all counters and update counts
        for (let counterId = 1; counterId <= 3; counterId++) {
            let queue = getCounterQueue(counterId);
    
            // Update counts based on priority
            queue.forEach((customer) => {
                switch (customer.priority) {
                    case 1:
                        normalCitizenCount++;
                        break;
                    case 2:
                        seniorCitizenCount++;
                        break;
                    case 3:
                        womenWithChildCount++;
                        break;
                    case 4:
                        pwdCount++;
                        break;
                    // Add more cases for additional priorities if needed
                }
            });
        }
    
        // Update the chart with the new counts
        updateChart(normalCitizenCount, seniorCitizenCount, womenWithChildCount, pwdCount);
    }

    // Call updateCustomerTable whenever the customer queue is updated
    function handleQueueUpdate(counterId) {
        updateCustomerBoxes(counterId);
        updateWaitingCustomers(counterId);
        updateCustomerTable(); // Add this line to update the customer table
        updateChart(); // Add this line to update the chart
    }

    document.querySelectorAll('input[name="priority"]').forEach((radio) => {
        radio.addEventListener('change', function () {
            const diseaseTextbox = document.getElementById('diseaseTextbox');
    
            if (radio.value === '4') {
                // Display the disease textbox when "PWD" is selected
                diseaseTextbox.style.display = 'block';
            } else {
                // Hide the disease textbox when another option is selected
                diseaseTextbox.style.display = 'none';
            }
        });
    });

    const labels = ['Normal Citizen', 'Senior Citizen', 'Women With Child', 'PWD'];

    // Get the canvas element
    const ctx = document.getElementById('incomeStatementChart').getContext('2d');

    // Create the bar graph
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Normal Citizen',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: normalCitizenCount, 
                },
                {
                    label: 'Senior Citizen',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: seniorCitizenCount, 
                },
                {
                    label: 'Women With Child',
                    backgroundColor: 'rgba(255, 205, 86, 0.5)',
                    borderColor: 'rgba(255, 205, 86, 1)',
                    borderWidth: 1,
                    data: [womenWithChildCount],
                },
                {
                    label: 'Pwd',
                    backgroundColor: 'rgba(128, 0, 128, 0.5)', // Purple color
                    borderColor: 'rgba(128, 0, 128, 1)', // Purple color
                    borderWidth: 1,
                    data: pwdCount,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                    stepSize: 1,
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Customer Served Counts',
                    font: {
                        size: 25,
                    },
                },
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 0,
                    bottom: 0,
                },
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                    },
                },
            },
        },
    });
    
    // Function to update the chart
  // Function to update the chart
function updateChart() {
    chart.data.datasets.forEach((dataset, index) => {
        switch (index) {
            case 0:
                dataset.data = [normalCitizenCount, 0, 0, 0];
                break;
            case 1:
                dataset.data = [0, seniorCitizenCount, 0, 0];
                break;
            case 2:
                dataset.data = [0, 0, womenWithChildCount, 0];
                break;
            case 3:
                dataset.data = [0, 0, 0, pwdCount];
                break;
            default:
                break;
        }
    });
    chart.update();
}

    
    // Initial chart creation
    updateChart();
    });