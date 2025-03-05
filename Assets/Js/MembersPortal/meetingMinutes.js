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
  // Get the year from the URL
  const currentYear = window.location.pathname.match(/(\d{4})/);
  
  if (!currentYear) {
    console.error("Year not found in URL.");
    return;
  }
  
  const year = currentYear[0];
  const gridContainer = document.getElementById(`${year}Minutes`);

  if (!gridContainer) {
    console.error(`Grid for year ${year} not found in HTML.`);
    return;
  }

  try {
    // Query Firestore for meeting minutes in the selected year
    const q = query(collection(db, `MeetingMinutes/MeetingMinutes/${year}`), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      gridContainer.innerHTML = `<p>No meeting minutes found for ${year}.</p>`;
      return;
    }

    let meetingData = [];

    // Process each document and store in meetingData
    querySnapshot.forEach((doc) => {
      const minuteData = doc.data();
      const title = minuteData.title;
      const pdfURL = minuteData.pdfURL; // Firebase Storage path
      const meetingDate = minuteData.date.toDate(); // Convert Firestore timestamp to JavaScript Date object

      // Store meeting data
      meetingData.push({ title, pdfURL, meetingDate });
    });

    console.log("Raw meetingData:", meetingData); // Log raw meeting data

    // Sort the meetingData array based on date
    meetingData.sort((a, b) => b.meetingDate - a.meetingDate);

    console.log("Sorted meetingData:", meetingData); // Log sorted meeting data

    // For each document, display a tile in the grid
    meetingData.forEach(async (data) => {
      console.log("Rendering tile:", data); // Log each tile before rendering

      const { title, pdfURL, meetingDate } = data;

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
          <p>Added: ${formattedDate}</p>
          <a href="${fullpdfURL}" target="_blank">View PDF</a>
        `;

        gridContainer.appendChild(tile);
      } catch (error) {
        console.error("Error fetching download URL for:", pdfURL, error);
      }
    });
  } catch (error) {
    console.error("Error fetching meeting minutes:", error);
  }
});
