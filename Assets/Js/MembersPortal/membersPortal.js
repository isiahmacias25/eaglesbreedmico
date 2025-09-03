import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.firebasestorage.app",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function logoutUser() {
  signOut(auth)
    .then(() => {
      localStorage.clear();
      window.location.href = "/MembersPortal/membersPortal.html";
    })
    .catch(() => {
      localStorage.clear();
      window.location.href = "/MembersPortal/membersPortal.html";
    });
}

function updateLastActivity() {
  localStorage.setItem("lastActivity", Date.now().toString());
}

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

document.addEventListener("DOMContentLoaded", function () {
  checkSession();
  checkInactivity();

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

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

        checkSession();
      } catch (error) {
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

  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
    window.addEventListener(event, updateLastActivity);
  });

  setInterval(checkInactivity, 60 * 1000);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const loginFormCheck = document.getElementById("loginForm");
  if (loginFormCheck) {
    if (username && token) {
      loginFormCheck.style.display = "none";
    } else {
      loginFormCheck.style.display = "block";
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    try {
      const userRef = doc(db, "Users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const role = data.role?.toLowerCase();

        switch (role) {
          case "officer":
            break;
          case "sister":
            if (window.location.pathname.includes("SupportersManager")) {
              window.location.href = "/unauthorized.html";
            }
            break;
          case "brother":
            if (
              window.location.pathname.includes("EventManager") ||
              window.location.pathname.includes("SupportersManager")
            ) {
              window.location.href = "/unauthorized.html";
            }
            break;
          default:
            window.location.href = "/unauthorized.html";
        }
      } else {
        window.location.href = "/unauthorized.html";
      }
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  } else {
    const protectedPaths = [
      "/EventManager",
      "/SupportersManager",
      "/MeetingMinutes"
    ];
    const currentPath = window.location.pathname.toLowerCase();
    const isProtected = protectedPaths.some(page => currentPath.includes(page.toLowerCase()));

    if (isProtected) {
      window.location.href = "/MembersPortal/membersPortal.html";
    } else {
      // public page, no redirect
    }
  }
});
