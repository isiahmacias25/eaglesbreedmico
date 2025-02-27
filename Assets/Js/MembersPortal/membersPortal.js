import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com", // ✅ Fixed storage bucket
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

// ✅ Only initialize Firebase once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const loginError = document.getElementById("loginError");

  // ✅ Check if elements exist before using them
  if (!loginForm || !membersContent || !welcomeMessage || !loginError) {
    console.error("One or more elements missing from the DOM.");
    return;
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission (page reload)

    const roadName = document.getElementById("roadName").value.trim();
    const password = document.getElementById("password").value.trim();
    const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase(); // Format for email

    try {
      // Attempt to log in using Firebase
      const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Store token and roadName in sessionStorage (persists until the tab/browser is closed)
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("roadName", roadName);

      // Show members-only content
      loginForm.style.display = "none";
      membersContent.style.display = "block";
      welcomeMessage.textContent = `Welcome, ${roadName}!`;

    } catch (error) {
      console.error("Login error:", error);

      // Show the exact error message in the UI
      let errorMessage = "An error occurred. Please try again."; // Default message

      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with that road name.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please check your road name.";
      }

      loginError.textContent = errorMessage;
      loginError.style.display = "block";
    }
  });

  // Check for logged-in user on page load
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (token && roadName) {
    // User is logged in (session is still valid)
    loginForm.style.display = "none";
    membersContent.style.display = "block";
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
  } else {
    // No session, show login form
    loginForm.style.display = "block";
    membersContent.style.display = "none";
  }

  // Logout function
  window.logout = function () {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roadName");

    loginForm.style.display = "block";
    membersContent.style.display = "none";
  };
});
