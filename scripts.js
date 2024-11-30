document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");
  const sidebarItems = document.querySelectorAll(".sidebar li");
  const calendarDaysContainer = document.querySelector(".calendar-days");
  const serviceDropdown = document.querySelector("#service");
  // const servicePriceDisplay = document.querySelector("#service-price");
  const monthSelector = document.querySelector("#month-selector");
  const yearSelector = document.querySelector("#year-selector");
  const prevMonthButton = document.querySelector("#prev-month");
  const nextMonthButton = document.querySelector("#next-month");
  const summaryFields = {
    service: document.querySelector("#summary-service"),
    date: document.querySelector("#summary-date"),
    name: document.querySelector("#summary-name"),
    email: document.querySelector("#summary-email"),
    payment: document.querySelector("#summary-payment"),
  };
  const finish = document.querySelector(".finish");
  const finishButton = document.querySelector("#finish-button");
  const nextButtons = document.querySelectorAll(".next-button");
  const prevButtons = document.querySelectorAll(".prev-button");

  let currentSection = 0;
  let selectedDate = null;
  let selectedTime = null;
  let selectedService = null;
  // let selectedPrice = null;
  let userInfo = {};
  let paymentMethod = null;

  // const ws = new WebSocket("wss://" + location.host + "/")

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date();

  // Create a Day Element
  const createDayElement = (text, className, date = null) => {
    const dayElement = document.createElement("div");
    const d_t_section = document.getElementById("date-time-main");
    dayElement.className = `day ${className}`;
    dayElement.textContent = text;
    if (date && className === "available") {
      dayElement.setAttribute("data-date", date);
      dayElement.addEventListener("click", () => {
        document
          .querySelectorAll(".day")
          .forEach((d) => d.classList.remove("selected"));
        dayElement.classList.add("selected");
        selectedDate = date;
        d_t_section.scrollBy(0, 500);
        updateSummary();
        console.log(date);
      });
    }
    return dayElement;
  };

  // // Create a Time Element
  // const createTimeElement = (text, className, date = null) => {
  //   const TimeElement = document.createElement("div");
  //   const d_t_section = document.getElementById("date-time-main");
  //   dayElement.className = `day ${className}`;
  //   dayElement.textContent = text;
  //   if (date && className === "available") {
  //     dayElement.setAttribute("data-date", date);
  //     dayElement.addEventListener("click", () => {
  //       document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
  //       dayElement.classList.add("selected");
  //       selectedDate = date;
  //       d_t_section.scrollBy(0, 500);
  //     });
  //   }
  //   return dayElement;
  // };

  // Populate Month and Year Selectors
  const populateSelectors = () => {
    // Clear existing options
    monthSelector.innerHTML = "";
    yearSelector.innerHTML = "";

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
    const eventSummaryDisplay = document.querySelector("#event-summary");

    // Map of event types to summaries
    const eventSummaries = {
      event: `
        <strong>Event Package (up to 100 people):</strong>
        <ul>
          <li><strong>Usage:</strong> 16 hours.</li>
          <li><strong>Features:</strong>
            <ul>
              <li>Infinity swimming pool with Jacuzzi, air-conditioned studio room (queen-sized bed).</li>
              <li>Non-air-conditioned pavilion, 12-seater dining table, bar area with sink, comfort/shower rooms.</li>
              <li>Chairs and tables (100 pax), water dispenser, purified water container, free grill.</li>
              <li>Videoke (until 10 PM), open cabana cottage, service area with sink/prep area.</li>
              <li>Spacious parking, 24-hour CCTV.</li>
            </ul>
          </li>
        </ul>`,
      "pool-non-ac": `
        <strong>Pool Event - Non Airconditioned (20 people):</strong>
        <ul>
          <li><strong>Usage:</strong> Day: 8:00 AM - 5:00 PM; Night: 6:00 PM - 12:00 AM.</li>
          <li>₱250/head for more than 20 pax; ₱800/hour for extension.</li>
          <li><strong>Features:</strong>
            <ul>
              <li>Infinity swimming pool with Jacuzzi, outdoor lounge chairs, open pavilion.</li>
              <li>Comfort/shower rooms, kitchen sink, ventilation.</li>
              <li>Chairs and tables (20 pax), 3 long tables, water dispenser, purified water container.</li>
              <li>Videoke (until 10 PM), free grill, cabana cottage, half-court basketball.</li>
              <li>Spacious parking, 24-hour CCTV.</li>
              <li>Catering is <strong>not allowed</strong>.</li>
            </ul>
          </li>
        </ul>`,
      "pool-ac": `
        <strong>Pool Event - With Airconditioned Studio Room (25 people):</strong>
        <ul>
          <li><strong>Features:</strong>
            <ul>
              <li>Infinity swimming pool with Jacuzzi, air-conditioned studio room (queen-sized bed).</li>
              <li>Outdoor lounge chairs, open pavilion, bar area with sink, dining table.</li>
              <li>Refrigerator, microwave oven, comfort/shower rooms (2 total).</li>
              <li>Chairs and tables (25 pax), water dispenser, purified water container, videoke (until 10 PM).</li>
              <li>Cabana cottage, half-court basketball court, spacious parking, 24-hour CCTV.</li>
            </ul>
          </li>
        </ul>`,
    };

    serviceDropdown.addEventListener("change", () => {
      const selectedOption = serviceDropdown.selectedOptions[0];
      selectedService = selectedOption.textContent;

      // const guests = selectedOption.getAttribute("data-guests");
      // displayGuests.textContent = ${guests};

      const selectedOptions = serviceDropdown.value;
      const summary =
        eventSummaries[selectedOptions] ||
        "<p>Please select a valid event type.</p>";
      eventSummaryDisplay.innerHTML = summary;

      updateSummary();
      collectPaymentMethod();
      console.log(selectedService);
    });
  };

  // Collect User Info
  const collectUserInfo = () => {
    const userInfoForm = document.querySelector("#user-info-form");
    if (userInfoForm) {
      const inputs = userInfoForm.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          userInfo[input.id] = input.value.trim();

          console.log(input.value);
          updateSummary();
        });
      });
    }
  };

  // Collect Payment Method
  const collectPaymentMethod = () => {
    const paymentMethodSelect = document.querySelector("#payment-method");
    const paymentOnlineMethodSelected = document.querySelector(
      "#online-payment-group"
    );
    const paymentMethodOnline = document.querySelector(
      "#payment-method-online"
    );
    const paymentOnsiteMethodSelected =
      document.querySelector("#onsite-payment");
    const payment = document.querySelector("#payment");

    const initialOption = serviceDropdown.selectedOptions[0];
    console.log(initialOption.getAttribute("data-price"));
    const amount = document.querySelector("#amounts");
    const payNowBtn = document.querySelector(".payNow");

    const selectedPrice = initialOption.getAttribute("data-price");
    if (serviceDropdown) {
      document.querySelectorAll(".subTotal, .total").forEach((subTotal) => {
        subTotal.textContent = selectedPrice;
      });
    }

    document.querySelectorAll(".event").forEach((events) => {
      events.textContent = selectedService;
    });

    if (paymentMethodOnline) {
      paymentMethodOnline.addEventListener("change", () => {
        const paymentMethodOl = paymentMethodOnline.value;

        document.querySelector(".eWallet").textContent = paymentMethodOl;
      });
    }

    if (paymentMethodSelect) {
      // Set initial payment method
      paymentMethodSelect.addEventListener("change", () => {
        paymentMethod = paymentMethodSelect.value;

        if (paymentMethod == "Online Payment") {
          payment.style.display = "flex";
          paymentOnlineMethodSelected.style.display = "flex";
          paymentOnsiteMethodSelected.style.display = "none";
        } else {
          paymentOnsiteMethodSelected.style.display = "flex";
          payment.style.display = "none";
          paymentOnlineMethodSelected.style.display = "none";
        }
        updateSummary();
        console.log(paymentMethod);
      });

      payNowBtn.addEventListener("click", () => {
        document.querySelector(".online-payment").style.display = "flex";
        document.querySelector(".paid").textContent = `${amount.value}`;
        console.log(amount.value);
        const prices = initialOption.getAttribute("data-price");
        const cleanSelectedPrice = prices.replace(/[^\d]/g, "");
        const selectedPriceValue = parseInt(cleanSelectedPrice) || 0; 
        const amountValue = parseInt(amount.value) || 0;

        // Calculate the balance
        const balance = amountValue - selectedPriceValue;

        // Update the balance element
        document.querySelector(".balance").textContent = `₱ ${balance}`;
      });
    }
    // if (paymentOnlineMethodSelect) {
    //   // Set initial payment method
    //   const paymentOnlineMethod = paymentOnlineMethodSelect.value;

    //   paymentOnlineMethodSelect.addEventListener("change", () => {
    //     paymentOnlineMethod = paymentOnlineMethodSelect.value;

    //     if (paymentOnlineMethod == "Online Payment"){
    //       payment.style.display = "flex";
    //     } else{
    //       payment.style.display = "none";

    //     }

    //     console.log(paymentOnlineMethod);
    //   });
    // }
  };

  // Populate Summary
  const populateSummary = () => {
    finish.addEventListener("click", () => {
      console.log({
        selectedService,
        selectedDate,
        selectedTime,
        userInfo,
        paymentMethod,
      });

      if (
        !selectedService ||
        !selectedDate ||
        !selectedTime ||
        !userInfo["full-name"] ||
        !paymentMethod
      ) {
        alert("Please fill all required fields before finishing.");
        return;
      }

      // Proceed with populating the summary
      summaryFields.service.textContent = selectedService || "Not selected";
      summaryFields.date.textContent = selectedDate || "Not selected";
      summaryFields.date.textContent = selectedTime || "Not selected";
      summaryFields.name.textContent =
        `${userInfo["full-name"]}` || "Not provided";
      summaryFields.email.textContent = userInfo.email || "Not provided";
      summaryFields.payment.textContent = paymentMethod || "Not selected";
      updateSummary();
    });

    finishButton.addEventListener("click", () => {
      alert("Booking completed successfully!");
    });
  };

  // Time Functionality
  const handleTimeFunc = () => {
    const timeBtn = document.querySelectorAll(".time-btn");

    timeBtn.forEach((btn) => {
      btn.addEventListener("click", () => {
        timeBtn.forEach((btn) => btn.classList.remove("active"));
        btn.classList.add("active");
        const activeBtn = document.querySelector(".time-btn.active");
        selectedTime = activeBtn.value;
        console.log(activeBtn.getAttribute("value"));
        updateSummary();
      });
    });
  };

  // Next and Previous button functionality
  const handleNavigation = () => {
    const navigateToSection = (direction) => {
      // Validate current section before moving
      const canProceed = direction === "prev" || validateCurrentSection();

      if (canProceed) {
        // Update section based on direction
        currentSection += direction === "next" ? 1 : -1;

        // Ensure section stays within bounds
        currentSection = Math.max(
          0,
          Math.min(currentSection, sections.length - 1)
        );

        updateSections();
      } else if (direction === "next") {
        alert("Please complete all required fields before proceeding.");
      }
    };

    // Add event listeners to next buttons
    nextButtons.forEach((button) => {
      button.addEventListener("click", () => navigateToSection("next"));
    });

    // Add event listeners to previous buttons
    prevButtons.forEach((button) => {
      button.addEventListener("click", () => navigateToSection("prev"));
    });
  };

  // Setup Sidebar Navigation with Validation
  const setupSidebarNavigation = () => {
    sidebarItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        // Ensure the user cannot skip sections
        const canProceed =
          index <= currentSection || validateAllPreviousSections(index);

        if (canProceed) {
          currentSection = index;

          // Ensure section stays within bounds
          currentSection = Math.max(
            0,
            Math.min(currentSection, sections.length - 1)
          );

          updateSections();
        } else {
          alert("Please complete all required sections before proceeding.");
        }
      });
    });
  };

  // Validate all previous sections
  const validateAllPreviousSections = (targetSectionIndex) => {
    for (let i = 0; i < targetSectionIndex; i++) {
      if (!validateSection(i)) {
        return false;
      }
    }
    return true;
  };

  // Validate specific section
  const validateSection = (sectionIndex) => {
    switch (sectionIndex) {
      case 0: // Service Selection
        return selectedService !== null && selectedService.trim() !== "";
      case 1: // Date & Time
        return (
          selectedDate &&
          selectedDate.trim() !== "" &&
          selectedTime &&
          selectedTime.trim() !== ""
        );
      case 2: // Your Information
        return validateUserInfo();
      case 3: // Payment
        return paymentMethod !== null && paymentMethod.trim() !== "";
      default:
        return true;
    }
  };

  const validateCurrentSection = () => validateSection(currentSection);

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
      prevButtons.forEach((button) => {
        button.disabled = currentSection === 0;
      });
    }
    if (nextButtons.length) {
      nextButtons.forEach((button) => {
        button.disabled = currentSection === sections.length - 1;
        button.style.display =
          currentSection === sections.length - 1 ? "none" : "block";
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

    [monthSelector, yearSelector].forEach((selector) => {
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
      const formattedDate = date.toISOString().split("T")[0];
      const dayElement = createDayElement(day, className, formattedDate);
      if (isDisabled) {
        dayElement.style.opacity = "0.5";
        dayElement.style.cursor = "not-allowed";
      }
      calendarDaysContainer.appendChild(dayElement);
    }
  };

  // Summary Update Function
  const updateSummary = () => {
    // Get service selection
    const serviceSelect = document.getElementById("service");
    const selectedService =
      serviceSelect.options[serviceSelect.selectedIndex].text;
    document.getElementById("summary-service").textContent = selectedService;

    // Get selected date (assuming you store the selected date in a variable or data attribute)
    const selectedDateElement = document.querySelector(".day.selected");
    if (selectedDateElement) {
      document.getElementById("summary-date").textContent =
        selectedDateElement.getAttribute("data-date");
    }
    const selectedTimeElement = document.querySelector(".time-btn.active");
    if (selectedTimeElement) {
      document.getElementById("summary-time").textContent = selectedTimeElement.getAttribute("value");
      selectedTimeElement.value;
      selectedTime = selectedTimeElement.getAttribute("value");
    }

    // Get user information
    const fullName = document.getElementById("full-name").value;

    document.getElementById("summary-name").textContent = fullName;

    // const email = document.getElementById('email').value;
    // document.getElementById('summary-email').textContent = email;

    // Get payment method
    const paymentMethod = document.getElementById("payment-method");
    const selectedPayment =
      paymentMethod.options[paymentMethod.selectedIndex].text;
    document.getElementById("summary-payment").textContent = selectedPayment;
  };

  // Initialize
  const initialize = () => {
    handleNavigation();
    populateSelectors();
    generateCalendarDays();
    handleTimeFunc();
    handleServiceSelection();
    handleMonthNavigation();
    collectUserInfo();
    collectPaymentMethod();
    populateSummary();
    setupSidebarNavigation(); // Add this line
    updateSections();
  };

  initialize();
});
