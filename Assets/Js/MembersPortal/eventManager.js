document.addEventListener('DOMContentLoaded', () => {
  const fieldSelector = document.getElementById('fieldSelector');
  const eventSelector = document.getElementById('eventSelector');

  // All update fields divs, keyed by fieldSelector values
  const fields = {
    responsiblePerson: document.getElementById('responsiblePersonField'),
    reason: document.getElementById('reasonField'),
    eventType: document.getElementById('eventTypeField'),
    description: document.getElementById('descriptionField'),
    date: document.getElementById('dateField'),
    time: document.getElementById('timeField'),
    location: document.getElementById('locationField'),
    type: document.getElementById('typeField'),
    flyer: document.getElementById('flyerField'),
    notes: document.getElementById('notesField'),
    archive: document.getElementById('archiveField')
  };

  const noteInput = document.getElementById('noteInput');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const noteList = document.getElementById('noteList');

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

  // Hide all fields helper
  function hideAllFields() {
    Object.values(fields).forEach(el => el.classList.add('hidden'));
  }

  // Show/hide fields based on selection
  fieldSelector.addEventListener('change', () => {
    hideAllFields();
    const val = fieldSelector.value;
    if (fields[val]) {
      fields[val].classList.remove('hidden');
    }
  });

  // Add note button handler
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

    // Build data object based on selected field
    const updateData = { eventId: selectedEvent };

    switch (selectedField) {
      case 'responsiblePerson':
        updateData.responsiblePerson = document.getElementById('updateResponsiblePerson').value.trim();
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
        // handle file upload separately in real impl
        updateData.flyer = document.getElementById('flyerUpload').files[0] || null;
        break;
      case 'notes':
        // collect notes from list items
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

    // Debug output — replace with your backend call or Firebase logic
    console.log('Update payload:', updateData);
    alert(`Updating ${selectedField} for event ID ${selectedEvent}`);

    // Clear inputs for that field after update (optional)
  });
});
