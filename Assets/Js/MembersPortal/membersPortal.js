import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function updateUIAfterLogin(roadName) {
  console.log("Updating UI after login...");
  document.getElementById("loginForm")?.style.display = "none";
  document.getElementById("membersContent")?.style.display = "block";
  document.getElementById("membersSubNav")?.style.display = "block";
  
  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
    welcomeMessage.style.display = "block";
  }
}

function updateUIAfterLogout() {
  console.log("Updating UI after logout...");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("roadName");

  document.getElementById("loginForm")?.style.display = "block";
  document.getElementById("membersContent")?.style.display = "none";
  document.getElementById("membersSubNav")?.style.display = "none";

  if (!window.location.pathname.endsWith("membersPortal.html") && !window.location.pathname.includes("MembersPortal/")) {
    window.location.href = "MembersPortal/membersPortal.html";
  }
}

window.logout = function (event) {
  event.preventDefault();
  updateUIAfterLogout();
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session status...");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  // Redirect if already logged in
  if (token && roadName) {
    if (!window.location.pathname.includes("membersPortal")) {
      window.location.href = "MembersPortal/membersPortal.html";
    } else {
      updateUIAfterLogin(roadName);
    }
  } else {
    updateUIAfterLogout();
  }

  // Ensure login form doesn't submit via URL
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // **Stops the form from adding data to the URL**
      console.log("Form submission intercepted.");

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

        updateUIAfterLogin(roadName);
        window.location.href = "MembersPortal/membersPortal.html"; // Redirect manually
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

        if (loginError) {
          loginError.textContent = errorMessage;
          loginError.style.display = "block";
        }
      }
    });
  }
});
