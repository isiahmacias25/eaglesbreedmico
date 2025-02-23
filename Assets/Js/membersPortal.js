import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  // Format road name for Firebase Authentication (convert to email format)
  const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase(); 

  try {
    // Attempt to log in using Firebase
    const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);

    // Store the token and road name in localStorage for session management
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token);
    localStorage.setItem("roadName", roadName); // Store original road name for personalized welcome message

    // Show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;

  } catch (error) {
    console.error("Login error:", error.message);

    // Show different error messages based on the error
    let errorMessage = "An error occurred. Please try again."; // Default error message

    if (error.code === "auth/user-not-found") {
      errorMessage = "No user found with that road name.";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format. Please check your road name.";
    }

    document.getElementById("loginError").textContent = errorMessage;
    document.getElementById("loginError").style.display = "block";
}

});

// Check if the user is already authenticated on page load
window.onload = function() {
  const token = localStorage.getItem("token");
  const roadName = localStorage.getItem("roadName") || "Member"; // Default to "Member" if roadName is missing

  if (token) {
    // User is logged in, show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    // User is not logged in, show the login form
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }
};

// Logout function
window.logout = function() {
  localStorage.removeItem("token");
  localStorage.removeItem("roadName");
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("membersContent").style.display = "none";
};
