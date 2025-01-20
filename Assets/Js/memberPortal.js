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
    localStorage.setItem("token", result.token);  // Save token for authentication
    window.location.href = "members-portal.html"; // Redirect to members area
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});
