import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
  const page = window.location.pathname; // Get the current page URL path
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const loginError = document.getElementById("loginError");

  // Check for the required elements for the members portal
  if (page.includes("members")) {
    if (!loginForm || !membersContent || !welcomeMessage || !loginError) {
      console.error("One or more elements are missing from the DOM.");
      return;
    }

    // Handle login form submission
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
    }

    // Logout function
    window.logout = function () {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("roadName");
      signOut(auth).then(() => {
        loginForm.style.display = "block";
        membersContent.style.display = "none";
      }).catch((error) => {
        console.error("Sign out error:", error);
      });
    };
  }

  // Check for the required elements for the meeting minutes page
  if (page.includes("meetingminutes")) {
    const meetingMinutesContent = document.getElementById("meetingMinutesContent");
    if (!meetingMinutesContent) {
      console.error("Meeting minutes content is missing from the DOM.");
      return;
    }

    // Handle meeting minutes logic here...
    // (add any specific functionality for meeting minutes page)
  }
});
