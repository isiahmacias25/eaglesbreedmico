import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const loginError = document.getElementById("loginError");

  // Only run login-related code if loginForm exists
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const roadName = document.getElementById("roadName").value.trim();
      const password = document.getElementById("password").value.trim();
      const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase();

      try {
        const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("roadName", roadName);

        loginForm.style.display = "none";
        membersContent.style.display = "block";
        membersSubNav.style.display = "block"; // Show the members sub-navigation
        welcomeMessage.textContent = `Welcome, ${roadName}!`;
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "An error occurred. Please try again.";

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

    // Check for logged-in user
    const token = sessionStorage.getItem("token");
    const roadName = sessionStorage.getItem("roadName");

    if (token && roadName) {
      loginForm.style.display = "none";
      membersContent.style.display = "block";
      welcomeMessage.textContent = `Welcome, ${roadName}!`;
    } else {
      loginForm.style.display = "block";
      membersContent.style.display = "none";
      membersSubNav.style.display = "none"; // Hide sub-navigation if not logged in
    }

    // Logout function
    window.logout = function (event) {
    event.preventDefault();  // Prevent the default link behavior (navigation)
    
    // Clear session data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roadName");

    // Optionally, hide the members content and show the login form (ensure these elements exist)
    var loginForm = document.getElementById("loginForm");
    var membersContent = document.getElementById("membersContent");

    if (loginForm && membersContent) {
        loginForm.style.display = "block";  // Show the login form
        membersContent.style.display = "none";  // Hide the members content
    }

    // Redirect to the login page after logout (delay the redirect to allow the DOM update)
    setTimeout(function() {
        window.location.href = "../../MembersPortal/membersPortal.html";  // Redirect to the page you want
    }, 500);  // A small delay (500ms) to ensure the logout actions are completed first
};

  }
});
