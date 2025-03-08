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

// Function to update UI after login
function updateUIAfterLogin(roadName) {
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const membersParagraph = document.querySelector("#membersContent p");

  if (loginForm) loginForm.style.display = "none";
  if (membersContent) membersContent.style.display = "block";
  if (membersSubNav) membersSubNav.style.display = "block";
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
    welcomeMessage.style.display = "block";
  }
  if (membersParagraph) membersParagraph.style.display = "block";

  console.log("User logged in:", roadName); // Debugging
}

// Function to update UI after logout
function updateUIAfterLogout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("roadName");

  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const membersParagraph = document.querySelector("#membersContent p");

  if (loginForm) loginForm.style.display = "block";
  if (membersContent) membersContent.style.display = "none";
  if (membersSubNav) membersSubNav.style.display = "none";
  if (membersParagraph) membersParagraph.style.display = "none";

  if (!window.location.pathname.includes("membersPortal.html")) {
    setTimeout(() => {
      window.location.href = "../../MembersPortal/membersPortal.html";
    }, 500);
  }
}

// Global logout function
window.logout = function (event) {
  event.preventDefault();
  updateUIAfterLogout();
};

// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (token && roadName) {
    updateUIAfterLogin(roadName);
  } else {
    updateUIAfterLogout();
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

        updateUIAfterLogin(roadName);
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "An error occurred. Please try again.";

        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No user found with that road name.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email format. Please check your road name.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
        }

        if (loginError) {
          loginError.textContent = errorMessage;
          loginError.style.display = "block";
        }
      }
    });
  }
});

// Ensure login state is checked on all members-only pages
document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (!token || !roadName) {
    window.location.href = "../../MembersPortal/membersPortal.html";
  } else {
    updateUIAfterLogin(roadName);
  }
});
