let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
    noteTitle = document.querySelector('#noteTitle');
    noteText = document.querySelector('#noteDescription');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelectorAll('.new-note');
    noteList = document.querySelectorAll('.list-container .list-group');
}

$(document).ready(function(){
    $('.sidenav').sidenav();

    if (window.innerWidth < 993) {
        document.getElementById('notes-sideNav').classList.add('sidenav');
    };

    if (window.innerWidth >= 993) {
        document.getElementById('notes-sideNav').classList.remove('sidenav');
        document.getElementById('notes-sideNav').removeAttribute('style');
    };
});

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
    fetch('/api/notes', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
    });

const saveNote = (note) =>
    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });

const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

// Render the list of note titles
const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === '/notes') {
        noteList.forEach((el) => (el.innerHTML = ''));
    }

    let noteListItems = [];

    // Returns HTML element with or without a delete button
    const createLi = (text, delBtn = true) => {
        const liEl = document.createElement('li');

        const divColEl = document.createElement('div');
        divColEl.classList.add('col', 's12');

        const divCardEl = document.createElement('div');
        divCardEl.classList.add('card', 'blue-grey', 'lighten-5', 'black-text');

        const divContentEl = document.createElement('div');
        divContentEl.classList.add('card-content');

        const spanEl = document.createElement('span');
        spanEl.classList.add('card-title', 'span-pointer', 'sidenav-close');
        spanEl.innerText = text;

        if (delBtn) {
            spanEl.addEventListener('click', handleNoteView);
            const aEl = document.createElement('a');
            aEl.classList.add('btn-floating', 'halfway-fab', 'btn-flat', 'blue-grey', 'lighten-5', 'black-text', 'right', 'delete-note');
            aEl.addEventListener('click', handleNoteDelete);

            const iEl = document.createElement('i');
            iEl.classList.add('material-icons', 'black-text');
            iEl.innerText = 'clear';

            aEl.append(iEl);
            spanEl.append(aEl);
        }

        divContentEl.append(spanEl);
        divCardEl.append(divContentEl);
        divColEl.append(divCardEl);
        liEl.append(divColEl);

        return liEl;
    };

    if (jsonNotes.length === 0) {
        noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note);
        noteListItems.push(li);

    });

    if (window.location.pathname === '/notes') {
        noteListItems.forEach((note) => {
            noteList.forEach((el) => {
                el.appendChild(note);
            })
        });
    }
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.closest('li').getAttribute('data-note'));
    renderActiveNote();
};

const handleNewNoteView = (e) => {
    activeNote = {};
    console.log('New Note Form');
    renderActiveNote();
};

const renderActiveNote = () => {
    if (activeNote.id) {
        document.getElementById('note-card-title').innerText = 'Update Note';
        noteTitle.value = activeNote.title;
        noteID.value = activeNote.id;
        noteDescription.value = activeNote.text;
    } else {
        document.getElementById('note-card-title').innerText = 'New Note';
        noteTitle.value = '';
        noteID.value = '';
        noteDescription.value = '';
    }

    handleRenderSaveBtn();
};

const handleNoteSave = () => {
    const newNote = {
        id: noteID.value || Date.now(),
        title: noteTitle.value,
        text: noteText.value,
    };
    saveNote(newNote).then(() => {
        activeNote = {};
        getAndRenderNotes();
        renderActiveNote();
    });
};

const handleNoteDelete = (e) => {
    // Prevents the click listener for the list from being called when the button inside of it is clicked
    e.stopPropagation();

    const note = e.target;
    const noteId = JSON.parse(note.closest('li').getAttribute('data-note')).id;

    if (activeNote.id === noteId) {
        activeNote = {};
    }

    deleteNote(noteId).then(() => {
        getAndRenderNotes();
        renderActiveNote();
    });
};

const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
        saveNoteBtn.classList.add('disabled');
    } else {
        saveNoteBtn.classList.remove('disabled');
    }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn[0].addEventListener('click', handleNewNoteView);
    newNoteBtn[1].addEventListener('click', handleNewNoteView);
    noteTitle.addEventListener('keyup', handleRenderSaveBtn);
    noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();

window.addEventListener("resize", function() {
    if (window.innerWidth < 993) {
        document.getElementById('notes-sideNav').classList.add('sidenav');
    };

    if (window.innerWidth >= 993) {
        document.getElementById('notes-sideNav').classList.remove('sidenav');
        document.getElementById('notes-sideNav').removeAttribute('style');
    };
});