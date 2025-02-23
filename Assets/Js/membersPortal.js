import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.firebasestorage.app",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

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
    if (error.code === "auth/user-not-found") {
      document.getElementById("loginError").textContent = "No user found with that road name.";
    } else if (error.code === "auth/wrong-password") {
      document.getElementById("loginError").textContent = "Incorrect password. Please try again.";
    } else {
      document.getElementById("loginError").textContent = "An error occurred. Please try again.";
    }
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
