let notes = JSON.parse(localStorage.getItem('notes')) || [];
const notesContainer = document.getElementById('notesContainer');
const addNoteBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const userInfo = document.getElementById('userInfo');
const themeToggle = document.getElementById('themeToggle');
let username = localStorage.getItem('username') || prompt('Enter your name:');
localStorage.setItem('username', username);
userInfo.textContent = `Welcome, ${username}`;
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
});
addNoteBtn.addEventListener('click', () => {
  const newNote = {
    id: Date.now(),
    title: "Untitled",
    content: "",
    created: new Date().toISOString(),
    edited: new Date().toISOString(),
  };
  notes.unshift(newNote);
  saveNotes();
  renderNotes(searchInput.value);
});
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}
function renderNotes(filter = "") {
  notesContainer.innerHTML = "";

  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(filter.toLowerCase()) ||
    note.content.toLowerCase().includes(filter.toLowerCase())
  );
  for (let note of filtered) {
    const noteEl = document.createElement('div');
    noteEl.className = "note";
    const header = document.createElement('div');
    header.className = "note-header";
    const titleInput = document.createElement('input');
    titleInput.type = "text";
    titleInput.value = note.title;
    titleInput.setAttribute("aria-label", "Edit title");
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "🗑️";
    deleteBtn.setAttribute("aria-label", "Delete note");
    header.appendChild(titleInput);
    header.appendChild(deleteBtn);
    const textarea = document.createElement('textarea');
    textarea.value = note.content;
    textarea.setAttribute("aria-label", "Edit content");
    const footer = document.createElement('div');
    footer.className = "note-footer";
    footer.textContent = `Edited: ${new Date(note.edited).toLocaleString()}`;
    titleInput.addEventListener('input', (e) => {
      note.title = e.target.value;
      note.edited = new Date().toISOString();
      saveNotes();
      footer.textContent = `Edited: ${new Date(note.edited).toLocaleString()}`;
    });

    textarea.addEventListener('input', (e) => {
      note.content = e.target.value;
      note.edited = new Date().toISOString();
      saveNotes();
      footer.textContent = `Edited: ${new Date(note.edited).toLocaleString()}`;
    });

    deleteBtn.addEventListener('click', () => {
      notes = notes.filter(n => n.id !== note.id);
      saveNotes();
      renderNotes(searchInput.value);
    });
    noteEl.appendChild(header);
    noteEl.appendChild(textarea);
    noteEl.appendChild(footer);

    notesContainer.appendChild(noteEl);
  }
}
searchInput.addEventListener('input', () => {
  renderNotes(searchInput.value);
});
renderNotes();
