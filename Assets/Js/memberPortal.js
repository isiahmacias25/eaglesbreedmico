document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  // Send login request to backend
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roadName, password }),
  });

  const result = await response.json();

  if (response.ok) {
    localStorage.setItem("token", result.token);  // Store the token locally

    // Hide login form and show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});
