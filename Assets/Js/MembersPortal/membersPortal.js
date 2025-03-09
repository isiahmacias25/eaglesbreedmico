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
  console.log("User logged in. Updating UI...");
  document.getElementById("loginForm")?.classList.add("hidden");
  document.getElementById("membersContent")?.classList.remove("hidden");
  document.getElementById("membersSubNav")?.classList.remove("hidden");

  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${roadName}!`;
    welcomeMessage.style.display = "block";
  }
}

function updateUIAfterLogout() {
  console.log("User logged out. Updating UI...");
  sessionStorage.clear();
  document.getElementById("loginForm")?.classList.remove("hidden");
  document.getElementById("membersContent")?.classList.add("hidden");
  document.getElementById("membersSubNav")?.classList.add("hidden");

  if (!window.location.pathname.includes("MembersPortal")) {
    window.location.href = "MembersPortal/membersPortal.html";
  }
}

window.logout = function (event) {
  event.preventDefault();
  updateUIAfterLogout();
  window.location.reload();
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session status...");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (token && roadName) {
    if (!window.location.pathname.includes("membersPortal")) {
      window.location.href = "MembersPortal/membersPortal.html";
    } else {
      updateUIAfterLogin(roadName);
    }
  } else {
    updateUIAfterLogout();
  }

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

        updateUIAfterLogin(roadName);
        window.location.href = "MembersPortal/membersPortal.html";
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
});
