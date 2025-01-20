document.addEventListener("DOMContentLoaded", () => {
  const monthButtons = document.querySelectorAll(".month-btn");
  const popup = document.getElementById("calendar-popup");
  const closeBtn = document.querySelector(".close-btn");
  const calendarDiv = document.getElementById("calendar");
  const monthTitle = document.getElementById("popup-month-title");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = {
    "01": 31, "02": 28, "03": 31, "04": 30,
    "05": 31, "06": 30, "07": 31, "08": 31,
    "09": 30, "10": 31, "11": 30, "12": 31
  };

  const firstDayOfMonth2025 = {
    "01": 3, "02": 6, "03": 6, "04": 2,
    "05": 4, "06": 7, "07": 2, "08": 5,
    "09": 1, "10": 3, "11": 6, "12": 1
  };

  monthButtons.forEach(button => {
    button.addEventListener("click", () => {
      const month = button.getAttribute("data-month");
      monthTitle.textContent = months[parseInt(month) - 1] + " 2025";
      generateCalendar(month);
      popup.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  function generateCalendar(month) {
    calendarDiv.innerHTML = `
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    `;

    let firstDay = firstDayOfMonth2025[month];
    let totalDays = daysInMonth[month];

    for (let i = 0; i < firstDay; i++) {
      calendarDiv.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      calendarDiv.innerHTML += `<div>${day}</div>`;
    }
  }
});
