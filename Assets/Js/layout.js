
  function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = new Date();
    timerElement.textContent = `Current Time: ${now.toLocaleString()}`;
  }

  // Update timer every second
  setInterval(updateTimer, 1000);
  updateTimer(); // Initial call to display the timer immediately

document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.createElement("button");
    menuToggle.classList.add("menu-toggle");
    menuToggle.innerHTML = "&#9776;"; // Hamburger icon
    document.querySelector("nav").prepend(menuToggle);

    menuToggle.addEventListener("click", function () {
        document.querySelector("nav ul").classList.toggle("active");
    });
});
