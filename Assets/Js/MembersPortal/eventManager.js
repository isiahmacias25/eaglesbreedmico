document.addEventListener('DOMContentLoaded', () => {
  const fieldSelector = document.getElementById('fieldSelector');
  const locationField = document.getElementById('locationField');
  const flyerField = document.getElementById('flyerField');
  const notesField = document.getElementById('notesField');
  const noteInput = document.getElementById('noteInput');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const noteList = document.getElementById('noteList');
  const eventSelector = document.getElementById('eventSelector');

  // Populate events (replace with your DB call)
  const exampleEvents = [
    { id: 'evt1', name: 'Poker Run 2025' },
    { id: 'evt2', name: 'Charity Ride July' },
    { id: 'evt3', name: 'Monthly Meeting August' }
  ];
  exampleEvents.forEach(event => {
    const opt = document.createElement('option');
    opt.value = event.id;
    opt.textContent = event.name;
    eventSelector.appendChild(opt);
  });

  // Show/hide fields based on selection
  fieldSelector.addEventListener('change', () => {
    locationField.classList.add('hidden');
    flyerField.classList.add('hidden');
    notesField.classList.add('hidden');

    if (fieldSelector.value === 'location') locationField.classList.remove('hidden');
    if (fieldSelector.value === 'flyer') flyerField.classList.remove('hidden');
    if (fieldSelector.value === 'notes') notesField.classList.remove('hidden');
  });

  // Add note
  addNoteBtn.addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
      const li = document.createElement('li');
      li.textContent = text;
      noteList.appendChild(li);
      noteInput.value = '';
    }
  });

  // Submit handler
  document.getElementById('updateEventForm').addEventListener('submit', e => {
    e.preventDefault();
    const selectedEvent = eventSelector.value;
    const selectedField = fieldSelector.value;

    if (!selectedEvent || !selectedField) {
      alert('Please select an event and what you want to update.');
      return;
    }

    // Mock submit action — replace with Firebase or backend logic
    alert(`Updating ${selectedField} for ${selectedEvent}`);
    // Example: send data to Firestore
  });
});
