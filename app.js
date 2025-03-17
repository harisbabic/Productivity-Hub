function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error(`Error loading ${key} from localStorage:`, e);
        return defaultValue;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
        alert('Failed to save data. Check browser storage permissions.');
    }
}

class DataStore {
    constructor(key) {
        this.key = key;
        this.data = loadFromLocalStorage(key);
    }

    add(item) {
        item.id = Date.now();
        this.data.push(item);
        this.save();
    }

    delete(id) {
        this.data = this.data.filter(item => item.id !== id);
        this.save();
    }

    get(id) {
        return this.data.find(item => item.id === id);
    }

    update(id, updatedItem) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updatedItem };
            this.save();
        }
    }

    save() {
        saveToLocalStorage(this.key, this.data);
    }
}

const emails = new DataStore('emails');
const contacts = new DataStore('contacts');
const projects = new DataStore('projects');
const notes = new DataStore('notes');

const tabs = document.querySelectorAll('nav button');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        contents.forEach(c => c.classList.remove('active'));
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(tab.getAttribute('aria-controls')).classList.add('active');
    });
});

// Emails
document.getElementById('email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('email-title').value.trim();
    const category = document.getElementById('email-category').value.trim();
    const template = document.getElementById('email-template').value.trim();
    if (title && template) {
        emails.add({ title, category, template });
        e.target.reset();
        renderEmails();
    }
});

function renderEmail(email) {
    const li = document.createElement('li');
    li.textContent = `${email.title} (${email.category || 'Uncategorized'})`;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => copyToClipboard(email.template, 'Email template copied!'));

    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => openModal('email-view', email.id));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openModal('email-edit', email.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${email.title}"?`)) {
            emails.delete(email.id);
            renderEmails();
        }
    });

    li.appendChild(copyBtn);
    li.appendChild(viewBtn);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    return li;
}

function renderEmails() {
    const emailList = document.getElementById('email-list');
    emailList.innerHTML = '';
    emails.data.forEach(email => emailList.appendChild(renderEmail(email)));
}

// Contacts
function formatPhoneNumber(phone) {
    if (!phone) return 'No phone';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const address = document.getElementById('contact-address').value.trim();
    if (name) {
        contacts.add({ name, email, phone, address });
        e.target.reset();
        renderContacts();
        updateContactDropdowns();
    }
});

function renderContact(contact) {
    const formattedPhone = formatPhoneNumber(contact.phone);
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="tooltip" data-tooltip="Copy" data-copy="${contact.name || 'No name'}">${contact.name || 'No name'}</div><br>
        <div class="tooltip" data-tooltip="Copy" data-copy="${formattedPhone}">${formattedPhone}</div><br>
        <div class="tooltip" data-tooltip="Copy" data-copy="${contact.email || 'No email'}">${contact.email || 'No email'}</div><br>
        <div class="tooltip" data-tooltip="Copy" data-copy="${contact.address || 'No address'}">${contact.address || 'No address'}</div>
    `;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openModal('contact-edit', contact.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${contact.name}"?`)) {
            contacts.delete(contact.id);
            renderContacts();
            updateContactDropdowns();
        }
    });

    const btnContainer = document.createElement('div');
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    li.appendChild(btnContainer);
    return li;
}

function renderContacts() {
    const contactList = document.getElementById('contact-list');
    const searchQuery = document.getElementById('contact-search').value.toLowerCase();
    contactList.innerHTML = '';
    const filteredContacts = contacts.data.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery)
    );
    filteredContacts.forEach(contact => contactList.appendChild(renderContact(contact)));
    addTooltipListeners();
}

document.getElementById('contact-search').addEventListener('input', renderContacts);

// Projects
function updateContactDropdowns() {
    const projectDropdown = document.getElementById('project-contact');
    const projectEditDropdown = document.getElementById('project-edit-contact');
    const noteDropdown = document.getElementById('note-contact');
    const noteEditDropdown = document.getElementById('note-edit-contact');
    const options = `<option value="">None</option>` + 
        contacts.data.map(contact => `<option value="${contact.id}">${contact.name}</option>`).join('');
    projectDropdown.innerHTML = options;
    projectEditDropdown.innerHTML = options;
    noteDropdown.innerHTML = options;
    noteEditDropdown.innerHTML = options;
}

document.getElementById('project-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const startDate = document.getElementById('project-start').value;
    const contactId = document.getElementById('project-contact').value || null;
    if (name) {
        projects.add({ name, description, startDate, status: 'Pending', contactId, tasks: [], reminders: [] });
        e.target.reset();
        renderProjects();
    }
});

