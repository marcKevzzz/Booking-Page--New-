document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");
  const sidebarItems = document.querySelectorAll(".sidebar li");
  const calendarDaysContainer = document.querySelector(".calendar-days");
  const serviceDropdown = document.querySelector("#service");
  const servicePriceDisplay = document.querySelector("#service-price");
  const monthSelector = document.querySelector("#month-selector");
  const yearSelector = document.querySelector("#year-selector");
  const prevMonthButton = document.querySelector("#prev-month");
  const nextMonthButton = document.querySelector("#next-month");
  const summaryFields = {
    service: document.querySelector("#summary-service"),
    date: document.querySelector("#summary-date"),
    name: document.querySelector("#summary-name"),
    email: document.querySelector("#summary-email"),
    payment: document.querySelector("#summary-payment")
  };
  const finishButton = document.querySelector("#finish-button");
  const nextButtons = document.querySelectorAll(".next-button");
  const prevButtons = document.querySelectorAll(".prev-button");

  let currentSection = 0;
  let selectedDate = null;
  let selectedService = null;
  let selectedPrice = null;
  let userInfo = {};
  let paymentMethod = null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();

  // Create a Day Element
  const createDayElement = (text, className, date = null) => {
    const dayElement = document.createElement("div");
    dayElement.className = `day ${className}`;
    dayElement.textContent = text;
    if (date && className === "available") {
      dayElement.setAttribute("data-date", date);
      dayElement.addEventListener("click", () => {
        document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
        dayElement.classList.add("selected");
        selectedDate = date;
      });
    }
    return dayElement;
  };

  // Populate Month and Year Selectors
  const populateSelectors = () => {
    // Clear existing options
    monthSelector.innerHTML = '';
    yearSelector.innerHTML = '';
    
    // Populate months
    months.forEach((month, index) => {
      const option = new Option(month, index);
      if (index === currentDate.getMonth()) {
        option.selected = true;
      }
      monthSelector.appendChild(option);
    });

    // Populate years (current year ± 5 years)
    const currentYear = currentDate.getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      const option = new Option(year, year);
      if (year === currentYear) {
        option.selected = true;
      }
      yearSelector.appendChild(option);
    }
  };

  // Handle Service Selection
  const handleServiceSelection = () => {
    const initialOption = serviceDropdown.selectedOptions[0];
    selectedService = initialOption.textContent;
    selectedPrice = initialOption.getAttribute("data-price");
    servicePriceDisplay.textContent = `Price: ${selectedPrice}`;
  
    serviceDropdown.addEventListener("change", () => {
      const selectedOption = serviceDropdown.selectedOptions[0];
      selectedService = selectedOption.textContent;
      selectedPrice = selectedOption.getAttribute("data-price");
      servicePriceDisplay.textContent = `Price: ${selectedPrice}`;
    });
  };

  // Collect User Info
  const collectUserInfo = () => {
    const userInfoForm = document.querySelector("#user-info-form");
    if (userInfoForm) {
      const inputs = userInfoForm.querySelectorAll("input");
      inputs.forEach(input => {
        input.addEventListener("change", () => {
          userInfo[input.id] = input.value.trim();
        });
      });
    }
  };

  // Collect Payment Method
  const collectPaymentMethod = () => {
    const paymentMethodSelect = document.querySelector("#payment-method");
    if (paymentMethodSelect) {
      // Set initial payment method
      paymentMethod = paymentMethodSelect.value;

      paymentMethodSelect.addEventListener("change", () => {
        paymentMethod = paymentMethodSelect.value;
      });
    }
  };

  // Populate Summary
  const populateSummary = () => {
    finishButton.addEventListener("click", () => {
      if (!selectedService || !selectedDate || !userInfo["first-name"] || !userInfo.email || !paymentMethod) {
        alert("Please fill all required fields before finishing.");
        return;
      }
      
      summaryFields.service.textContent = selectedService || "Not selected";
      summaryFields.date.textContent = selectedDate || "Not selected";
      summaryFields.name.textContent = `${userInfo["first-name"]} ${userInfo["last-name"] || ''}`.trim() || "Not provided";
      summaryFields.email.textContent = userInfo.email || "Not provided";
      summaryFields.payment.textContent = paymentMethod || "Not selected";
      
      alert("Booking completed successfully!");
    });
  };

  // Next and Previous button functionality
  const handleNavigation = () => {
    const navigateToSection = (direction) => {
      // Validate current section before moving
      const canProceed = direction === 'prev' || validateCurrentSection();
      
      if (canProceed) {
        // Update section based on direction
        currentSection += direction === 'next' ? 1 : -1;
        
        // Ensure section stays within bounds
        currentSection = Math.max(0, Math.min(currentSection, sections.length - 1));
        
        updateSections();
      } else if (direction === 'next') {
        alert("Please complete all required fields before proceeding.");
      }
    };

    // Add event listeners to next buttons
    nextButtons.forEach(button => {
      button.addEventListener("click", () => navigateToSection('next'));
    });

    // Add event listeners to previous buttons
    prevButtons.forEach(button => {
      button.addEventListener("click", () => navigateToSection('prev'));
    });
  };

  // Validation for each section
  const validateCurrentSection = () => {
    switch (currentSection) {
      case 0: // Service Selection
        return selectedService !== null;
      case 1: // Date & Time
        return selectedDate !== null;
      case 2: // Your Information
        return validateUserInfo();
      case 3: // Payment
        return paymentMethod !== null;
      default:
        return true;
    }
  };

  // Validate user information
  const validateUserInfo = () => {
    const form = document.querySelector("#user-info-form");
    return form.checkValidity();
  };

  // Update sections visibility
  const updateSections = () => {
    sections.forEach((section, index) => {
      section.classList.toggle("hidden", index !== currentSection);
    });
    sidebarItems.forEach((item, index) => {
      item.classList.toggle("active", index === currentSection);
    });

    // Disable previous button on first section, next button on last section
    if (prevButtons.length) {
      prevButtons.forEach(button => {
        button.disabled = currentSection === 0;
      });
    }
    if (nextButtons.length) {
      nextButtons.forEach(button => {
        button.disabled = currentSection === sections.length - 1;
        button.style.display = currentSection === sections.length - 1 ? 'none' : 'block';
      });
    }
  };

  // Month navigation
  const handleMonthNavigation = () => {
    prevMonthButton.addEventListener("click", () => {
      const currentMonth = parseInt(monthSelector.value);
      if (currentMonth === 0) {
        monthSelector.value = "11";
        yearSelector.value = (parseInt(yearSelector.value) - 1).toString();
      } else {
        monthSelector.value = (currentMonth - 1).toString();
      }
      generateCalendarDays();
    });

    nextMonthButton.addEventListener("click", () => {
      const currentMonth = parseInt(monthSelector.value);
      if (currentMonth === 11) {
        monthSelector.value = "0";
        yearSelector.value = (parseInt(yearSelector.value) + 1).toString();
      } else {
        monthSelector.value = (currentMonth + 1).toString();
      }
      generateCalendarDays();
    });

    [monthSelector, yearSelector].forEach(selector => {
      selector.addEventListener("change", generateCalendarDays);
    });
  };

  // Generate Calendar Days
  const generateCalendarDays = () => {
    const selectedMonth = parseInt(monthSelector.value);
    const selectedYear = parseInt(yearSelector.value);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

    calendarDaysContainer.innerHTML = "";

    // Add blank days for alignment
    const blanks = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < blanks; i++) {
      calendarDaysContainer.appendChild(createDayElement("", "blank"));
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      // Disable past dates
      const isDisabled = date < new Date(currentDate.setHours(0, 0, 0, 0));
      const className = isDisabled ? "disabled" : "available";
      const formattedDate = date.toISOString().split('T')[0];
      const dayElement = createDayElement(day, className, formattedDate);
      if (isDisabled) {
        dayElement.style.opacity = "0.5";
        dayElement.style.cursor = "not-allowed";
      }
      calendarDaysContainer.appendChild(dayElement);
    }
  };

  // Add this function to update summary when the section becomes visible
