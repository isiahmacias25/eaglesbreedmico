document.addEventListener("DOMContentLoaded", () => {
  // === DOM ELEMENTS ===
  const monthButtons = document.querySelectorAll(".month-btn");
  const popup = document.getElementById("calendar-popup");
  const closeBtn = document.querySelector(".close-btn");
  const calendarDiv = document.getElementById("calendar");
  const monthTitle = document.getElementById("popup-month-title");

  // Month names array
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // === UTILS ===
  const getDaysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();
  const getFirstDayOfMonth = (year, monthIndex) => new Date(year, monthIndex, 1).getDay();

  // === MONTH BUTTON CLICK HANDLER ===
  monthButtons.forEach(button => {
    button.addEventListener("click", () => {
      const monthStr = button.getAttribute("data-month");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const year = 2025; // hardcoded per your original code

      monthTitle.textContent = `${months[monthIndex]} ${year}`;
      generateCalendar(monthIndex, year);
      popup.style.display = "block";
    });
  });

  // === POPUP CLOSE ===
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  // === GENERATE CALENDAR ===
  async function generateCalendar(monthIndex, year = new Date().getFullYear()) {
    // Clear calendar, add weekdays header
    calendarDiv.innerHTML = `
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    `;

    const firstDay = getFirstDayOfMonth(year, monthIndex);
    const totalDays = getDaysInMonth(year, monthIndex);

    // Load events once from Firestore
    const db = firebase.firestoreInstance;
    const eventsSnap = await getDocs(collection(db, "Events"));

    // Group events by day for current month/year
    const eventsByDate = {};
    eventsSnap.forEach(doc => {
      const data = doc.data();
      if (!data.date) return; // safety check
      const eventDate = new Date(data.date);
      if (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === monthIndex
      ) {
        const day = eventDate.getDate();
        eventsByDate[day] = (data.type || "public").toLowerCase();
      }
    });

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      calendarDiv.innerHTML += `<div></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const eventType = eventsByDate[day];
      let color = "white";
      if (eventType === "public") color = "#000";          // black
      else if (eventType === "members") color = "#2980b9"; // blue
      else if (eventType === "officers") color = "#c0392b"; // red

      const style = eventType ? `style="background:${color}; color:white;"` : "";

      if (eventType) {
        calendarDiv.innerHTML += `
          <div class="calendar-day" data-day="${day}" data-month="${monthIndex + 1}" data-year="${year}" data-type="${eventType}" ${style}>
            ${day}
          </div>`;
      } else {
        calendarDiv.innerHTML += `<div>${day}</div>`;
      }
    }

    // Add click listeners to days with events
    calendarDiv.querySelectorAll(".calendar-day").forEach(cell => {
      cell.addEventListener("click", async () => {
        const day = cell.getAttribute("data-day");
        const month = cell.getAttribute("data-month").padStart(2, "0");
        const year = cell.getAttribute("data-year");

        const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;

        try {
          // Use global firestore instance
          const querySnapshot = await getDocs(collection(db, "Events"));
          let foundEvent = null;

          querySnapshot.forEach(docSnap => {
            const event = docSnap.data();
            if (event.date === dateStr && !foundEvent) {
              foundEvent = { ...event, id: docSnap.id };
            }
          });

          if (!foundEvent) {
            alert("No event found on this day.");
            return;
          }

          const modal = document.getElementById("eventModal");
          const modalBody = document.getElementById("eventModalBody");
          const accessType = (foundEvent.type || "public").toLowerCase();

          const flyer = foundEvent.flyerUrl
            ? `<p><strong>Flyer:</strong> <a href="${foundEvent.flyerUrl}" target="_blank">View Flyer</a></p>`
            : "";

          const notesHtml = foundEvent.notes?.length
            ? `<div><strong>Notes:</strong><ul>${foundEvent.notes
                .map(note => `<li>${note}</li>`)
                .join("")}</ul></div>`
            : "";

          modalBody.innerHTML = `
            <h2>${foundEvent.title || "Untitled Event"}</h2>
            <p><strong>Beneficiary:</strong> ${foundEvent.who || "N/A"}</p>
            <p><strong>Purpose:</strong> ${foundEvent.reason || "N/A"}</p>
            <p><strong>Event Type:</strong> ${foundEvent.eventType || "N/A"}</p>
            <p><strong>Description:</strong> ${foundEvent.description || "N/A"}</p>
            <p><strong>Date:</strong> ${foundEvent.date || "N/A"}</p>
            <p><strong>Time:</strong> ${foundEvent.time || "N/A"}</p>
            <p><strong>Location:</strong> ${foundEvent.location || "N/A"}</p>
            <p class="access-${accessType}"><strong>Access:</strong> ${foundEvent.type || "N/A"}</p>
            <p><strong>Archived:</strong> ${foundEvent.archived ? "Yes" : "No"}</p>
            ${flyer}
            ${notesHtml}
          `;

          modal.classList.remove("modal-public", "modal-members", "modal-officers");
          modal.classList.add(`modal-${accessType}`);
          modal.classList.add("active");
        } catch (err) {
          console.error("Error opening event modal:", err);
          alert("Something went wrong loading this event.");
        }
      });
    });
  }

  // === VIEW EVENT LOGIC ===
  import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js").then(({ initializeApp }) => {
    import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js").then(
      ({ getFirestore, collection, getDocs, doc, getDoc }) => {
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
        firebase.firestoreInstance = db; // Store globally for reuse

        // Elements for view event modal
        const viewBtn = document.getElementById("viewEventBtn");
        const viewSelect = document.getElementById("viewEventSelector");
        const modal = document.getElementById("eventModal");
        const modalBody = document.getElementById("eventModalBody");
        const closeModal = document.getElementById("closeModal");
        const printBtn = document.getElementById("printEventBtn");
        const downloadBtn = document.getElementById("downloadEventBtn");

        let lastViewedEventHTML = "";

        // Populate dropdown with events
        async function populateViewEventSelector() {
          try {
            const querySnapshot = await getDocs(collection(db, "Events"));
            querySnapshot.forEach(docSnap => {
              const event = docSnap.data();
              const option = document.createElement("option");
              option.value = docSnap.id;
              option.textContent = event.title || "Untitled Event";
              viewSelect.appendChild(option);
            });
          } catch (error) {
            console.error("Failed to load events for selector:", error);
          }
        }
        populateViewEventSelector();

        // Debug logs
        console.log("View Button:", viewBtn);
        console.log("View Selector:", viewSelect);

        // Show modal for selected event
        viewBtn?.addEventListener("click", async () => {
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

            const flyer = event.flyerUrl
              ? `<p><strong>Flyer:</strong> <a href="${event.flyerUrl}" target="_blank">View Flyer</a></p>`
              : "";

            const accessType = (event.type || "public").toLowerCase();

            const notesHtml = event.notes?.length
              ? `<div><strong>Notes:</strong><ul>${event.notes
                  .map(note => `<li>${note}</li>`)
                  .join("")}</ul></div>`
              : "";

            const html = `
              <h2>${event.title || "Untitled Event"}</h2>
              <p><strong>Beneficiary:</strong> ${event.who || "N/A"}</p>
              <p><strong>Purpose:</strong> ${event.reason || "N/A"}</p>
              <p><strong>Event Type:</strong> ${event.eventType || "N/A"}</p>
              <p><strong>Description:</strong> ${event.description || "N/A"}</p>
              <p><strong>Date:</strong> ${event.date || "N/A"}</p>
              <p><strong>Time:</strong> ${event.time || "N/A"}</p>
              <p><strong>Location:</strong> ${event.location || "N/A"}</p>
              <p class="access-${accessType}"><strong>Access:</strong> ${event.type || "N/A"}</p>
              <p><strong>Archived:</strong> ${event.archived ? "Yes" : "No"}</p>
              ${flyer}
              ${notesHtml}
            `;

            modalBody.innerHTML = html;
            lastViewedEventHTML = html;

            modal.classList.remove("modal-public", "modal-members", "modal-officers");
            if (["public", "members", "officers"].includes(accessType)) {
              modal.classList.add(`modal-${accessType}`);
            } else {
              modal.classList.add("modal-public");
            }
            modal.classList.add("active");
          } catch (err) {
            console.error("Error loading event:", err);
            alert("Failed to load event.");
          }
        });

        // Close modal logic
        closeModal?.addEventListener("click", () => modal.classList.remove("active"));
        window.addEventListener("click", e => {
          if (e.target === modal) modal.classList.remove("active");
        });

        // Print event content
        printBtn?.addEventListener("click", () => {
          const printWindow = window.open("", "", "width=800,height=600");
          printWindow.document.write(
            `<!DOCTYPE html><html><head><title>Event</title></head><body>${lastViewedEventHTML}</body></html>`
          );
          printWindow.document.close();
          printWindow.print();
        });

        // Download event content as HTML
        downloadBtn?.addEventListener("click", () => {
          const blob = new Blob([lastViewedEventHTML], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "event.html";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }
    );
  });
});
