document.addEventListener('DOMContentLoaded', () => {
  const fieldSelector = document.getElementById('fieldSelector');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const eventList = document.getElementById('eventList');

  const fields = {
    beneficiary: document.getElementById('whoField'),
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

  // Example events for datalist
  const exampleEvents = [
    { id: 'evt1', name: 'Poker Run 2025' },
    { id: 'evt2', name: 'Charity Ride July' },
    { id: 'evt3', name: 'Monthly Meeting August' },
    { id: 'evt4', name: 'Spring Rally' }
  ];

  // Populate datalist for event search
  exampleEvents.forEach(event => {
    const opt = document.createElement('option');
    opt.value = event.name;
    opt.dataset.id = event.id;
    eventList.appendChild(opt);
  });

  function hideAllFields() {
    Object.values(fields).forEach(el => el.classList.add('hidden'));
  }

  fieldSelector.addEventListener('change', () => {
    hideAllFields();
    const val = fieldSelector.value;
    if (fields[val]) {
      fields[val].classList.remove('hidden');
    }
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
      case 'beneficiary':
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
});