function updateSummary() {
  // Get service selection
  const serviceSelect = document.getElementById('service');
  const selectedService = serviceSelect.options[serviceSelect.selectedIndex].text;
  document.getElementById('summary-service').textContent = selectedService;

  // Get selected date (assuming you store the selected date in a variable or data attribute)
  // This might need to be adjusted based on how you're storing the date selection
  const selectedDate = document.querySelector('.day.selected');
  if (selectedDate) {
      document.getElementById('summary-date').textContent = selectedDate.getAttribute('data-full-date');
  }

  // Get user information
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  document.getElementById('summary-name').textContent = `${firstName} ${lastName}`;
  
  const email = document.getElementById('email').value;
  document.getElementById('summary-email').textContent = email;

  // Get payment method
  const paymentMethod = document.getElementById('payment-method');
  const selectedPayment = paymentMethod.options[paymentMethod.selectedIndex].text;
  document.getElementById('summary-payment').textContent = selectedPayment;
}

// Add this to your navigation logic when moving to summary section
document.getElementById('payments-next').addEventListener('click', function() {
  document.getElementById('payments').classList.add('hidden');
  document.getElementById('summary').classList.remove('hidden');
  updateSummary(); // Update summary information immediately
});

// Add click handler for finish button
document.getElementById('finish-button').addEventListener('click', function() {
  // Handle the booking confirmation
  alert('Booking confirmed! Thank you for your reservation.');
  // Additional confirmation logic here
});

// Optional: Update summary if user goes back and makes changes
document.getElementById('summary-prev').addEventListener('click', function() {
  // Store current summary state if needed
});

document.getElementById('payments-next').addEventListener('click', function() {
  updateSummary(); // Update when returning to summary
});

  // Initialize
  const initialize = () => {
    handleNavigation();
    populateSelectors();
    generateCalendarDays();
    handleServiceSelection();
    handleMonthNavigation();
    collectUserInfo();
    collectPaymentMethod();
    populateSummary();
    updateSections();
  };

  initialize();
});