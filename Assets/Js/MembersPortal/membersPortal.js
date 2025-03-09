import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

  if (!window.location.pathname.endsWith("membersPortal.html") &&
      !window.location.pathname.includes("MembersPortal/")) {
    window.location.href = "MembersPortal/membersPortal.html";
  }
}

window.logout = async function (event) {
  event.preventDefault();
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during logout:", error);
  }
  updateUIAfterLogout();
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Checking session status...");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const token = sessionStorage.getItem("token");
  const roadName = sessionStorage.getItem("roadName");

  if (token && roadName) {
    updateUIAfterLogin(roadName);

    if (!window.location.pathname.includes("membersPortal") &&
        !window.location.pathname.endsWith("membersPortal.html")) {
      window.location.href = "MembersPortal/membersPortal.html";
    }
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
