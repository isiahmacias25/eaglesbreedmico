import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent form submission (page reload)

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");
  const loginButton = document.getElementById("loginButton"); // Ensure your button has this ID

  if (!roadName || !password) {
    loginError.textContent = "Both fields are required.";
    loginError.style.display = "block";
    return;
  }

  const formattedRoadName = roadName.replace(/\s+/g, "-").toLowerCase(); // Format for email

  try {
    // Disable login button while logging in
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    // Attempt Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, `${formattedRoadName}@eaglesbreedmico.com`, password);
    const user = userCredential.user;

    // Store roadName in sessionStorage
    sessionStorage.setItem("roadName", roadName);

    // Hide login form and show members-only content
    showMembersContent(roadName);

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
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Try again later.";
        break;
      default:
        errorMessage = error.message;
        break;
    }

    loginError.textContent = errorMessage;
    loginError.style.display = "block";
  } finally {
    // Reset button state
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

// Function to show members-only content
function showMembersContent(roadName) {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("membersContent").style.display = "block";
  document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName || "Member"}!`;
}

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const roadName = sessionStorage.getItem("roadName") || "Member";
    showMembersContent(roadName);
  } else {
    // No user is logged in
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  }
});

// Logout function
window.logout = async function() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("roadName");

    // Show login form again and hide members-only content
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("membersContent").style.display = "none";
  } catch (error) {
    console.error("Logout error:", error);
  }
};
