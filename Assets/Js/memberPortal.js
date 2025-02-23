import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration (replace with your Firebase project config)
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
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  // Convert road name to lowercase for Firebase Authentication
  const formattedRoadName = roadName.replace(" ", "-").toLowerCase();

  try {
    // Attempt login with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);

    // Store token in localStorage
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token); // Store token for session

    // Show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;

  } catch (error) {
    // Show error if login fails
    console.error("Login error:", error.message);
    document.getElementById("loginError").style.display = "block";
  }
});

window.onload = function() {
  const token = localStorage.getItem("token");

  if (token) {
    // If the user has a token, show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
  } else {
    // If no token, show login form
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const token = localStorage.getItem("token");

  if (token) {
    // User is logged in, show members content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";

    // Show welcome message
    const roadName = localStorage.getItem("roadName"); // Get road name from localStorage
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    // User is not logged in, show login form
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }

  // Handle logout
  window.logout = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("roadName");
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  };
});

