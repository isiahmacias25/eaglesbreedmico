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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Use the default app
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent form submission (page reload)

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase(); // Format for email

  try {
    // Attempt to log in using Firebase
    const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);


    // If login is successful
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Store token and roadName in sessionStorage (this persists until the tab/browser is closed)
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("roadName", roadName);

    // Show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;

    
  } catch (error) {
    // Log the full error to the console
    console.error("Login error:", error);

    // Show the exact error message in the UI
    let errorMessage = "An error occurred. Please try again."; // Default message

    // Handle Firebase error codes more specifically
    if (error.code === "auth/user-not-found") {
      errorMessage = "No user found with that road name.";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format. Please check your road name.";
    }

    // Display the error message
    document.getElementById("loginError").textContent = errorMessage;
    document.getElementById("loginError").style.display = "block";
  }
});

// Check for logged-in user on page load
window.onload = function() {
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (token && roadName) {
    // User is logged in (session is still valid)
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    // No session, show login form
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }
};

// Logout function
window.logout = function() {
  sessionStorage.removeItem("token"); // Remove token from sessionStorage
  sessionStorage.removeItem("roadName"); // Remove roadName from sessionStorage

  // Show login form again and hide members-only content
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("membersContent").style.display = "none";
};

document.addEventListener("DOMContentLoaded", function () {
    // Your event listener code here
});
