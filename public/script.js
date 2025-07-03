// DevNotes Frontend JavaScript
// A modern, secure developer notebook application

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend-url.railway.app/api'; // Update this with your actual backend URL

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentUser = null;
let isAuthenticated = false;
let notes = [];

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteCategory = document.getElementById('noteCategory');
const noteImportant = document.getElementById('noteImportant');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const totalNotes = document.getElementById('totalNotes');
const importantNotes = document.getElementById('importantNotes');
const recentNotes = document.getElementById('recentNotes');
const logoutBtn = document.getElementById('logoutBtn');

// Auth form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initLoadingAnimation();
    setupEventListeners();
    console.log('🚀 DevNotes enhanced frontend loaded!');
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Auth form events
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('register');
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });
    logoutBtn.addEventListener('click', handleLogout);

    // Note form events
    addNoteBtn.addEventListener('click', handleAddNote);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-resize textarea
    noteContent.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Connection status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic refresh
    setInterval(loadNotes, 30000);
}

// ============================================================================
// LOADING ANIMATION
// ============================================================================

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

    // Hide loading screen and check authentication
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        
        // Check authentication status
        checkAuthStatus();
        
        // Remove loading screen from DOM after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }, 3500);
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            currentUser = data.user;
            isAuthenticated = true;
            showMainContent();
        } else {
            showAuthForm();
        }
    } catch (error) {
        console.error('Auth status check error:', error);
        showAuthForm();
    }
}

function showAuthForm() {
    const authContainer = document.getElementById('authContainer');
    authContainer.classList.add('show');
}

