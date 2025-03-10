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

// Function to check session and determine if the user is logged in
function checkSession() {
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  console.log("Session token:", token);  // Debugging
  console.log("Road Name:", roadName);  // Debugging

  if (!token || !roadName) {
    if (window.location.pathname.endsWith("membersPortal.html")) {
      console.log("User is logged out. Showing login form.");
      document.getElementById("loginForm")?.classList.remove("hidden");
      document.getElementById("membersContent")?.classList.add("hidden");
      document.getElementById("membersSubNav")?.classList.add("hidden");
    }
  } else {
    console.log("User is logged in. Showing members content.");
    if (window.location.pathname.endsWith("membersPortal.html")) {
      updateUIAfterLogin(roadName);
    } else if (!window.location.pathname.endsWith("home.html")) {
      // Ensure that we only redirect to membersPortal if not on home.html
      window.location.href = "membersPortal.html";  
    }
  }
}

// Function to update UI after login
function updateUIAfterLogin(roadName) {
  console.log("User logged in. Updating UI...");

  // Ensure elements exist before modifying them
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");

  if (loginForm) {
    loginForm.classList.add("hidden");
  }
  if (membersContent) {
    membersContent.classList.remove("hidden");
  }
  if (membersSubNav) {
    membersSubNav.classList.remove("hidden");
  }

  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
    welcomeMessage.style.display = "block";
  }

  console.log("UI updated after login.");
}

// Function to update UI after logout
function updateUIAfterLogout() {
  console.log("User logged out. Updating UI...");
  sessionStorage.clear();
  document.getElementById("loginForm")?.classList.remove("hidden");
  document.getElementById("membersContent")?.classList.add("hidden");
  document.getElementById("membersSubNav")?.classList.add("hidden");
}

// Update the logout function to ensure event is passed
window.logout = function (event) {
  event.preventDefault();  // Prevent default form submission
  updateUIAfterLogout();
  window.location.reload(); // Reload the page after logout
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session on page load...");
  checkSession();

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  // Listen for login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Intercepted form submission.");

      const roadNameInput = document.getElementById("roadName");
      const passwordInput = document.getElementById("password");

      if (!roadNameInput || !passwordInput) return;

      const roadName = roadNameInput.value.trim();
      const password = passwordInput.value.trim();
      const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase();

      if (!roadName || !password) {
        loginError.textContent = "Please enter both your road name and password.";
        loginError.style.display = "block";
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("roadName", roadName);

        console.log("Login successful. Redirecting to members portal...");
        updateUIAfterLogin(roadName);
        window.location.href = "membersPortal.html";  // Redirect after login
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "An error occurred. Please try again.";

        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No user found with that road name.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Try again later.";
            break;
        }

        loginError.textContent = errorMessage;
        loginError.style.display = "block";
      }
    });
  }

  // Ensure logout button has an event listener
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
      window.logout(event);  // Pass event to logout function
    });
  }
});
