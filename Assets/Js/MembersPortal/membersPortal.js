import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase config
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

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 DOM loaded, checking session...");
  checkSession();

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");

  // 🔐 Login Handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("🔑 Login attempt...");

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
        const userCredential = await signInWithEmailAndPassword(
          auth,
          `${formattedUsername}@eaglesbreedmico.com`,
          password
        );

        const user = userCredential.user;
        const token = await user.getIdToken();

        localStorage.setItem("token", token);
        localStorage.setItem("username", username);

        console.log("✅ Login success. Redirecting...");
        window.location.href = "../../../MembersPortal/membersPortal.html";
      } catch (error) {
        console.error("❌ Login failed:", error);
        let message = "An error occurred. Please try again.";

        switch (error.code) {
          case "auth/user-not-found": message = "No user found with that username."; break;
          case "auth/wrong-password": message = "Incorrect password."; break;
          case "auth/invalid-email": message = "Invalid email format."; break;
          case "auth/user-disabled": message = "This account has been disabled."; break;
          case "auth/too-many-requests": message = "Too many failed attempts. Try again later."; break;
        }

        loginError.textContent = message;
        loginError.style.display = "block";
      }
    });
  }

  // 🚪 Logout Handler
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("🚪 Logging out...");

      localStorage.removeItem("username");
      localStorage.removeItem("token");

      updateUI(false);
      window.location.reload(); // Optional: force reload to reset everything
    });
  }
});

// 🧠 Session Check + UI update
function checkSession() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  console.log("🔍 Checking session...");
  console.log("Token:", token);
  console.log("Username:", username);

  const loggedIn = token && username;
  updateUI(loggedIn, username);
}

// 🎨 Update UI Based on Session
function updateUI(isLoggedIn, username = "") {
  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const ifLoggedIn = document.getElementById("ifLoggedIn");

  if (isLoggedIn) {
    loginForm?.classList.add("hidden");
    membersContent?.classList.remove("hidden");
    membersSubNav?.classList.remove("hidden");
    ifLoggedIn?.classList.remove("hidden");

    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
      welcomeMessage.classList.remove("hidden");
    }

    console.log("👋 Logged in. Members-only content visible.");
  } else {
    loginForm?.classList.remove("hidden");
    membersContent?.classList.add("hidden");
    membersSubNav?.classList.add("hidden");
    welcomeMessage?.classList.add("hidden");
    ifLoggedIn?.classList.add("hidden");

    console.log("🙅 Not logged in. Members-only content hidden.");
  }
}
