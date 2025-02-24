import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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

// Function to load meeting minutes
const loadMeetingMinutes = async () => {
    const minutesGrid = document.getElementById('minutesGrid');
    const querySnapshot = await getDocs(collection(db, 'meetingMinutes'));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        
        const link = document.createElement('a');
        link.href = data.pdfURL;
        link.textContent = data.title;
        link.target = "_blank";

        gridItem.appendChild(link);
        minutesGrid.appendChild(gridItem);
    });
};

window.onload = loadMeetingMinutes;
