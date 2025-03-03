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
  const minutesGrid = document.getElementById("minutesGrid");

  if (!minutesGrid) {
    console.error("Meeting minutes grid is missing from the DOM.");
    return;
  }

  // Fetch meeting minutes data from Firestore
  try {
    const querySnapshot = await getDocs(collection(db, "MeetingMinutes"));
    querySnapshot.forEach(async (doc) => {
      const minuteData = doc.data(); // Document data
      const title = minuteData.title;
      const pdfURL = minuteData.pdfURL; // This should be the Firebase Storage path

      // Log to check if the pdfURL is correct
      console.log('pdfURL:', pdfURL);

      // Reference to the file in Firebase Storage
      const pdfRef = ref(storage, pdfURL);

      try {
        // Get the download URL for the file from Firebase Storage
        const fullpdfURL = await getDownloadURL(pdfRef);
        console.log('Full URL:', fullpdfURL); // Log the full URL for verification

        // Create a grid tile for each meeting minute
        const tile = document.createElement("div");
        tile.classList.add("meeting-minute-tile");
        tile.innerHTML = `
         <h3>${title}</h3>
         <a href="${fullpdfURL}" target="_blank">View PDF</a>
       `;

        minutesGrid.appendChild(tile);
      } catch (error) {
        console.error('Error fetching download URL: ', error);
      }
    });
  } catch (error) {
    console.error("Error fetching meeting minutes: ", error);
  }
});

// Get modal and addMeetingTile elements
var modal = document.getElementById("addMeetingModal");
var addMeetingTile = document.getElementById("addMeetingTile");
var closeOutButton = document.getElementById("closeOutButton");

// When the "Add" tile is clicked, open the modal
addMeetingTile.onclick = function() {
  modal.style.display = "block";
}

// When the "Close Out" button is clicked, close the modal without saving
closeOutButton.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
