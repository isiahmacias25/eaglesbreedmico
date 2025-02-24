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
    localStorage.setItem("token", token);
    localStorage.setItem("roadName", roadName); // Store road name for personalized message

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



window.onload = function() {
  const token = localStorage.getItem("token");
  const roadName = localStorage.getItem("roadName");
  const expiration = localStorage.getItem("expiration");

  if (token && roadName && expiration && Date.now() < expiration) {
    // User is logged in and session is valid
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    // Session is expired or no token, log them out
    localStorage.removeItem("token");
    localStorage.removeItem("roadName");
    localStorage.removeItem("expiration");
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

// Store token with expiration time (e.g., 1 hour)
const expirationTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
localStorage.setItem("token", token);
localStorage.setItem("roadName", roadName);
localStorage.setItem("expiration", expirationTime);
