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

document.addEventListener("DOMContentLoaded", async () => {
  const isLoggedIn = checkSession(); // Handle UI show/hide here

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");

  if (loginForm && !isLoggedIn) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Login attempt...");

      const usernameInput = document.getElementById("roadName");
      const passwordInput = document.getElementById("password");
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const formattedUsername = username.replace(/\s+/g, "-").toLowerCase();

      if (!username || !password) {
        loginError.textContent = "Please enter both your username and password.";
        loginError.style.display = "block";
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, `${formattedUsername}@eaglesbreedmico.com`, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        localStorage.setItem("token", token);
        localStorage.setItem("username", username);

        console.log("Login successful.");
        window.location.href = "../../../MembersPortal/membersPortal.html";
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "An error occurred. Please try again.";

        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No user found with that username.";
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

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      console.log("Logging out...");
      localStorage.clear();
      window.location.href = "../../../MembersPortal/membersPortal.html";
    });
  }
});

// Function to check session and show/hide UI accordingly
function checkSession() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  console.log("Session token:", token);
  console.log("Username:", username);

  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const ifLoggedIn = document.getElementById("ifLoggedIn");

  const isLoggedIn = token && username;

  if (isLoggedIn) {
    loginForm?.classList.add("hidden");
    membersContent?.classList.remove("hidden");
    membersSubNav?.classList.remove("hidden");
    ifLoggedIn?.classList.remove("hidden");

    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
      welcomeMessage.classList.remove("hidden");
    }
  } else {
    loginForm?.classList.remove("hidden");
    membersContent?.classList.add("hidden");
    membersSubNav?.classList.add("hidden");
    ifLoggedIn?.classList.add("hidden");
    welcomeMessage?.classList.add("hidden");
  }

  return !!isLoggedIn;
}
