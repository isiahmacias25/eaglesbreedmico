import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


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
const db = getFirestore(app);

// Function to log out and clear localStorage
function logoutUser() {
  console.log("Logging out due to inactivity...");
  localStorage.clear();
  window.location.href = "../../../MembersPortal/membersPortal.html";
}

// Function to update last activity timestamp
function updateLastActivity() {
  localStorage.setItem("lastActivity", Date.now().toString());
}

// Function to check for inactivity
function checkInactivity() {
  const lastActivity = localStorage.getItem("lastActivity");
  if (lastActivity) {
    const now = Date.now();
    const diff = now - parseInt(lastActivity, 10);
    const thirtyMinutes = 30 * 60 * 1000;
    if (diff > thirtyMinutes) {
      logoutUser();
    }
  }
}

// Check session on page load and show/hide content accordingly
document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session on page load...");
  checkSession();
  checkInactivity(); // Check immediately on page load

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
        updateLastActivity();

        console.log("Login successful. Redirecting to members portal...");
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

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      logoutUser();
    });
  }

  // Track activity
  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
    window.addEventListener(event, updateLastActivity);
  });

  // Check inactivity every minute
  setInterval(checkInactivity, 60 * 1000);
});

// Function to check session and update UI
function checkSession() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const loginForm = document.getElementById("loginForm");
  const membersContent = document.getElementById("membersContent");
  const membersSubNav = document.getElementById("membersSubNav");
  const welcomeContainer = document.getElementById("welcomeContainer");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const mustLogin = document.getElementById("mustLogin");

  if (!token || !username) {
    loginForm?.classList.remove("hidden");
    membersContent?.classList.add("hidden");
    membersSubNav?.classList.add("hidden");
    welcomeContainer?.classList.add("hidden");
    mustLogin?.classList.remove("hidden");
  } else {
    loginForm?.classList.add("hidden");
    membersContent?.classList.remove("hidden");
    membersSubNav?.classList.remove("hidden");
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
      welcomeMessage.classList.remove("hidden");
      welcomeContainer?.classList.remove("hidden");
    }
    mustLogin?.classList.add("hidden");
  }
}

/*
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;

    try {
      const userRef = doc(db, "Users", uid);
      const docSnap = await getDoc(userRef);
      console.log("Checking user doc with UID:", uid);
      console.log("Doc exists?", docSnap.exists());
      if (docSnap.exists()) {
        console.log("Doc data:", docSnap.data());
        const data = docSnap.data();
        const role = data.role?.toLowerCase();

        switch (role) {
          case "officer":
            console.log("✅ Full access granted to officer.");
            break;

          case "sister":
            console.warn("🟡 Limited access (sister). Redirecting if needed...");
            if (window.location.pathname.includes("SupportersManager")) {
              window.location.href = "/unauthorized.html";
            }
            break;

          case "brother":
            console.warn("🔴 Basic access (brother). Redirecting if needed...");
            if (
              window.location.pathname.includes("EventManager") ||
              window.location.pathname.includes("SupportersManager")
            ) {
              window.location.href = "/unauthorized.html";
            }
            break;

          default:
            console.warn("❌ Unknown role. Redirecting...");
            window.location.href = "/unauthorized.html";
        }
      } else {
        console.warn("⚠️ No user doc found");
        window.location.href = "/unauthorized.html";
      }
    } catch (err) {
      console.error("🔥 Error checking user role:", err);
      window.location.href = "/404.html";
    }

  } else {
    window.location.href = "/MembersPortal/membersPortal.html";
  }
});
*/

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
});
