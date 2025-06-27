document.addEventListener("DOMContentLoaded", () => {
  // === MONTHLY CALENDAR LOGIC ===
  const monthButtons = document.querySelectorAll(".month-btn");
  const popup = document.getElementById("calendar-popup");
  const closeBtn = document.querySelector(".close-btn");
  const calendarDiv = document.getElementById("calendar");
  const monthTitle = document.getElementById("popup-month-title");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = {
    "01": 31, "02": 28, "03": 31, "04": 30,
    "05": 31, "06": 30, "07": 31, "08": 31,
    "09": 30, "10": 31, "11": 30, "12": 31
  };

  const firstDayOfMonth2025 = {
    "01": 3, "02": 6, "03": 6, "04": 2,
    "05": 4, "06": 7, "07": 2, "08": 5,
    "09": 1, "10": 3, "11": 6, "12": 1
  };

  monthButtons.forEach(button => {
    button.addEventListener("click", () => {
      const month = button.getAttribute("data-month");
      monthTitle.textContent = `${months[parseInt(month) - 1]} 2025`;
      generateCalendar(month);
      popup.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  function generateCalendar(month) {
    calendarDiv.innerHTML = `
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    `;

    const firstDay = firstDayOfMonth2025[month];
    const totalDays = daysInMonth[month];

    for (let i = 0; i < firstDay; i++) {
      calendarDiv.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      calendarDiv.innerHTML += `<div>${day}</div>`;
    }
  }

  // === VIEW EVENT LOGIC ===
  import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js").then(({ initializeApp }) => {
    import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js").then(({ getFirestore, doc, getDoc, collection, getDocs }) => {
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

      const viewBtn = document.getElementById('viewEventBtn');
      const viewSelect = document.getElementById('viewEventSelector');
      const modal = document.getElementById('eventModal');
      const modalBody = document.getElementById('eventModalBody');
      const closeModal = document.getElementById('closeModal');
      const printBtn = document.getElementById('printEventBtn');
      const downloadBtn = document.getElementById('downloadEventBtn');

      let lastViewedEventHTML = "";

      // <-- ADDED: Populate event dropdown on load
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

      closeModal?.addEventListener('click', () => modal.classList.add('hidden'));
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });

      printBtn?.addEventListener('click', () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>Event</title></head><body>${lastViewedEventHTML}</body></html>`);
        printWindow.document.close();
        printWindow.print();
      });

      downloadBtn?.addEventListener('click', () => {
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
    });
  });
});
