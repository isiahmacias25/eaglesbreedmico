import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com", // Fix storage bucket URL
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Add Storage

// Function to load meeting minutes
const loadMeetingMinutes = async () => {
    const minutesGrid = document.getElementById('minutesGrid');
    const querySnapshot = await getDocs(collection(db, 'meetingMinutes'));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        
        // Create the link element
        const link = document.createElement('a');
        link.href = data.pdfURL;  // Use the pdfURL from Firestore
        link.textContent = data.title;  // Use the title from Firestore
        link.target = "_blank";  // Open in a new tab

        // Append the link to the grid item
        gridItem.appendChild(link);

        // Add the grid item to the grid container
        minutesGrid.appendChild(gridItem);
    });
};

// Trigger the loading function when the page loads
window.onload = loadMeetingMinutes;
