// Base class for an Employee
class Employee {
    constructor(name, surname) {
        this.name = name;
        this.surname = surname;
    };
};

// StaffMember class inherits from Employee
class StaffMember extends Employee {
    constructor(picture, name, surname, email) {
        super(name, surname); // Call Employee constructor
        this.picture = picture; // The staff's picture
        this.email = email; // The staff's email
        this.status = "In"; // Make default status "In"
        this.outTime = null; // The time the staff member went out
        this.duration = null; // The duration which they are out for
        this.expectedReturnTime = null; // The expected return time
    };

    // Check if staff member is late
    checkLateStaff() {
        const now = new Date(); // Get the current time
        if (this.expectedReturnTime && now > this.expectedReturnTime) {
            this.staffMemberIsLate(); // Notify if staff is late
        };
    };
    
    // Notify if staff member is late using toast notification
    staffMemberIsLate() {
        // Get the toast template
        const template = document.getElementById("toastNotification");
    
        // Clone the template for each late notification
        const newToast = template.cloneNode(true);
        newToast.id = ""; // Clear the ID to avoid duplicates

        // Set toast content with staff's image, name and duration
        newToast.querySelector(".toastImage").src = this.picture;
        newToast.querySelector(".toastTitle").textContent = this.name + " " + this.surname + " is late!";
        newToast.querySelector(".toastBody").textContent = this.name + " has been out of office for " + this.duration;
        newToast.querySelector(".toastFooter").textContent = "Expected return time " + this.expectedReturnTime.toLocaleTimeString("en-GB");

        // Append the toast to the container
        document.querySelector(".toast-container").appendChild(newToast);

        // Initialize and show toast
        const toast = new bootstrap.Toast(newToast);
        toast.show();
    };
};

// DeliveryDriver class inherits from Employee
class DeliveryDriver extends Employee {
    constructor(name, surname, telephone, address, vehicle, returnTime) {
        super(name, surname); // Call Employee constructor
        this.telephone = telephone; // The driver's telephone number
        this.address = address; // The delivery address
        this.vehicle = vehicle; // The type of vehicle being used
        this.returnTime = new Date(returnTime); // The driver's return time
    };

    // Check if delivery driver is late
    checkLateDriver() {
        const now = new Date(); // Get the current time
        if (this.returnTime && now > this.returnTime) {
            this.deliveryDriverIsLate(); // Notify if driver is late
        };
    };

    // Notify if delivery driver is late using toast notification
    deliveryDriverIsLate() {
        // Get the toast template
        const template = document.getElementById("deliveryToast");

        // Clone the template for each late notification
        const newToast = template.cloneNode(true);
        newToast.id = ""; // Clear the ID to avoid duplicates

        // Set toast content with driver's contact information and return time
        newToast.querySelector(".toastTitle").textContent = "Delivery driver is delayed!";
        newToast.querySelector(".toastBody").textContent =
        "Name: " + this.name + " " + this.surname + " is delayed!" + "\n" + 
        "Address: " + this.address + "\n" + 
        "Telephone: " + this.telephone;
        newToast.querySelector(".toastFooter").textContent = "Expected return time " + this.returnTime.toLocaleTimeString("en-GB");

        // Append the toast to the container
        document.querySelector(".toast-container").appendChild(newToast);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(newToast);
        toast.show();
    };
};

// Globals to store staff and deliveries
const staffMembers = [];
const deliveries = [];

// Fetch staff data using the Fetch API
function staffUserGet() {
    fetch("https://randomuser.me/api/?results=5")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.results.length; i++) {
                let user = data.results[i];
                // Create new StaffMember object and add to staffMembers array
                let staff = new StaffMember(user.picture.thumbnail, user.name.first, user.name.last, user.email);
                staffMembers.push(staff);
            }
            updateStaffTable(); // Update the staff table with the new data 
        })
        .catch(error => {
            console.error("There has been a problem with your fetch operation:", error);
        });
};

// Update the staff table in the UI
function updateStaffTable() {
    const tbody = $("#staffBody");
    tbody.empty() // Clear the table body
    for (let i = 0; i < staffMembers.length; i++) {
        const staff = staffMembers[i];
        const row = $("<tr></tr>");

        // Add staff picture
        const pictureCell = $("<td></td>");
        const img = $("<img>")
        .attr("src", staff.picture)
        .attr("alt", staff.name + " " + staff.surname)
        pictureCell.append(img);
        row.append(pictureCell);

        // Add other staff details
        row.append($("<td></td>").text(staff.name)); // Staff name
        row.append($("<td></td>").text(staff.surname)); // Staff surname
        row.append($("<td></td>").text(staff.email)); // Staff email
        row.append($("<td></td>").text(staff.status)); // Staff status
        row.append($("<td></td>").text(staff.outTime ? staff.outTime.toLocaleTimeString("en-GB") : " ")); // Staff out time to local format
        row.append($("<td></td>").text(staff.duration)); // Staff duration
        row.append($("<td></td>").text(staff.expectedReturnTime ? staff.expectedReturnTime.toLocaleTimeString("en-GB") : " ")); // Expected return time to local format

        tbody.append(row) // Append the row to the table body
    };
};

