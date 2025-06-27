// events.js (make sure <script type="module" src="...events.js"></script> in HTML)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChVYbT54aRIbAHyy_HRsH7caRHyaZwWTA",
  authDomain: "eaglesbreedmico.firebaseapp.com",
  projectId: "eaglesbreedmico",
  storageBucket: "eaglesbreedmico.appspot.com",
  messagingSenderId: "258146487149",
  appId: "1:258146487149:web:c443a6f9af1c929cb6e864",
  measurementId: "G-ZR1P59C7BP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const viewSelect = document.getElementById('viewEventSelector');
  const viewBtn = document.getElementById('viewEventBtn');
  const modal = document.getElementById('eventModal');
  const modalBody = document.getElementById('eventModalBody');
  const closeModal = document.getElementById('closeModal');

  let lastViewedEventHTML = "";

  // Populate dropdown with events
  async function populateEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, "Events"));
      querySnapshot.forEach(docSnap => {
        const event = docSnap.data();
        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = event.title || "Untitled Event";
        viewSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  populateEvents();

  viewBtn.addEventListener('click', async () => {
    const selectedId = viewSelect.value;
    if (!selectedId) {
      alert("Please select an event to view.");
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, "Events", selectedId));
      if (!docSnap.exists()) {
        alert("Event not found.");
        return;
      }

      const event = docSnap.data();
      const flyer = event.flyerUrl ? `<p><strong>Flyer:</strong> <a href="${event.flyerUrl}" target="_blank">View Flyer</a></p>` : "";

      const html = `
        <h2>${event.title || 'Untitled Event'}</h2>
        <p><strong>Beneficiary:</strong> ${event.who || 'N/A'}</p>
        <p><strong>Purpose:</strong> ${event.reason || 'N/A'}</p>
        <p><strong>Event Type:</strong> ${event.eventType || 'N/A'}</p>
        <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
        <p><strong>Date:</strong> ${event.date || 'N/A'}</p>
        <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
        <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
        <p><strong>Access:</strong> ${event.type || 'N/A'}</p>
        <p><strong>Archived:</strong> ${event.archived ? 'Yes' : 'No'}</p>
        ${flyer}
        ${event.notes?.length ? `
          <div><strong>Notes:</strong><ul>
            ${event.notes.map(note => `<li>${note}</li>`).join('')}
          </ul></div>
        ` : ''}
      `;

      modalBody.innerHTML = html;
      lastViewedEventHTML = html;
      modal.classList.remove('hidden');
    } catch (err) {
      console.error("Error loading event:", err);
      alert("Failed to load event.");
    }
  });

  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});
