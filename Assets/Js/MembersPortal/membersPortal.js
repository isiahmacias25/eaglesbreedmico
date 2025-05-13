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

      const usernameInput = document.getElementById("roadName");
      const passwordInput = document.getElementById("password");

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const formattedUsername = username.replace(/\s+/g, "-").toLowerCase(); // Using 'formattedUsername' instead of roadName

      if (!username || !password) {
        loginError.textContent = "Please enter both your username and password.";
        loginError.style.display = "block";
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, `${formattedUsername}@eaglesbreedmico.com`, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        // Store token and username in localStorage (persistent across reloads)
        localStorage.setItem("token", token);
        localStorage.setItem("username", username); // Renamed to 'username'

        console.log("Login successful. Redirecting to members portal...");
        window.location.href = "../../../MembersPortal/membersPortal.html"; // Redirect to members portal page after successful login
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

  // Set up logout button
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Logging out...");
      localStorage.clear();
      window.location.href = "../../../MembersPortal/membersPortal.html";
    });
  }
});

// Function to check session and update UI
function checkSession() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  console.log("Session token:", token);
  console.log("Username:", username);

  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (!token || !username) {
    console.log("User is not logged in. Showing login form.");
    loginForm?.classList.remove("hidden");
    membersContent?.classList.add("hidden");
    membersSubNav?.classList.add("hidden");
    welcomeMessage?.classList.add("hidden");
  } else {
    console.log("User is logged in. Showing members content.");
    loginForm?.classList.add("hidden");
    membersContent?.classList.remove("hidden");
    membersSubNav?.classList.remove("hidden");

    if (welcomeMessage) {
      welcomeMessage.textContent = Welcome, ${username}!;
      welcomeMessage.classList.remove("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

   const loginForm = document.getElementById("loginForm"); 
  if (loginForm) {
    if (username && token) {
      loginForm.style.display = "none";
    } else {
      loginForm.style.display = "block";
    }
  }
  
  console.log("Username from localStorage:", username);
  console.log("Token from localStorage:", token);

  const element = document.getElementById("ifLoggedIn");

  if (!element) {
    console.warn("Element with ID 'ifLoggedIn' not found.");
    return;
  }

  if (username && token) {
    element.style.display = "block"; // Or remove 'hidden' class if you're using Tailwind
    console.log("User is logged in. Showing element.");
  } else {
    element.style.display = "none"; // Or add 'hidden' class
    console.log("User not logged in. Hiding element.");
  }
});