// Log the staff member as "Out"
function clockOut(staff, minutes) {
    staff.status = "Out"; // Set staff status to "Out"
    const now = new Date();
    staff.outTime = now; // Set the current time as outTime
    staff.duration = formatDuration(minutes); // Format the duration
    staff.expectedReturnTime = new Date(now.getTime() + minutes * 60000); // Calculate the expected return time

    // Set a timer to check if staff is late after their expected return time
    setTimeout(function() {
        staff.checkLateStaff();
    }, minutes * 60000)
};

// Reset the staff status to "In"
function clockIn(staff) {
    staff.status = "In"; // Set staff status to "In"
    staff.outTime = null; // Clear outTime
    staff.duration = null; // Clear duration
    staff.expectedReturnTime = null; // Clear expected return time
};

// Format the given minutes into h(hours) and m(minutes), if time is less than 60 minutes, return only m(minutes).
function formatDuration(minutes) {
    return minutes >= 60 ? Math.floor(minutes / 60) + "h " + (minutes % 60) + "m" // Format to hours and minutes
    : minutes + "m"; // Format to minutes
};

// Calls clockOut to log the staff as "Out" and updates the staff table UI
function staffOut(staff, minutes) {
    clockOut(staff, minutes);
    updateStaffTable(); // Update the UI with new status
};

// Calls clockIn to log the staff as "In" and updates the staff table UI
function staffIn(staff) {
    clockIn(staff);
    updateStaffTable(); // Update the UI with new status
};

// Event listener for row selection in staff table
let selectedRow = null;
$(document).on("click", "#staffBody tr", function() {
    $("#staffBody tr").removeClass("table-active"); // Remove active class from all rows
    $(this).addClass("table-active"); // Add active class to the selected row
    selectedRow = $(this).index(); // The index of the selected row
});

// Event listener for staff "Out" button
$("#staffOut").on("click", function() {
    if (selectedRow !== null) {
        let minutes = prompt("Enter the length of leave in minutes:"); // Prompt to ask for duration
        // Validate input
        if(minutes === null || minutes.trim() === "") {
            alert("Please enter a valid number.") // Alert if input is empty
        } else if (isNaN(minutes) || parseInt(minutes) <= 0) {
            alert("Please enter a number above 0.") // Alert if input is not a positive number
        } else {
            staffOut(staffMembers[selectedRow], parseInt(minutes)); // Call staffOut for the selected staff member with the entered duration
        }
    } else {"Please select a staff member."} // Alert if no row is selected
});

// Event listener for staff "In" button
$("#staffIn").on("click", function() {
    if (selectedRow !== null) {
        staffIn(staffMembers[selectedRow]); // Call staffIn for the selected staff member
    } else {
        alert("Please select a staff member.") // Alert if no row is selected
    }
});

// Event listener for clicks outside the table
$(document).on("click", function(event) {
    if (!$(event.target).closest("#staffBody").length) {
        $("#staffBody tr").removeClass("table-active"); // Remove active class from all rows
        selectedRow = null; // Reset selected row
    }
});

// Function to set validation patterns for specific inputs
function setAttrPatterns() {
    document.getElementById("name").setAttribute("pattern", "^[a-zA-Z]+$");
    document.getElementById("surname").setAttribute("pattern", "^[a-zA-Z]+$");
    document.getElementById("telephone").setAttribute("pattern", "^\\d{7,14}$");
    document.getElementById("address").setAttribute("pattern", "^[a-zA-Z0-9\\s]+$");
    document.getElementById("returnTime").setAttribute("pattern", "^(?:[01]\\d|2[0-3]):[0-5]\\d$");
};

