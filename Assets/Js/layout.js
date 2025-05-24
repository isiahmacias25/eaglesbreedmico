
  function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = new Date();
    timerElement.textContent = `Current Time: ${now.toLocaleString()}`;
  }

  // Update timer every second
  setInterval(updateTimer, 1000);
  updateTimer(); // Initial call to display the timer immediately

document.getElementById("year").textContent = new Date().getFullYear();

