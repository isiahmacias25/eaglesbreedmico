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

// Global logout function
window.logout = function (event) {
    event.preventDefault(); // Prevent default navigation

    // Clear session data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("roadName");

    // Hide members content and show login form
    const loginForm = document.getElementById("loginForm");
    const membersContent = document.getElementById("membersContent");

    if (loginForm && membersContent) {
        loginForm.style.display = "block";
        membersContent.style.display = "none";
    }

    // Redirect after logout
    window.location.href = "../../MembersPortal/membersPortal.html";
};

// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const loginError = document.getElementById("loginError");
  const membersSubNav = document.getElementById("membersSubNav");
  const membersParagraph = document.querySelector("#membersContent p"); // Select the <p> tag

  // Hide <p> by default
  if (membersParagraph) {
    membersParagraph.style.display = "none";
  }

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
        membersSubNav.style.display = "block";
        welcomeMessage.textContent = `Welcome, ${roadName}!`;

        if (membersParagraph) {
          membersParagraph.style.display = "block"; // Show <p> when logged in
        }
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

    // Check if user is logged in
    const token = sessionStorage.getItem("token");
    const roadName = sessionStorage.getItem("roadName");

    if (token && roadName) {
      loginForm.style.display = "none";
      membersContent.style.display = "block";
      membersSubNav.style.display = "block";
      welcomeMessage.textContent = `Welcome, ${roadName}!`;

      if (membersParagraph) {
        membersParagraph.style.display = "block"; // Show <p> when logged in
      }
    } else {
      loginForm.style.display = "block";
      membersContent.style.display = "none";
      membersSubNav.style.display = "none";

      if (membersParagraph) {
        membersParagraph.style.display = "none"; // Hide <p> when logged out
      }
    }
  }
});