function renderProject(project) {
    const li = document.createElement('li');
    const contact = project.contactId ? contacts.get(project.contactId) : null;
    li.textContent = `${project.name} (${project.status})`;
    if (contact) li.innerHTML += ` <span class="linked-contact" data-contact-id="${contact.id}">[${contact.name}]</span>`;

    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => openModal('project-view', project.id));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openModal('project-edit', project.id));

    const completeBtn = document.createElement('button');
    completeBtn.textContent = project.status === 'Completed' ? 'Reopen' : 'Complete';
    completeBtn.addEventListener('click', () => {
        projects.update(project.id, { status: project.status === 'Completed' ? 'Pending' : 'Completed' });
        renderProjects();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
            projects.delete(project.id);
            renderProjects();
        }
    });

    li.appendChild(viewBtn);
    li.appendChild(editBtn);
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);
    return li;
}

function renderProjects() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    projects.data.forEach(project => projectList.appendChild(renderProject(project)));
}

// Notes
document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const contactId = document.getElementById('note-contact').value || null;
    if (title && content) {
        notes.add({ title, content, contactId });
        e.target.reset();
        renderNotes();
    }
});

function renderNote(note) {
    const li = document.createElement('li');
    const contact = note.contactId ? contacts.get(note.contactId) : null;
    const truncatedContent = note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content;
    li.textContent = `${note.title} - ${truncatedContent}`;
    if (contact) li.innerHTML += ` <span class="linked-contact" data-contact-id="${contact.id}">[${contact.name}]</span>`;

    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => openModal('note-view', note.id));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openModal('note-edit', note.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
            notes.delete(note.id);
            renderNotes();
        }
    });

    li.appendChild(viewBtn);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    return li;
}

function renderNotes() {
    const noteList = document.getElementById('note-list');
    noteList.innerHTML = '';
    notes.data.forEach(note => noteList.appendChild(renderNote(note)));
}

// Modal Handling
let currentModalItemId;

