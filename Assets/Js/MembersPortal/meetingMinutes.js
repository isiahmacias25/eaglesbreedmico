import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

// Initialize Firebase (Prevent duplicate initialization)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", async function () {
  const minutesGrid = document.getElementById("minutesGrid");
  const modal = document.getElementById("addMeetingModal");
  const addMeetingTile = document.getElementById("addMeetingTile");
  const closeOutButton = document.getElementById("closeOutButton");
  const meetingForm = document.getElementById("addMeetingMinuteForm");
  const loadingElement = document.getElementById('loading');

  if (!minutesGrid) {
    console.error("Meeting minutes grid is missing from the DOM.");
    return;
  }

  // Load existing meeting minutes
  async function loadMeetingMinutes() {
    minutesGrid.innerHTML = ""; // Clear grid before loading

    // Show loading spinner while fetching data
    loadingElement.style.display = "block";

    // Add "Add Meeting" tile as the first tile
    const addTile = document.createElement("div");
    addTile.classList.add("meeting-minute-tile", "add-tile");
    addTile.onclick = () => modal.style.display = "block";
    minutesGrid.appendChild(addTile);

    // Fetch meeting minutes from Firestore
    try {
      const querySnapshot = await getDocs(collection(db, "MeetingMinutes"));
      querySnapshot.forEach(async (doc) => {
        const minuteData = doc.data();
        const title = minuteData.title;
        const pdfURL = minuteData.pdfURL;

        const pdfRef = ref(storage, pdfURL);
        try {
          const fullpdfURL = await getDownloadURL(pdfRef);
          const tile = document.createElement("div");
          tile.classList.add("meeting-minute-tile");
          tile.innerHTML = `<h3>${title}</h3><a href="${fullpdfURL}" target="_blank">View PDF</a>`;
          minutesGrid.appendChild(tile);
        } catch (error) {
          console.error("Error fetching download URL: ", error);
        }
      });
    } catch (error) {
      console.error("Error fetching meeting minutes: ", error);
    } finally {
      // Hide loading spinner once data is loaded
      loadingElement.style.display = "none";
    }
  }

  // Open the modal when clicking the "Add Meeting" tile
  addMeetingTile.onclick = () => modal.classList.add("show");

  // Close modal without saving
  closeOutButton.onclick = () => modal.classList.remove("show");

  // Close modal when clicking outside it
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.classList.remove("show");
    }
  };

  // Handle form submission to add a new meeting minute
  meetingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("title");
    const fileInput = document.getElementById("file");
    const title = titleInput.value.trim();
    const file = fileInput.files[0];

    if (!title || !file) {
      alert("Please enter a title and upload a PDF.");
      return;
    }

    try {
      // Upload PDF to Firebase Storage
      const fileRef = ref(storage, `meetingMinutes/${file.name}`);
      await uploadBytes(fileRef, file);
      const pdfURL = await getDownloadURL(fileRef);

      // Save title & PDF URL in Firestore
      await addDoc(collection(db, "MeetingMinutes"), { title, pdfURL });

      // Close modal, reset form, and reload the grid
      modal.classList.remove("show");
      meetingForm.reset();
      loadMeetingMinutes();
    } catch (error) {
      console.error("Error uploading file or saving to Firestore:", error);
    }
  });

  // Load meeting minutes on page load
  loadMeetingMinutes();
});