// Function to initialize form validation
function validateDelivery() {
    setAttrPatterns();

    // Fetch all forms with class ".requires-validation" to apply validation
    const forms = document.querySelectorAll(".requires-validation");

    // Loop over forms and prevent submission if any form is invalid
    forms.forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault(); // Prevent the default form submission

            // Check if the form is valid
            if (!form.checkValidity()) {
                event.stopPropagation(); // Stop further event propagation
                form.classList.add("was-validated"); // Add validation feedback class if invalid
            } else {
                addDelivery(); // Call addDelivery when the form is valid
                
                // Reset the form after successful submission
                form.reset();
                form.classList.remove("was-validated") // Remove validation feedback class
            }
        }, false);
    });
};

// Initialize the validation when DOM content is loaded
document.addEventListener("DOMContentLoaded", validateDelivery);


// Function to add delivery driver from the "Schedule Delivery" to the "Delivery Board"
function addDelivery() {
    // Get the form data from input fields
    const vehicle = document.getElementById("vehicle").value;
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const telephone = document.getElementById("telephone").value;
    const address = document.getElementById("address").value;
    const returnTime = document.getElementById("returnTime").value;

    // Parse return time into hours and minutes
    const [hours, minutes] = returnTime.split(":").map(num => parseInt(num, 10));
    const returnTimeDate = new Date(); // Create a new date object for return time
    returnTimeDate.setHours(hours, minutes); // Set the hours and minutes

    // Create a new instance of the DeliveryDriver class
    const delivery = new DeliveryDriver(name, surname, telephone, address, vehicle, returnTimeDate);

    // Add the new delivery driver to the deliveries array
    deliveries.push(delivery);

    // Create a new row for the delivery driver and append their information
    const row = $("<tr></tr>");
    row.append($("<td></td>").html("<i class='bi " + (delivery.vehicle === "car" ?"bi-car-front-fill" : "bi-bicycle") + "'></i>")); // Show vehicle icons
    row.append($("<td></td>").text(delivery.name)); // Delivery driver's name
    row.append($("<td></td>").text(delivery.surname)); // Delivery driver's surname
    row.append($("<td></td>").text(delivery.telephone)); // Delivery driver's telephone
    row.append($("<td></td>").text(delivery.address)); // Delivery driver's address
    row.append($("<td></td>").text(returnTimeDate.toLocaleTimeString("en-GB"))); // Delivery driver's return time to local format

    // Append the new row to the delivery table body
    $("#deliveryTable tbody").append(row);

    // Schedule a check for late delivery driver
    scheduleDriverCheck(delivery);
};

// Function to schedule a check for late deliveries
function scheduleDriverCheck(driver) {
    const now = new Date(); // Get the current time
    const timeToCheck = driver.returnTime - now; // Calculate the time for driver's return time

    // Set a timeout to check return time
    if (timeToCheck > 0) {
        setTimeout(() => {
            driver.checkLateDriver(); // Check if driver is late
        }, timeToCheck);
    } else {
        // If return time has already passed, check immediately
        driver.checkLateDriver();
    };
};

// Event listener for selecting a row in Delivery Board 
let deliveryRow = null;
$(document).on("click", "#deliveryBody tr", function() {
    $("#deliveryBody tr").removeClass("table-active"); // Remove active class from all rows
    $(this).addClass("table-active"); // Add active class to the selected row
    deliveryRow = $(this).index(); // The index of the selected row
});

// Event listener for the "Clear Delivery" button
$("#clearDelivery").on("click", function() {
    if(deliveryRow !== null) {
        $("#deliveryBody tr").eq(deliveryRow).remove(); // Remove the selected row
        deliveryRow = null; // Reset delivery row
    } else {
        alert("Select a delivery driver"); // Alert if no row is selected
    }
});

// Event listener for clicks outside the table
$(document).on("click", function(event) {
    if (!$(event.target).closest("#deliveryBody").length) {
        $("#deliveryBody tr").removeClass("table-active"); // Remove active class from all rows
        deliveryRow = null; // Reset delivery row
    }
});

// Function to update the time every second
function digitalClock() {
    setInterval(() => {
        const now = new Date();
        // Format the current time into a string
        const formattedTime = now.toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        $("#currentTime").text(formattedTime); // Update the clock display
    }, 1000); // Update every second
};

// Event handler to elements with class "btn"
$(".btn").hover(function() {
    // On mouse enter, animate the button's width to 120px and height to 50px
    $(this).animate({
        width: "110px",
        height: "45px"
    }, 200); // Duration for animation to finish in milliseconds
}, function() {
    // On mouse leave, animate the button's width back to 100px and height to 40px
    $(this).animate({
        width: "100px",
        height: "40px"
    })
}, 200); // Duration for animation to finish in milliseconds

// Initialize the digital clock and fetch staff data when DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    digitalClock(); // Start the digital clock
    staffUserGet(); // Fetch staff data
});