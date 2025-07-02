// DevNotes Frontend JavaScript

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize loading animation
function initLoadingAnimation() {
    const titleTexts = document.querySelectorAll('.title-text');
    const subtitle = document.querySelector('.subtitle');
    const progressBar = document.getElementById('progressBar');

    // Start progress bar
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 100);

    // Animate title
    setTimeout(() => {
        titleTexts.forEach((text, index) => {
            setTimeout(() => {
                text.classList.add('animate');
            }, index * 200);
        });
    }, 300);

    // Animate subtitle
    setTimeout(() => {
        subtitle.classList.add('animate');
    }, 1000);

    // Hide loading screen and show main content
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');
        
        loadingScreen.classList.add('hidden');
        mainContent.classList.add('show');
        
        // Remove loading screen from DOM after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 3500);
}

// DOM Elements
const testBtn = document.getElementById('testBtn');
const testResult = document.getElementById('testResult');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteCategory = document.getElementById('noteCategory');
const noteImportant = document.getElementById('noteImportant');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const totalNotes = document.getElementById('totalNotes');
const importantNotes = document.getElementById('importantNotes');
const recentNotes = document.getElementById('recentNotes');

// Debug: Check if all elements are found
console.log('🔍 Debug - DOM Elements found:');
console.log('testBtn:', testBtn);
console.log('noteTitle:', noteTitle);
console.log('noteContent:', noteContent);
console.log('noteCategory:', noteCategory);
console.log('noteImportant:', noteImportant);
console.log('addNoteBtn:', addNoteBtn);
console.log('notesList:', notesList);

// Store notes (will be loaded from MongoDB)
let notes = [];

// Test API connection
testBtn.addEventListener('click', async () => {
    console.log('🧪 Test button clicked!');
    testResult.innerHTML = '<span class="spinner"></span> Testing connection...';
    testResult.className = 'test-result loading';
    
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        testResult.innerHTML = `
            ✅ <strong>Success!</strong><br>
            Message: ${data.message}<br>
            Database: ${data.database}<br>
            Time: ${data.timestamp}
        `;
        testResult.className = 'test-result success';
        
    } catch (error) {
        testResult.innerHTML = `
            ❌ <strong>Error:</strong><br>
            ${error.message}
        `;
        testResult.className = 'test-result error';
    }
});

// Load notes from database
async function loadNotes() {
    console.log('📝 Loading notes...');
    try {
        const response = await fetch('/api/notes');
        const data = await response.json();
        
        if (data.success) {
            notes = data.notes;
            console.log('📝 Notes loaded:', notes);
            renderNotes();
            updateStats();
        }
    } catch (error) {
        console.error('❌ Error loading notes:', error);
    }
}

// Add new note
addNoteBtn.addEventListener('click', async () => {
    console.log('✨ Add note button clicked!');
    console.log('📝 Form values:');
    console.log('- Title:', noteTitle.value);
    console.log('- Content:', noteContent.value);
    console.log('- Category:', noteCategory.value);
    console.log('- Important:', noteImportant.checked);
    
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
    addNoteBtn.innerHTML = '<span class="spinner"></span> Saving...';
    
    try {
        console.log('📤 Sending note to server...');
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
        console.log('📥 Server response:', data);
        
        if (data.success) {
            // Clear form
            noteTitle.value = '';
            noteContent.value = '';
            noteCategory.value = 'general';
            noteImportant.checked = false;
            
            // Reload notes from database
            await loadNotes();
            
            // Show success message briefly
            addNoteBtn.innerHTML = '<span>✅</span> Saved!';
            setTimeout(() => {
                addNoteBtn.innerHTML = '<span>✨</span> Add Note';
            }, 1500);
        } else {
            alert('❌ Error saving note: ' + data.message);
        }
        
    } catch (error) {
        console.error('❌ Error saving note:', error);
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

// Update statistics
function updateStats() {
    const total = notes.length;
    const important = notes.filter(note => note.isImportant).length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recent = notes.filter(note => new Date(note.createdAt) > oneWeekAgo).length;

    animateCounter(totalNotes, total);
    animateCounter(importantNotes, important);
    animateCounter(recentNotes, recent);
}

// Animate counter
function animateCounter(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (target - start) * progress);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Render notes to the page
function renderNotes() {
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <h3>No notes yet</h3>
                <p>Create your first dev note above!</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notes.map((note, index) => `
        <div class="note-card ${note.isImportant ? 'important' : ''}" style="animation-delay: ${index * 0.1}s">
            <div class="note-header">
                <div class="note-title">
                    ${note.isImportant ? '⭐ ' : ''}${escapeHtml(note.title)}
                </div>
                <div class="note-actions">
                    <button class="btn btn-danger" onclick="deleteNote('${note.id}')">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-footer">
                <span class="note-category category-${note.category}">
                    ${getCategoryIcon(note.category)} ${note.category}
                </span>
                <span class="note-date">
                    ${formatDate(note.createdAt)}
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to save note
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addNoteBtn.click();
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        noteTitle.value = '';
        noteContent.value = '';
        noteCategory.value = 'general';
        noteImportant.checked = false;
    }
});

// Auto-resize textarea
noteContent.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Add smooth scrolling to new notes
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading animation and particles
    createParticles();
    initLoadingAnimation();
    
    // Load notes after loading animation completes
    setTimeout(() => {
        loadNotes(); // Load notes from database on page load
    }, 4000);
    
    console.log('🚀 DevNotes enhanced frontend loaded!');
});

// Add periodic refresh (every 30 seconds)
setInterval(() => {
    loadNotes();
}, 30000);

// Add connection status indicator
let isOnline = navigator.onLine;

function updateConnectionStatus() {
    const header = document.querySelector('header p');
    if (!isOnline) {
        header.textContent = '🔴 Offline - Your premium developer notebook';
        header.style.color = '#f5576c';
    } else {
        header.textContent = 'Your premium developer notebook in the cloud';
        header.style.color = '';
    }
}

window.addEventListener('online', () => {
    isOnline = true;
    updateConnectionStatus();
    loadNotes(); // Refresh notes when coming back online
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateConnectionStatus();
});

// Add search functionality
function addSearchFeature() {
    const searchHTML = `
        <div class="section" style="animation-delay: 0.05s;">
            <div class="section-header">
                <h2>🔍 Search Notes</h2>
            </div>
            <div class="section-content">
                <input type="text" id="searchInput" class="form-input" placeholder="Search your notes...">
            </div>
        </div>
    `;
    
    // Insert search section before the notes display
    const notesSection = document.querySelector('.section:last-child');
    notesSection.insertAdjacentHTML('beforebegin', searchHTML);
    
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filterNotes(query);
        }, 300);
    });
}

function filterNotes(query) {
    if (!query) {
        renderNotes();
        return;
    }
    
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.category.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
    );
    
    // Temporarily replace notes array for rendering
    const originalNotes = notes;
    notes = filteredNotes;
    renderNotes();
    notes = originalNotes;
}

// Initialize search feature after a delay
setTimeout(addSearchFeature, 5000);