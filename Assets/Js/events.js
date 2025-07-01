document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js"),
  ]).then(([{ initializeApp }, { getFirestore, collection, getDocs, doc, getDoc }, { getAuth, onAuthStateChanged }]) => {

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
    const db = getFirestore(app);
    const auth = getAuth(app);

    const monthButtons = document.querySelectorAll(".month-btn");
    const popup = document.getElementById("calendar-popup");
    const closeBtn = document.querySelector(".close-btn");
    const calendarDiv = document.getElementById("calendar");
    const monthTitle = document.getElementById("popup-month-title");

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    function getDaysInMonth(year, monthIndex) {
      return new Date(year, monthIndex + 1, 0).getDate();
    }

    let currentUserRole = null; // 'officers', 'members', or null if not logged in

    async function fetchUserRole(uid) {
      try {
        const userDoc = await getDoc(doc(db, "Users", uid));
        console.log("Fetched doc:", userDoc.exists(), userDoc.data()); // <-- this will help

        if (userDoc.exists()) {
          return userDoc.data().role || null;
        }
      } catch (e) {
        console.error("Error fetching user role:", e);
      }
      return null;
    }

    // Create a promise that resolves once user role is ready
    let roleReadyResolve;
    const roleReady = new Promise((resolve) => {
      roleReadyResolve = resolve;
    });

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUserRole = await fetchUserRole(user.uid);
      } else {
        currentUserRole = null;
      }
      roleReadyResolve();
    });

    // Disable buttons until role is ready
    monthButtons.forEach(btn => btn.disabled = true);

    roleReady.then(() => {
      monthButtons.forEach(btn => btn.disabled = false);
    });

    async function generateCalendar(month, year) {
      calendarDiv.innerHTML = `
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      `;

      const totalDays = getDaysInMonth(year, month - 1);
      const firstDay = new Date(year, month - 1, 1).getDay();

      const eventsSnap = await getDocs(collection(db, "Events"));
      const eventsByDate = {};

      eventsSnap.forEach(doc => {
        const data = doc.data();
        if (!data.date) return;

        const eventDate = new Date(data.date + "T12:00:00");
        const y = eventDate.getFullYear();
        const m = eventDate.getMonth() + 1;
        const d = eventDate.getDate();
        const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        eventsByDate[key] = { ...data, id: doc.id };
      });

      for (let i = 0; i < firstDay; i++) {
        calendarDiv.innerHTML += `<div></div>`;
      }

      for (let day = 1; day <= totalDays; day++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const event = eventsByDate[dateKey];
        const eventType = event?.type?.toLowerCase();

        // Show public events always
        // Show members/officers only if user role matches or is higher priv
        let showEvent = false;
        if (!eventType || eventType === 'public') showEvent = true;
        else if (eventType === 'members' && (currentUserRole === 'members' || currentUserRole === 'officers')) showEvent = true;
        else if (eventType === 'officers' && currentUserRole === 'officers') showEvent = true;

        let color = 'white';
        if (showEvent) {
          if (eventType === 'public') color = '#000';
          else if (eventType === 'members') color = '#2980b9';
          else if (eventType === 'officers') color = '#c0392b';
        }

        const style = showEvent && eventType ? `style="background:${color}; color: white; cursor:pointer;"` : '';
        calendarDiv.innerHTML += `
          <div class="calendar-day" data-date="${dateKey}" ${style} ${showEvent ? '' : 'title="Event hidden: insufficient access"'} >
            ${day}
          </div>`;
      }

      calendarDiv.querySelectorAll(".calendar-day").forEach(cell => {
        cell.addEventListener("click", () => {
          const date = cell.getAttribute("data-date");
          const event = eventsByDate[date];

          if (!event) {
            return;
          }

          const eventType = event?.type?.toLowerCase();
          // Check access again before showing modal
          if (eventType === 'members' && !(currentUserRole === 'Brother' || currentUserRole === 'Officer'|| currentUserRole === 'sister')) {
            alert("You must be logged in as a member or officer to view this event.");
            return;
          }
          if (eventType === 'officers' && currentUserRole !== 'Officer') {
            alert("You must be logged in as an officer to view this event.");
            return;
          }

          const modal = document.getElementById('eventModal');
          const modalBody = document.getElementById('eventModalBody');
          const accessType = (event.type || 'public').toLowerCase();
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
            <p class="access-${accessType}"><strong>Access:</strong> ${event.type || 'N/A'}</p>
            <p><strong>Archived:</strong> ${event.archived ? 'Yes' : 'No'}</p>
            ${flyer}
            ${event.notes?.length ? `
              <div><strong>Notes:</strong><ul>
                ${event.notes.map(note => `<li>${note}</li>`).join('')}
              </ul></div>` : ''}
          `;

          modalBody.innerHTML = html;
          modal.classList.remove('modal-public', 'modal-members', 'modal-officers');
          modal.classList.add(`modal-${accessType}`, 'active');
        });
      });
    }

    monthButtons.forEach(button => {
      button.addEventListener("click", async () => {
        await roleReady; // wait for role ready before generating calendar
        const month = parseInt(button.getAttribute("data-month"));
        const currentYear = new Date().getFullYear();
        monthTitle.textContent = `${months[month - 1]} ${currentYear}`;
        generateCalendar(month, currentYear);
        popup.style.display = "block";
      });
    });

    closeBtn.addEventListener("click", () => popup.style.display = "none");

    const viewBtn = document.getElementById('viewEventBtn');
    const viewSelect = document.getElementById('viewEventSelector');
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('eventModalBody');
    const closeModal = document.getElementById('closeModal');
    const printBtn = document.getElementById('printEventBtn');
    const downloadBtn = document.getElementById('downloadEventBtn');

    let lastViewedEventHTML = "";

    async function populateViewEventSelector() {
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
        console.error("Failed to load events for selector:", error);
      }
    }

    populateViewEventSelector();

    viewBtn?.addEventListener('click', async () => {
      await roleReady; // ensure role is ready before showing event
      const selectedId = viewSelect?.value;
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
        const accessType = (event.type || 'public').toLowerCase();
        if (accessType === 'members' && !(currentUserRole === 'members' || currentUserRole === 'officers')) {
          alert("You must be logged in as a member or officer to view this event.");
          return;
        }
        if (accessType === 'officers' && currentUserRole !== 'officers') {
          alert("You must be logged in as an officer to view this event.");
          return;
        }

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
          <p class="access-${accessType}"><strong>Access:</strong> ${event.type || 'N/A'}</p>
          <p><strong>Archived:</strong> ${event.archived ? 'Yes' : 'No'}</p>
          ${flyer}
          ${event.notes?.length ? `
            <div><strong>Notes:</strong><ul>
              ${event.notes.map(note => `<li>${note}</li>`).join('')}
            </ul></div>` : ''}
        `;

        modalBody.innerHTML = html;
        lastViewedEventHTML = html;
        modal.classList.remove('modal-public', 'modal-members', 'modal-officers');
        modal.classList.add(`modal-${accessType}`, 'active');
      } catch (err) {
        console.error("Error loading event:", err);
        alert("Failed to load event.");
      }
    });

    closeModal?.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    printBtn?.addEventListener('click', () => {
      const content = modalBody?.innerHTML || '';

      if (!content.trim()) {
        alert("No event loaded to print.");
        return;
      }

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Event</title></head><body>${content}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    });

    downloadBtn?.addEventListener('click', () => {
      const content = modalBody?.innerHTML || '';

      if (!content.trim()) {
        alert("No event loaded to download.");
        return;
      }

      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "event.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
});
