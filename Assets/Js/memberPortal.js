import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration (replace with your Firebase project config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // Firebase login with the road name as email (assuming road name is used as the email)
    const userCredential = await signInWithEmailAndPassword(auth, `${roadName}@eaglesbreedmico.com`, password);

    // Store token in localStorage
    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token);

    // Hide login form and show members-only content
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("membersContent").style.display = "block";
    document.getElementById("welcomeMessage").textContent = `Welcome, ${roadName}!`;
  } catch (error) {
    console.error("Login error:", error.message);
    document.getElementById("loginError").style.display = "block";
  }
});

function logout() {
  localStorage.removeItem("token");
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("membersContent").style.display = "none";
}