function showMainContent() {
    const authContainer = document.getElementById('authContainer');
    const mainContent = document.getElementById('mainContent');
    const userDisplay = document.getElementById('userDisplay');
    
    // Update user display
    if (currentUser && currentUser.username) {
        userDisplay.textContent = currentUser.username;
    }
    
    // Hide auth form and show main content
    authContainer.classList.add('hidden');
    mainContent.style.display = 'block';
    mainContent.classList.add('show');
    
    // Load notes after authentication
    loadNotes();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                password,
                rememberMe
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            isAuthenticated = true;
            showAuthMessage('Login successful!', 'success');
            setTimeout(() => {
                showMainContent();
            }, 1000);
        } else {
            showAuthMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            isAuthenticated = true;
            showAuthMessage('Account created successfully!', 'success');
            setTimeout(() => {
                showMainContent();
            }, 1000);
        } else {
            showAuthMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthMessage('Registration failed. Please try again.', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            isAuthenticated = false;
            
            // Reset forms
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
            
            // Show auth form
            const authContainer = document.getElementById('authContainer');
            const mainContent = document.getElementById('mainContent');
            
            mainContent.classList.remove('show');
            mainContent.style.display = 'none';
            authContainer.classList.remove('hidden');
            authContainer.classList.add('show');
            
            // Clear notes
            notes = [];
            renderNotes();
            updateStats();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type} show`;
    
    setTimeout(() => {
        authMessage.classList.remove('show');
    }, 3000);
}

function switchAuthForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');
    
    // Clear any existing messages
    authMessage.classList.remove('show');
    
    if (formType === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
    }
}

// ============================================================================
// NOTES MANAGEMENT
// ============================================================================

async function loadNotes() {
    if (!isAuthenticated) {
        console.log('❌ User not authenticated, cannot load notes');
        return;
    }
    
    console.log('📝 Loading notes...');
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // User not authenticated, redirect to login
            isAuthenticated = false;
            currentUser = null;
            showAuthForm();
            return;
        }
        
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

async function handleAddNote() {
    if (!isAuthenticated) {
        alert('Please log in to add notes!');
        return;
    }
    
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const category = noteCategory.value.trim();
    const isImportant = noteImportant.checked;
    
    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }
    
    // Disable button while saving
    addNoteBtn.disabled = true;
    addNoteBtn.innerHTML = '<span class="spinner"></span> Saving...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                title: title,
                content: content,
                category: category || 'general',
                isImportant: isImportant
            })
        });
        
        if (response.status === 401) {
            // User not authenticated, redirect to login
            isAuthenticated = false;
            currentUser = null;
            showAuthForm();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Clear form
            noteTitle.value = '';
            noteContent.value = '';
            noteCategory.value = '';
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
}

async function deleteNote(noteId) {
    if (!isAuthenticated) {
        alert('Please log in to delete notes!');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: 'DELETE',
            credentials: 'include'
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
                    ${formatDate(note.created_at || note.createdAt)}
                </span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = notes.length;
    const important = notes.filter(note => note.isImportant).length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recent = notes.filter(note => new Date(note.created_at || note.createdAt) > oneWeekAgo).length;

    animateCounter(totalNotes, total);
    animateCounter(importantNotes, important);
    animateCounter(recentNotes, recent);
}

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getCategoryIcon(category) {
    const icons = {
        'general': '📋',
        'javascript': '🟨',
        'typescript': '🔷',
        'python': '🐍',
        'java': '☕',
        'csharp': '💜',
        'cpp': '🔵',
        'c': '🔵',
        'go': '🔵',
        'rust': '🦀',
        'php': '🐘',
        'ruby': '💎',
        'swift': '🍎',
        'kotlin': '🟠',
        'scala': '🔴',
        'dart': '🔵',
        'r': '🔵',
        'matlab': '🔵',
        'perl': '🐪',
        'bash': '💻',
        'powershell': '🔵',
        'html': '🌐',
        'css': '🎨',
        'react': '⚛️',
        'vue': '💚',
        'angular': '🔴',
        'svelte': '🟠',
        'nextjs': '⚫',
        'nuxtjs': '💚',
        'gatsby': '🟣',
        'tailwind': '🎨',
        'bootstrap': '🎨',
        'sass': '🎨',
        'less': '🎨',
        'nodejs': '🟩',
        'express': '🟩',
        'mongodb': '🍃',
        'mysql': '🐬',
        'postgresql': '🐘',
        'redis': '🔴',
        'sqlite': '💎',
        'firebase': '🔥',
        'supabase': '🟢',
        'django': '🟢',
        'flask': '🟢',
        'fastapi': '🟢',
        'spring': '🟢',
        'laravel': '🟠',
        'rails': '💎',
        'aspnet': '💜',
        'graphql': '🟣',
        'rest': '🌐',
        'reactnative': '⚛️',
        'flutter': '🦋',
        'xamarin': '💜',
        'ionic': '💙',
        'cordova': '📱',
        'docker': '🐳',
        'kubernetes': '☸️',
        'aws': '☁️',
        'azure': '☁️',
        'gcp': '☁️',
        'git': '📝',
        'github': '🐙',
        'gitlab': '🦊',
        'jenkins': '🔴',
        'terraform': '🏗️',
        'ansible': '🔵',
        'nginx': '🟢',
        'apache': '🟢',
        'testing': '🧪',
        'jest': '🟨',
        'cypress': '🟢',
        'selenium': '🟢',
        'junit': '🟢',
        'pytest': '🟢',
        'eslint': '🟨',
        'prettier': '🎨',
        'sonarqube': '🔵',
        'ai': '🤖',
        'tensorflow': '🟠',
        'pytorch': '🟠',
        'scikit': '🟢',
        'pandas': '🐼',
        'numpy': '🔵',
        'opencv': '🔵',
        'nlp': '📝',
        'unity': '🎮',
        'unreal': '🎮',
        'godot': '🎮',
        'phaser': '🎮',
        'bug-fix': '🐛',
        'learning': '📚',
        'architecture': '🏗️',
        'security': '🔒',
        'performance': '⚡',
        'deployment': '🚀',
        'monitoring': '📊',
        'documentation': '📖'
    };
    return icons[category] || '📋';
}

function formatDate(dateInput) {
    let dateString = dateInput;
    // If passed an object, try both created_at and createdAt
    if (typeof dateInput === 'object' && dateInput !== null) {
        dateString = dateInput.created_at || dateInput.createdAt || '';
    }
    if (!dateString) return '';
    
    // Parse the date and ensure it's treated as UTC if it has timezone info
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Get current date in the same timezone context
    const now = new Date();
    
    // Calculate difference in days, ignoring time of day
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to save note
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addNoteBtn.click();
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        noteTitle.value = '';
        noteContent.value = '';
        noteCategory.value = '';
        noteImportant.checked = false;
    }
}

// ============================================================================
// CONNECTION STATUS
// ============================================================================

let isOnline = navigator.onLine;

function handleOnline() {
    isOnline = true;
    updateConnectionStatus();
    loadNotes(); // Refresh notes when coming back online
}

function handleOffline() {
    isOnline = false;
    updateConnectionStatus();
}

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