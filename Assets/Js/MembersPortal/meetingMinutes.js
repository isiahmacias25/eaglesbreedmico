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

// Function to load meeting minutes
const loadMeetingMinutes = async () => {
    const minutesGrid = document.getElementById('minutesGrid');
    if (!minutesGrid) {
        console.error("Error: 'minutesGrid' not found in DOM.");
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'meetingMinutes'));

        if (querySnapshot.empty) {
            minutesGrid.innerHTML = "<p>No meeting minutes available.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');

            const link = document.createElement('a');
            link.href = data.pdfURL;
            link.textContent = data.title || "Meeting Minutes"; // Default title if missing
            link.target = "_blank";

            gridItem.appendChild(link);
            minutesGrid.appendChild(gridItem);
        });
    } catch (error) {
        console.error("Error loading meeting minutes:", error);
        minutesGrid.innerHTML = "<p>Error loading meeting minutes.</p>";
    }
};

// Ensure script runs when the pag