function openModal(mode, itemId) {
    currentModalItemId = itemId;
    const modal = document.getElementById('modal');
    const contents = modal.querySelectorAll('[id$="-content"]');
    contents.forEach(content => content.style.display = 'none');

    if (mode === 'email-view') {
        const email = emails.get(itemId);
        document.getElementById('email-view-content').style.display = 'block';
        document.getElementById('email-view-title').textContent = email.title;
        document.getElementById('email-view-category').textContent = email.category ? `Category: ${email.category}` : '';
        document.getElementById('email-view-template').textContent = email.template;
    } else if (mode === 'email-edit') {
        const email = emails.get(itemId);
        document.getElementById('email-edit-content').style.display = 'block';
        document.getElementById('email-edit-title').value = email.title;
        document.getElementById('email-edit-category').value = email.category || '';
        document.getElementById('email-edit-template').value = email.template;
    } else if (mode === 'contact-view') {
        const contact = contacts.get(itemId);
        document.getElementById('contact-view-content').style.display = 'block';
        document.getElementById('contact-view-name').textContent = contact.name;
        document.getElementById('contact-view-email').textContent = `Email: ${contact.email || 'No email'}`;
        document.getElementById('contact-view-phone').textContent = `Phone: ${formatPhoneNumber(contact.phone)}`;
        document.getElementById('contact-view-address').textContent = `Address: ${contact.address || 'No address'}`;
    } else if (mode === 'contact-edit') {
        const contact = contacts.get(itemId);
        document.getElementById('contact-edit-content').style.display = 'block';
        document.getElementById('contact-edit-name').value = contact.name;
        document.getElementById('contact-edit-email').value = contact.email || '';
        document.getElementById('contact-edit-phone').value = contact.phone || '';
        document.getElementById('contact-edit-address').value = contact.address || '';
    } else if (mode === 'project-view') {
        const project = projects.get(itemId);
        document.getElementById('project-view-content').style.display = 'block';
        document.getElementById('project-view-name').textContent = project.name;
        document.getElementById('project-view-description').textContent = project.description || 'No description';
        document.getElementById('project-view-start').textContent = project.startDate ? `Start: ${project.startDate}` : 'No start date';
        document.getElementById('project-view-status').textContent = `Status: ${project.status}`;
        const contact = project.contactId ? contacts.get(project.contactId) : null;
        document.getElementById('project-view-contact').textContent = contact ? `Contact: ${contact.name}` : 'No contact';
        const tasksDiv = document.getElementById('project-view-tasks');
        tasksDiv.innerHTML = '<h4>Tasks:</h4>' + (project.tasks.length ? project.tasks.map(t => `<div class="task-item">${t.name} (${t.status})</div>`).join('') : 'No tasks');
        const remindersDiv = document.getElementById('project-view-reminders');
        remindersDiv.innerHTML = '<h4>Reminders:</h4>' + (project.reminders.length ? project.reminders.map(r => `<div class="reminder-item">${r.message} (${r.date})</div>`).join('') : 'No reminders');
    } else if (mode === 'project-edit') {
        const project = projects.get(itemId);
        document.getElementById('project-edit-content').style.display = 'block';
        document.getElementById('project-edit-name').value = project.name;
        document.getElementById('project-edit-description').value = project.description || '';
        document.getElementById('project-edit-start').value = project.startDate || '';
        document.getElementById('project-edit-status').value = project.status;
        document.getElementById('project-edit-contact').value = project.contactId || '';
        const tasksDiv = document.getElementById('project-edit-tasks');
        tasksDiv.innerHTML = '<h4>Tasks:</h4>' + project.tasks.map((task, index) => `
            <div class="task-item">
                <input type="text" value="${task.name}" data-task-id="${task.id}">
                <select data-task-id="${task.id}">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button onclick="this.parentElement.remove()">Remove</button>
            </div>
        `).join('');
        const remindersDiv = document.getElementById('project-edit-reminders');
        remindersDiv.innerHTML = '<h4>Reminders:</h4>' + project.reminders.map((reminder, index) => `
            <div class="reminder-item">
                <input type="date" value="${reminder.date}" data-reminder-id="${reminder.id}">
                <input type="text" value="${reminder.message}" data-reminder-id="${reminder.id}">
                <button onclick="this.parentElement.remove()">Remove</button>
            </div>
        `).join('');
    } else if (mode === 'note-view') {
        const note = notes.get(itemId);
        document.getElementById('note-view-content').style.display = 'block';
        document.getElementById('note-view-title').textContent = note.title;
        document.getElementById('note-view-content-text').textContent = note.content;
        const contact = note.contactId ? contacts.get(note.contactId) : null;
        document.getElementById('note-view-contact').textContent = contact ? `Contact: ${contact.name}` : 'No contact';
    } else if (mode === 'note-edit') {
        const note = notes.get(itemId);
        document.getElementById('note-edit-content').style.display = 'block';
        document.getElementById('note-edit-title').value = note.title;
        document.getElementById('note-edit-content').value = note.content;
        document.getElementById('note-edit-contact').value = note.contactId || '';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('email-view-edit').addEventListener('click', () => openModal('email-edit', currentModalItemId));
document.getElementById('email-edit-save').addEventListener('click', () => {
    const title = document.getElementById('email-edit-title').value.trim();
    const category = document.getElementById('email-edit-category').value.trim();
    const template = document.getElementById('email-edit-template').value.trim();
    if (title && template) {
        emails.update(currentModalItemId, { title, category, template });
        renderEmails();
        closeModal();
    }
});
document.getElementById('email-edit-cancel').addEventListener('click', closeModal);
document.getElementById('email-view-copy').addEventListener('click', () => {
    const email = emails.get(currentModalItemId);
    if (email) copyToClipboard(email.template, 'Email template copied!');
});

document.getElementById('contact-view-edit').addEventListener('click', () => openModal('contact-edit', currentModalItemId));
document.getElementById('contact-edit-save').addEventListener('click', () => {
    const name = document.getElementById('contact-edit-name').value.trim();
    const email = document.getElementById('contact-edit-email').value.trim();
    const phone = document.getElementById('contact-edit-phone').value.trim();
    const address = document.getElementById('contact-edit-address').value.trim();
    if (name) {
        contacts.update(currentModalItemId, { name, email, phone, address });
        renderContacts();
        updateContactDropdowns();
        closeModal();
    }
});
document.getElementById('contact-edit-cancel').addEventListener('click', closeModal);

document.getElementById('project-view-edit').addEventListener('click', () => openModal('project-edit', currentModalItemId));
document.getElementById('project-edit-save').addEventListener('click', () => {
    const name = document.getElementById('project-edit-name').value.trim();
    const description = document.getElementById('project-edit-description').value.trim();
    const startDate = document.getElementById('project-edit-start').value;
    const status = document.getElementById('project-edit-status').value;
    const contactId = document.getElementById('project-edit-contact').value || null;
    const tasks = Array.from(document.querySelectorAll('#project-edit-tasks .task-item')).map(item => ({
        id: item.querySelector('input').dataset.taskId || Date.now(),
        name: item.querySelector('input').value,
        status: item.querySelector('select').value
    }));
    const reminders = Array.from(document.querySelectorAll('#project-edit-reminders .reminder-item')).map(item => ({
        id: item.querySelector('input[type="date"]').dataset.reminderId || Date.now(),
        date: item.querySelector('input[type="date"]').value,
        message: item.querySelector('input[type="text"]').value
    }));
    if (name) {
        projects.update(currentModalItemId, { name, description, startDate, status, contactId, tasks, reminders });
        renderProjects();
        closeModal();
    }
});
document.getElementById('project-edit-cancel').addEventListener('click', closeModal);
document.getElementById('project-add-task').addEventListener('click', () => {
    const tasksDiv = document.getElementById('project-edit-tasks');
    const taskId = Date.now();
    tasksDiv.innerHTML += `
        <div class="task-item">
            <input type="text" placeholder="Task Name" data-task-id="${taskId}">
            <select data-task-id="${taskId}">
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
            </select>
            <button onclick="this.parentElement.remove()">Remove</button>
        </div>
    `;
});
document.getElementById('project-add-reminder').addEventListener('click', () => {
    const remindersDiv = document.getElementById('project-edit-reminders');
    const reminderId = Date.now();
    remindersDiv.innerHTML += `
        <div class="reminder-item">
            <input type="date" data-reminder-id="${reminderId}">
            <input type="text" placeholder="Reminder Message" data-reminder-id="${reminderId}">
            <button onclick="this.parentElement.remove()">Remove</button>
        </div>
    `;
});

document.getElementById('note-view-edit').addEventListener('click', () => openModal('note-edit', currentModalItemId));
document.getElementById('note-edit-save').addEventListener('click', () => {
    const title = document.getElementById('note-edit-title').value.trim();
    const content = document.getElementById('note-edit-content').value.trim();
    const contactId = document.getElementById('note-edit-contact').value || null;
    if (title && content) {
        notes.update(currentModalItemId, { title, content, contactId });
        renderNotes();
        closeModal();
    }
});
document.getElementById('note-edit-cancel').addEventListener('click', closeModal);
document.getElementById('note-view-copy').addEventListener('click', () => {
    const note = notes.get(currentModalItemId);
    if (note) copyToClipboard(note.content, 'Note content copied!');
});

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
});
document.getElementById('modal-close').addEventListener('click', closeModal);

