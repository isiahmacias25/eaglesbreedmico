import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration (replace with your Firebase project config)
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

document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const roadName = document.getElementById("roadName").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // Append the domain to the road name for Firebase login
    const email = `${roadName}@eaglesbreedmico.com`;

    // Firebase login with the road name as email
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

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
