// DevNotes Frontend JavaScript

// DOM Elements
const testBtn = document.getElementById('testBtn');
const testResult = document.getElementById('testResult');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteCategory = document.getElementById('noteCategory');
const noteImportant = document.getElementById('noteImportant');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const noteCount = document.getElementById('noteCount');

// Store notes (will be loaded from MongoDB)
let notes = [];

// Test API connection
testBtn.addEventListener('click', async () => {
    testResult.innerHTML = '🔄 Testing connection...';
    testResult.className = '';
    
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        testResult.innerHTML = `
            ✅ <strong>Success!</strong><br>
            Message: ${data.message}<br>
            Database: ${data.database}<br>
            Time: ${data.timestamp}
        `;
        testResult.className = 'success';
        
    } catch (error) {
        testResult.innerHTML = `
            ❌ <strong>Error:</strong><br>
            ${error.message}
        `;
        testResult.className = 'error';
    }
});

// Load notes from database
async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        
        if (data.success) {
            notes = data.notes;
            renderNotes();
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

// Add new note
addNoteBtn.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const category = noteCategory.value;
    const isImportant = noteImportant.checked;
    
    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }
    
    // Disable button while saving
    addNoteBtn.disabled = true;
    addNoteBtn.textContent = '💾 Saving...';
    
    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category: category,
                isImportant: isImportant
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear form
            noteTitle.value = '';
            noteContent.value = '';
            noteCategory.value = 'general';
            noteImportant.checked = false;
            
            // Reload notes from database
            await loadNotes();
            
            // Show success message briefly
            addNoteBtn.textContent = '✅ Saved!';
            setTimeout(() => {
                addNoteBtn.textContent = 'Add Note';
            }, 1000);
        } else {
            alert('❌ Error saving note: ' + data.message);
        }
        
    } catch (error) {
        alert('❌ Error saving note: ' + error.message);
    } finally {
        // Re-enable button
        addNoteBtn.disabled = false;
    }
});

// Delete note
async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadNotes(); // Reload notes
        } else {
            alert('❌ Error deleting note: ' + data.message);
        }
        
    } catch (error) {
        alert('❌ Error deleting note: ' + error.message);
    }
}

// Render notes to the page
function renderNotes() {
    // Update note count
    noteCount.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; opacity: 0.6;">No notes yet. Add your first dev note above! 📝</p>';
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-item ${note.isImportant ? 'important' : ''}">
            <div class="note-header">
                <div class="note-title">
                    ${note.isImportant ? '⭐ ' : ''}${escapeHtml(note.title)}
                </div>
                <div class="note-actions">
                    <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑️</button>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-meta">
                <span class="note-category category-${note.category}">
                    ${getCategoryIcon(note.category)} ${note.category}
                </span>
                <span>
                    Created: ${new Date(note.createdAt).toLocaleString()}
                </span>
            </div>
        </div>
    `).join('');
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'general': '📋',
        'javascript': '🟨',
        'nodejs': '🟩',
        'mongodb': '🍃',
        'bug-fix': '🐛',
        'learning': '📚'
    };
    return icons[category] || '📋';
}

// Utility function to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadNotes(); // Load notes from database on page load
    console.log('🚀 DevNotes frontend loaded!');
});