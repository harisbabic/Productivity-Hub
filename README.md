# Productivity Hub

A lightweight, client-side desktop utility application built with HTML, CSS, and JavaScript to enhance personal productivity. It uses browser `localStorage` for data persistence and operates entirely without a server-side database, storing data in JSON format. Designed for a single user (me), it focuses on managing emails, contacts, projects, and notes with a simple, intuitive interface.

## Features

### Emails
- **Create**: Add reusable email templates with a title, category, and content.
- **View/Edit**: Review or modify templates in a modal.
- **Copy**: Copy templates to the clipboard for quick use.
- **Delete**: Remove unwanted templates.

### Contacts
- **Create**: Add contacts with name (required), email, phone, and address.
- **View/Edit**: Inspect or update contact details via a modal.
- **Delete**: Remove contacts with confirmation.
- **Copy**: Click any field (name, email, phone, address) to copy it to the clipboard, with a tooltip ("Copy" → "Copied").
- **Search**: Filter contacts by name using a search bar.
- **Phone Formatting**: Displays 10-digit US phone numbers as `(000) 000-0000`.

### Projects (formerly To-Dos)
- **Create**: Add projects with a name (required), description, start date, status (Pending, In Progress, Completed), and an optional linked contact.
- **View/Edit**: See or modify project details, including sub-tasks and reminders, in a modal.
- **Sub-tasks**: Add, edit, or remove tasks with a name and status (Pending/Completed).
- **Reminders**: Add, edit, or remove reminders with a date and message.
- **Complete/Reopen**: Toggle project status between Completed and Pending.
- **Delete**: Remove projects with confirmation.
- **Linked Contact**: Display the linked contact’s name in the list and view modal.

### Notes
- **Create**: Add notes with a title (required), content, and an optional linked contact.
- **View/Edit**: Review or update notes in a modal, showing full content and linked contact.
- **Copy**: Copy note content to the clipboard from the view modal.
- **Delete**: Remove notes with confirmation.
- **Preview**: List shows title and a truncated content preview (up to 50 characters).

### Data Management
- **Export**: Save all data (emails, contacts, projects, notes) as a JSON file using a "Save As" dialog (Chrome/Edge) or default download (fallback).
- **Import**: Load data from a JSON file to restore or update the app state.

## Installation
1. Clone or download the repository.
2. Ensure you have a modern web browser (Chrome or Edge recommended for full "Save As" support).
3. Open `index.html` in your browser to start using the app.

## Usage
- **Tabs**: Navigate between Emails, Contacts, Projects, and Notes using the top navigation bar.
- **Forms**: Fill out forms to add new items; required fields are marked.
- **Lists**: Interact with items via buttons (Copy, View, Edit, Delete, Complete/Reopen for Projects).
- **Modals**: Use modals for detailed viewing and editing, closing with the "×" button or clicking outside.
- **Search**: Filter contacts by typing in the search bar.
- **Export/Import**: Use footer buttons to save or load your data.

## Technical Details
- **Tech Stack**: HTML, CSS, JavaScript.
- **Storage**: `localStorage` with JSON serialization.
- **File System**: Uses the File System Access API (`showSaveFilePicker`) for exporting in supported browsers (Chrome 86+, Edge 86+), with a fallback for others (e.g., Firefox).
- **Theme**: Custom CSS with a muted, earthy palette (`#d9d4c4`, `#8e977b`, `#877642`, etc.) for a cohesive look.

## Development Notes
- **Single User**: Optimized for personal use, no multi-user support.
- **No Database**: Relies on client-side storage to keep it lightweight and portable.
- **Future Enhancements**: Planned sorting for Projects (by status or date) and potential Electron wrapping for native filesystem access.

## Known Limitations
- **Browser Compatibility**: Full export functionality requires Chrome/Edge; other browsers use a default download location (e.g., Downloads folder).
- **Storage Limits**: `localStorage` has a ~5-10MB limit, sufficient for small-to-medium datasets but may require IndexedDB for larger use cases.
- **No Real-Time Reminders**: Reminders are stored but not actively triggered (requires manual checking or future enhancement).

## Contributing
This is a personal project, but feel free to fork and adapt it for your needs. Suggestions or bug reports can be shared via a new thread or issue if this becomes a public repo.

## License
No formal license; intended for personal use and experimentation.

---
*Last Updated: March 16, 2025*
