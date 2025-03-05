import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
  const minutesGrid = document.getElementById("minutesGrid");

  if (!minutesGrid) {
    console.error("Meeting minutes grid is missing from the DOM.");
    return;
  }

  try {
    // Get all years from Firestore (subcollections under MeetingMinutes)
    const yearsSnapshot = await getDocs(collection(db, "MeetingMinutes"));

    for (const yearDoc of yearsSnapshot.docs) {
      const year = yearDoc.id; // Get the year as a string (e.g., "2024", "2025")

      // Fetch all meeting minutes for that year
      const q = query(collection(db, `MeetingMinutes/${year}`));
      const querySnapshot = await getDocs(q);

      let minutesArray = [];

      querySnapshot.forEach((doc) => {
        const minuteData = doc.data();
        const title = minuteData.title;
        const pdfURL = minuteData.pdfURL;
        const docName = doc.id; // The document name (e.g., "november-10-2024-monthly-meeting-minutes")

        // Extract the date from the document name (e.g., "november-10-2024")
        const dateMatch = docName.match(/(\w+)-(\d+)-(\d{4})/); // Match "november-10-2024"
        if (!dateMatch) {
          console.warn(`Skipping document with invalid name format: ${docName}`);
          return;
        }

        const [, monthName, day, year] = dateMatch;
        const formattedDate = new Date(`${monthName} ${day}, ${year}`);

        minutesArray.push({
          title,
          pdfURL,
          formattedDate,
          docName,
        });
      });

      // Sort by date (newest first)
      minutesArray.sort((a, b) => b.formattedDate - a.formattedDate);

      // Add sorted minutes to the page
      minutesArray.forEach(async (minute) => {
        try {
          const pdfRef = ref(storage, minute.pdfURL);
          const fullpdfURL = await getDownloadURL(pdfRef);

          const tile = document.createElement("div");
          tile.classList.add("meeting-minute-tile");
          tile.innerHTML = `
            <h3>${minute.title}</h3>
            <p>${minute.formattedDate.toDateString()}</p>
            <a href="${fullpdfURL}" target="_blank">View PDF</a>
          `;

          minutesGrid.appendChild(tile);
        } catch (error) {
          console.error("Error fetching download URL:", error);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching meeting minutes:", error);
  }
});