// Utility Functions
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        alert(message);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function addTooltipListeners() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.addEventListener('click', () => {
            const text = tooltip.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => {
                tooltip.setAttribute('data-tooltip', 'Copied');
                setTimeout(() => tooltip.setAttribute('data-tooltip', 'Copy'), 2000);
            });
        });
    });
}

function showContactTooltip(contactId) {
    const contact = contacts.get(contactId);
    alert(`Name: ${contact.name}\nPhone: ${formatPhoneNumber(contact.phone)}\nEmail: ${contact.email || 'No email'}\nAddress: ${contact.address || 'No address'}`);
}

// Export and Import
document.getElementById('export-btn').addEventListener('click', async () => {
    const data = {
        emails: emails.data,
        contacts: contacts.data,
        projects: projects.data,
        notes: notes.data
    };
    const jsonData = JSON.stringify(data, null, 2);

    if (window.showSaveFilePicker) {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'productivity-data.json',
                types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
            });
            const writable = await fileHandle.createWritable();
            await writable.write(jsonData);
            await writable.close();
            alert('Data exported successfully!');
        } catch (err) {
            console.error('Error during file save:', err);
            alert('Failed to export data. Using fallback method.');
            fallbackExport(jsonData);
        }
    } else {
        fallbackExport(jsonData);
    }
});

function fallbackExport(jsonData) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.emails) {
                    emails.data = data.emails;
                    emails.save();
                    renderEmails();
                }
                if (data.contacts) {
                    contacts.data = data.contacts;
                    contacts.save();
                    renderContacts();
                }
                if (data.projects) {
                    projects.data = data.projects;
                    projects.save();
                    renderProjects();
                }
                if (data.notes) {
                    notes.data = data.notes;
                    notes.save();
                    renderNotes();
                }
                updateContactDropdowns();
            } catch (error) {
                alert('Invalid JSON file. Please try again.');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    }
});

// Initial Render
renderEmails();
renderContacts();
renderProjects();
renderNotes();
updateContactDropdowns();
