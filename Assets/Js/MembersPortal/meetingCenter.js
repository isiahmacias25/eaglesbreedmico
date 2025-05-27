import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 
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


  try {
    // Query Firestore for meeting minutes in the selected year, ordered by date (descending)
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
      const meetingDate = minuteData.date; // Directly use the raw date from Firestore

      console.log("Document data:", minuteData); // Debugging the document data

      // Ensure meetingDate is a Timestamp and convert it to Date
      if (meetingDate && meetingDate.seconds) {
        const formattedDate = new Date(meetingDate.seconds * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        meetingData.push({ title, pdfURL, formattedDate });
      } else {
        console.error("Invalid date field in Firestore document:", minuteData);
      }
    });

    if (meetingData.length === 0) {
      gridContainer.innerHTML = `<p>No valid meeting minutes found for ${year}.</p>`;
      return;
    }

    // For each document, display a tile in the grid
    meetingData.forEach(async (data) => {
      const { title, pdfURL, formattedDate } = data;

      // Fetch actual download URL from Firebase Storage
      try {
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
