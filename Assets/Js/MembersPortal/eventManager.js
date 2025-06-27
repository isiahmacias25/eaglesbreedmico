import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

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
const storage = getStorage(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User signed in:", user.uid);
  } else {
    currentUser = null;
    alert("Please log in to access the event manager.");
    window.location.href = "/MembersPortal/membersPortal.html";
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const fieldSelector = document.getElementById('fieldSelector');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const eventList = document.getElementById('eventList');
  const eventSelector = document.getElementById('eventSelector');

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

  function clearOptions() {
    eventList.innerHTML = '';
    eventSelector.innerHTML = '<option value="">-- Select an Event --</option>';
  }

  async function loadEvents() {
    clearOptions();
    try {
      const snapshot = await getDocs(collection(db, "Events"));
      if (snapshot.empty) {
        console.log("No events found.");
        return;
      }
      snapshot.forEach(docSnap => {
        const event = docSnap.data();
        const title = event.title || 'Untitled Event';
        const id = docSnap.id;

        const opt = document.createElement('option');
        opt.value = title;
        opt.dataset.id = id;
        eventList.appendChild(opt);

        const selOpt = document.createElement('option');
        selOpt.value = id;
        selOpt.textContent = title;
        eventSelector.appendChild(selOpt);
      });
      console.log('Events loaded successfully.');
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  await loadEvents();

  function hideAllFields() {
    Object.values(fields).forEach(el => el.classList.add('hidden'));
  }

  fieldSelector.addEventListener('change', () => {
    hideAllFields();
    const val = fieldSelector.value;
    if (fields[val]) fields[val].classList.remove('hidden');
  });

  addNoteBtn.addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
      const li = document.createElement('li');
      li.textContent = text;
      noteList.appendChild(li);
      noteInput.value = '';
    }
  });

  document.getElementById('updateEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedEventId = eventSelector.value.trim() || (() => {
      const selectedEventName = eventSearchInput.value.trim();
      const option = Array.from(eventList.options).find(opt => opt.value === selectedEventName);
      return option?.dataset.id || null;
    })();

    if (!selectedEventId) {
      alert('Please select a valid event.');
      return;
    }

    const selectedField = fieldSelector.value;
    if (!selectedField) {
      alert('Please select what you want to update.');
      return;
    }

    let eventTitle = 'the event';
    try {
      const eventDocSnap = await getDoc(doc(db, "Events", selectedEventId));
      if (eventDocSnap.exists()) {
        eventTitle = eventDocSnap.data().title || eventTitle;
      }
    } catch (err) {
      console.warn("Couldn't fetch event title for alert", err);
    }

    if (selectedField === 'delete') {
      const confirmDelete = confirm(`Are you sure you want to delete "${eventTitle}"? This cannot be undone.`);
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "Events", selectedEventId));
        alert(`Event "${eventTitle}" deleted.`);
        await loadEvents();
        document.getElementById('updateEventForm').reset();
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event. Check console for details.");
      }
      return;
    }

    const updateData = {};

    console.log("Selected field for update:", selectedField);

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
        const flyerFile = document.getElementById('updateFlyerFile').files[0];
        console.log("Flyer chosen: ", flyerFile);
        if (!flyerFile) {
          alert("Please choose a file.");
          return;
        }

        const flyerRef = ref(storage, `flyers/${selectedEventId}_${flyerFile.name}`);
        try {
          const snap = await uploadBytes(flyerRef, flyerFile);
          const url = await getDownloadURL(snap.ref);
          updateData.flyerUrl = url;
        } catch (err) {
          console.error("Flyer upload failed:", err);
          alert("Flyer upload failed. Check console for details.");
          return;
        }
        break;
      case 'notes':
        const notes = [];
        noteList.querySelectorAll('li').forEach(li => notes.push(li.textContent));
        updateData.notes = notes;
        break;
      case 'archive':
        updateData.archived = document.getElementById('archiveEvent').checked;
        break;
      default:
        alert('Unknown update field.');
        return;
    }

    if (Object.keys(updateData).length === 0) {
      alert('Nothing to update.');
      return;
    }

    try {
      const eventRef = doc(db, "Events", selectedEventId);
      await updateDoc(eventRef, updateData);
      alert(`Successfully updated ${selectedField} for "${eventTitle}".`);
      console.log(`Updated ${selectedField} for event ID: ${selectedEventId}`, updateData);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Check console for details.");
    }
  });

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

      const opt = document.createElement('option');
      opt.value = newEvent.title;
      opt.dataset.id = docRef.id;
      eventList.appendChild(opt);

      const selOpt = document.createElement('option');
      selOpt.value = docRef.id;
      selOpt.textContent = newEvent.title;
      eventSelector.appendChild(selOpt);
    } catch (err) {
      console.error("Error creating event: ", err);
      alert("Error creating event. Check console for details.");
    }
  });
});
