document.addEventListener('DOMContentLoaded', () => {
  const fieldSelector = document.getElementById('fieldSelector');
  const eventSelector = document.getElementById('eventSelector');

  const fields = {
    beneficiary: document.getElementById('beneficiaryField'),
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

  // Populate eventSelector dropdown
  const exampleEvents = [
    { id: 'evt1', name: 'Poker Run 2025' },
    { id: 'evt2', name: 'Charity Ride July' },
    { id: 'evt3', name: 'Monthly Meeting August' },
    { id: 'evt4', name: 'Spring Rally' }
  ];
  exampleEvents.forEach(event => {
    const opt = document.createElement('option');
    opt.value = event.id;
    opt.textContent = event.name;
    eventSelector.appendChild(opt);
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

    const selectedEventId = eventSelector.value;
    if (!selectedEventId) {
      alert('Please select an event.');
      return;
    }

    const selectedField = fieldSelector.value;
    if (!selectedField) {
      alert('Please select what you want to update.');
      return;
    }

    const updateData = { eventId: selectedEventId };

    switch (selectedField) {
      case 'beneficiary':
        updateData.beneficiary = document.getElementById('updateBeneficiary').value.trim();
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
