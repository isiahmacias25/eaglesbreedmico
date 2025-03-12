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

// Check session on page load and show/hide content accordingly
document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session on page load...");
  checkSession();

  // Set up login form submission
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Intercepted login form submission.");

      const roadNameInput = document.getElementById("roadName");
      const passwordInput = document.getElementById("password");

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

        // Store token and roadName in localStorage (persistent across reloads)
        localStorage.setItem("token", token);
        localStorage.setItem("roadName", roadName);

        console.log("Login successful. Redirecting to members portal...");
        window.location.href = "membersPortal.html";
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

  // Set up logout button
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Logging out...");
      localStorage.clear();
      window.location.href = "../home.html"; // Redirect to home
    });
  }
});

// Function to check session and update UI
function checkSession() {
  const token = localStorage.getItem("token");
  const roadName = localStorage.getItem("roadName");

  console.log("Session token:", token);
  console.log("Road Name:", roadName);

  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (!token || !roadName) {
    console.log("User is not logged in. Showing login form.");
    loginForm?.classList.remove("hidden");
    membersContent?.classList.add("hidden");
    membersSubNav?.classList.add("hidden");
    welcomeMessage.style.display = "none";
  } else {
    console.log("User is logged in. Showing members content.");
    loginForm?.classList.add("hidden");
    membersContent?.classList.remove("hidden");
    membersSubNav?.classList.remove("hidden");
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
    welcomeMessage.style.display = "block";
  }
}
