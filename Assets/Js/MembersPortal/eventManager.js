import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config & init
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
const auth = getAuth(app);

let currentUser = null;

// Wait for auth state before enabling event creation
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User is signed in:", user.uid);
  } else {
    currentUser = null;
    console.log("No user signed in. Redirecting to login...");
    alert("Please log in to access the event manager.");
    window.location.href = "/MembersPortal/membersPortal.html";
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Cached DOM elements
  const fieldSelector = document.getElementById('fieldSelector');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const eventList = document.getElementById('eventList');
  
  const fields = {
    who: document.getElementById('whoField'),
    reason: document.getElementById('reasonField'),
    eventType: document.getElementById('eventTypeField'),
    description: document.getElementById('descriptionField'),
    date: document.getElementById('dateField'),
    time: document.getElementById('timeField'),
    location: document.getElementById('locationField'),
    type: document.getElementById('typeField'),
    flyer: document.getElementById('flyerField'),
    notes: document.getElementById('notesField'),
    archive: document.getElementById('archiveField'),
    title: document.getElementById('titleField')
  };

  const noteInput = document.getElementById('noteInput');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const noteList = document.getElementById('noteList');

  // Fetch real events from Firestore and populate datalist
  if (eventList) {
    try {
      const eventsSnapshot = await getDocs(collection(db, "Events"));
      if (eventsSnapshot.empty) {
        console.log("No events found in Firestore.");
      } else {
        eventsSnapshot.forEach(doc => {
          const event = doc.data();
          const opt = document.createElement('option');
          opt.value = event.title || `Untitled event (${doc.id})`; // fallback
          opt.dataset.id = doc.id; // Firestore doc ID
          eventList.appendChild(opt);
        });
      }
    } catch (error) {
      console.error("Error fetching events from Firestore:", error);
    }
  }

  // Hide all update fields initially
  function hideAllFields() {
    Object.values(fields).forEach(el => el.classList.add('hidden'));
  }

  // Show only selected update field section
  fieldSelector.addEventListener('change', () => {
    hideAllFields();
    const val = fieldSelector.value;
    if (fields[val]) fields[val].classList.remove('hidden');
  });

  // Add note to notes list
  addNoteBtn.addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
      const li = document.createElement('li');
      li.textContent = text;
      noteList.appendChild(li);
      noteInput.value = '';
    }
  });

  // UPDATE EVENT FORM SUBMIT
  document.getElementById('updateEventForm').addEventListener('submit', e => {
    e.preventDefault();

    const selectedEventName = eventSearchInput.value.trim();
    const eventMatch = Array.from(eventList.options).find(opt => opt.value === selectedEventName);
    if (!eventMatch) {
      alert('Please select a valid event.');
      return;
    }
    const selectedEventId = eventMatch.dataset.id;

    const selectedField = fieldSelector.value;
    if (!selectedField) {
      alert('Please select what you want to update.');
      return;
    }

    const updateData = { eventId: selectedEventId };

    switch (selectedField) {
      case 'title':
        updateData.title = document.getElementById('updateTitle').value.trim();
        break;
      case 'who':
        updateData.beneficiary = document.getElementById('updateWho').value.trim();
        break;
      case 'reason':
        updateData.reason = document.getElementById('updateReason').value.trim();
        break;
      case 'eventType':
        updateData.eventType = document.getElementById('updateEventType').value.trim();
        break;
      case 'description':
        updateData.description = document.getElementById('updateDescription').value.trim();
        break;
      case 'date':
        updateData.date = document.getElementById('updateDate').value;
        break;
      case 'time':
        updateData.time = document.getElementById('updateTime').value.trim();
        break;
      case 'location':
        updateData.location = document.getElementById('updateLocation').value.trim();
        break;
      case 'type':
        updateData.type = document.getElementById('updateType').value;
        break;
      case 'flyer':
        updateData.flyer = document.getElementById('flyerUpload').files[0] || null;
        break;
      case 'notes':
        const notes = [];
        noteList.querySelectorAll('li').forEach(li => notes.push(li.textContent));
        updateData.notes = notes;
        break;
      case 'archive':
        updateData.archive = document.getElementById('archiveEvent').checked;
        break;
      default:
        break;
    }

    console.log('Update payload:', updateData);
    alert(`Updating ${selectedField} for event ID ${selectedEventId}`);
  });

  // CREATE EVENT FORM SUBMIT
  document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to create events.");
      return;
    }

    const title = document.getElementById('createTitle').value.trim();
    const who = document.getElementById('createWho').value.trim();
    const reason = document.getElementById('createReason').value.trim();
    const eventType = document.getElementById('createEventType').value.trim();
    const description = document.getElementById('createDescription').value.trim();
    const date = document.getElementById('createDate').value;
    const time = document.getElementById('createTime').value.trim();
    const location = document.getElementById('createLocation').value.trim();
    const type = document.getElementById('createType').value;

    if (!title) {
      alert('Title is required!');
      return;
    }

    const newEvent = {
      title,
      who: who || null,
      reason: reason || null,
      eventType: eventType || null,
      description: description || null,
      date: date || null,
      time: time || null,
      location: location || null,
      type: type || null,
      flyerUrl: null,
      notes: [],
      archived: false,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, "Events"), newEvent);
      console.log("Event created with ID: ", docRef.id);
      alert(`Event "${title}" created successfully!`);
      document.getElementById('createEventForm').reset();

      // Add new event to datalist immediately
      const opt = document.createElement('option');
      opt.value = newEvent.title;
      opt.dataset.id = docRef.id;
      eventList.appendChild(opt);
    } catch (err) {
      console.error("Error creating event: ", err);
      alert("Error creating event. Check console for details.");
    }
  });

});
