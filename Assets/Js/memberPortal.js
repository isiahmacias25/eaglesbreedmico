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
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  // Convert road name to lowercase and format for Firebase Authentication
  const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase(); 

  try {
    // Attempt login with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);

    // Store token and road name in localStorage
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token);
    localStorage.setItem("roadName", roadName); // Store original road name

    // Show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;

  } catch (error) {
    console.error("Login error:", error.message);
    document.getElementById("loginError").style.display = "block";
  }
});

// Check authentication state on page load
window.onload = function() {
  const token = localStorage.getItem("token");
  const roadName = localStorage.getItem("roadName") || "Member"; // Default to "Member" if missing

  if (token) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } else {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }
};

// Logout function (now global)
window.logout = function() {
  localStorage.removeItem("token");
  localStorage.removeItem("roadName");
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("membersContent").style.display = "none";
};
