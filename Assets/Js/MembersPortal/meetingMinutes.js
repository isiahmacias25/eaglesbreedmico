import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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

// Prevent duplicate Firebase initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Wait until the document is ready
document.addEventListener("DOMContentLoaded", async function () {
  const minutesGrid = document.getElementById("meetingMinutesGrid");

  if (!minutesGrid) {
    console.error("Meeting minutes grid is missing from the DOM.");
    return;
  }

  // Fetch meeting minutes data from Firestore
  try {
    const querySnapshot = await getDocs(collection(db, "MeetingMinutes"));
    querySnapshot.forEach((doc) => {
      const minuteData = doc.data(); // Document data
      const title = minuteData.title;
      const pdfUrl = minuteData.pdfUrl;

      // Create a grid tile for each meeting minute
      const tile = document.createElement("div");
      tile.classList.add("meeting-minute-tile");
      tile.innerHTML = `
        <h3>${title}</h3>
        <a href="${pdfUrl}" target="_blank">View PDF</a>
      `;
      minutesGrid.appendChild(tile);
    });
  } catch (error) {
    console.error("Error fetching meeting minutes: ", error);
  }
});
