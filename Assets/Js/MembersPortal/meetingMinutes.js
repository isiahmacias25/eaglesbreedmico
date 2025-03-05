import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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

document.addEventListener("DOMContentLoaded", async function () {
  // Get the grid element for the current year (e.g., "2024Minutes" for 2024)
  const currentYear = window.location.pathname.match(/(\d{4})/);
  if (!currentYear) {
    console.error("Year not found in URL.");
    return;
  }
  
  const year = currentYear[0];
  const minutesGrid = document.getElementById(`${year}Minutes`);

  if (!grid-container) {
    console.error(`Grid for year ${year} not found.`);
    return;
  }

  try {
    // Query Firestore for meeting minutes in the selected year
    const q = query(collection(db, `MeetingMinutes/MeetingMinutes/${year}`), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      minutesGrid.innerHTML = `<p>No meeting minutes found for ${year}.</p>`;
      return;
    }

    // For each document, display a tile in the grid
    querySnapshot.forEach(async (doc) => {
      const minuteData = doc.data();
      const title = minuteData.title;
      const pdfURL = minuteData.pdfURL; // Firebase Storage path
      const meetingDate = minuteData.date.toDate(); // Convert Firestore timestamp to JavaScript Date object 

      // Format date (e.g., "November 10, 2024")
      const formattedDate = meetingDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      try {
        // Fetch actual download URL from Firebase Storage
        const pdfRef = ref(storage, pdfURL);
        const fullpdfURL = await getDownloadURL(pdfRef);

        // Create a tile for each meeting minute and add it to the grid
        const tile = document.createElement("div");
        tile.classList.add("meeting-minute-tile");
        tile.innerHTML = `
          <h3>${title}</h3>
          <p>${formattedDate}</p>
          <a href="${fullpdfURL}" target="_blank">View PDF</a>
        `;

        minutesGrid.appendChild(tile);
      } catch (error) {
        console.error("Error fetching download URL:", error);
      }
    });
  } catch (error) {
    console.error("Error fetching meeting minutes:", error);
  }
});
