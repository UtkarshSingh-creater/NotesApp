let notes = JSON.parse(localStorage.getItem('notes')) || [];
const notesContainer = document.getElementById('notesContainer');
const addNoteBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const userInfo = document.getElementById('userInfo');
const themeToggle = document.getElementById('themeToggle');
const imageGallery = document.getElementById('imageGallery');

let selectedTheme = localStorage.getItem('selectedTheme') || '#fffbe6'; 

let username = localStorage.getItem('username');
if (!username) {
    username = prompt('Enter your name:')|| "Guest";
    localStorage.setItem('username', username);
}
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
        isPinned: false, 
        themeStyle: selectedTheme 
    };
    notes.unshift(newNote);
    saveNotes();
    renderNotes(searchInput.value);
});

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateNoteAndSave(note, key, value, footer) {
    note[key] = value;
    note.edited = new Date().toISOString();
    saveNotes();
    footer.textContent = `Edited: ${new Date(note.edited).toLocaleString()}`;
}

function togglePin(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.isPinned = !note.isPinned;
        saveNotes();
        renderNotes(searchInput.value); 
    }
}

function renderNotes(filter = "") {
    notesContainer.innerHTML = "";

    const sortedNotes = [...notes].sort((a, b) => {
        return (b.isPinned - a.isPinned);
    });

    const filtered = sortedNotes.filter(note =>
        note.title.toLowerCase().includes(filter.toLowerCase()) ||
        note.content.toLowerCase().includes(filter.toLowerCase())
    );
    
    for (let note of filtered) {
        const noteEl = document.createElement('div');
        noteEl.className = "note-card"; 
        noteEl.setAttribute('data-id', note.id); 
        
        if (note.isPinned) {
            noteEl.classList.add('pinned');
        }

        noteEl.style.backgroundColor = 'initial';
        noteEl.style.backgroundImage = 'none';
        noteEl.style.borderLeft = 'none';

        if (note.themeStyle) {
            if (note.themeStyle.startsWith('url')) {
                noteEl.style.backgroundImage = note.themeStyle;
                noteEl.style.backgroundSize = 'cover';
                noteEl.style.borderLeft = '5px solid rgba(0, 0, 0, 0.3)';
            } else {
                noteEl.style.backgroundColor = note.themeStyle;
                noteEl.style.borderLeft = `5px solid ${note.themeStyle}`;
                
                if (note.themeStyle === '#fffbe6') { 
                     noteEl.style.borderLeft = '5px solid #ffcc00';
                }
            }
        } else {
             noteEl.style.backgroundColor = '#fffbe6';
             noteEl.style.borderLeft = '5px solid #ffcc00';
        }

        const header = document.createElement('div');
        header.className = "note-header";
        
        const titleInput = document.createElement('input');
        titleInput.type = "text";
        titleInput.value = note.title;
        titleInput.setAttribute("aria-label", "Edit title");
        
        const pinBtn = document.createElement('button');
        pinBtn.textContent = "📌";
        pinBtn.setAttribute("aria-label", "Pin note");
        pinBtn.classList.add("pin-btn");
        if (note.isPinned) {
             pinBtn.classList.add("active");
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "🗑️";
        deleteBtn.setAttribute("aria-label", "Delete note");
        deleteBtn.classList.add("delete-btn"); 
        
        header.appendChild(titleInput);
        header.appendChild(pinBtn);
        header.appendChild(deleteBtn);
        
        const textarea = document.createElement('textarea');
        textarea.value = note.content;
        textarea.setAttribute("aria-label", "Edit content");
        
        const footer = document.createElement('div');
        footer.className = "note-footer";
        footer.textContent = `Edited: ${new Date(note.edited).toLocaleString()}`;
        
        titleInput.addEventListener('input', (e) => {
            updateNoteAndSave(note, 'title', e.target.value, footer);
        });

        textarea.addEventListener('input', (e) => {
            updateNoteAndSave(note, 'content', e.target.value, footer);
        });

        pinBtn.addEventListener('click', (e) => {
             e.stopPropagation();
             togglePin(note.id);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(n => n.id !== note.id);
                saveNotes();
                renderNotes(searchInput.value);
            }
        });
        
        noteEl.addEventListener('click', (event) => {
            if (event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'INPUT' && !event.target.classList.contains('pin-btn') && !event.target.classList.contains('delete-btn')) {
                document.querySelectorAll('.note-card.selected').forEach(n => n.classList.remove('selected'));
                noteEl.classList.add('selected');
            }
        });
        
        noteEl.appendChild(header);
        noteEl.appendChild(textarea);
        noteEl.appendChild(footer);

        notesContainer.appendChild(noteEl);
    }
    
    highlightSelectedTheme();
}

function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
const debouncedRenderNotes = debounce(renderNotes, 300);
searchInput.addEventListener('input', () => {
    debouncedRenderNotes(searchInput.value);
});


function highlightSelectedTheme() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('selected');
    });

    const currentItem = Array.from(document.querySelectorAll('.gallery-item')).find(item => {
        let styleValue = item.style.backgroundColor || item.style.backgroundImage;
        if (styleValue.startsWith('rgb')) {
            styleValue = styleValue.replace(/\s/g, ''); 
        }
        return styleValue === selectedTheme.replace(/\s/g, '');
    });

    if (currentItem) {
        currentItem.classList.add('selected');
    }
}

function handleThemeSelection(e) {
    const item = e.currentTarget;
    
    let themeValue;
    if (item.style.backgroundColor) {
        themeValue = item.style.backgroundColor;
    } else if (item.style.backgroundImage) {
        themeValue = item.style.backgroundImage;
    } else {
        themeValue = '#fffbe6';
    }

    selectedTheme = themeValue;
    localStorage.setItem('selectedTheme', selectedTheme);
    
    highlightSelectedTheme();
}


document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', handleThemeSelection);
});

renderNotes();
