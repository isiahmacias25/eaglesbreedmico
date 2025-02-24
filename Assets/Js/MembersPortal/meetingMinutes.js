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
    minutesGrid.innerHTML = ""; // Clear previous content

    const querySnapshot = await getDocs(collection(db, 'MeetingMinutes'));

    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        const title = data.title;
        const fileName = data.fileName; // Ensure Firestore has `fileName` field

        // Get secure download URL from Firebase Storage
        const fileRef = ref(storage, `MeetingMinutes/${fileName}`);
        try {
            const pdfURL = await getDownloadURL(fileRef);

            // Create grid item
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');

            const link = document.createElement('a');
            link.href = pdfURL;
            link.textContent = title;
            link.target = "_blank";

            gridItem.appendChild(link);
            minutesGrid.appendChild(gridItem);
        } catch (error) {
            console.error("Error getting PDF URL:", error);
        }
    });
};

// Ensure user is logged in before loading data
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadMeetingMinutes();
    } else {
        alert("You must be logged in to view meeting minutes.");
        window.location.href = "/login.html
