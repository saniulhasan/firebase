import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { 
    getFirestore, 
    getDoc, 
    doc, 
    collection, 
    getDocs, 
    deleteDoc,
    query,
    orderBy,
    where 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Use the SAME Firebase config as firebaseauth.js
const firebaseConfig = {
    apiKey: "AIzaSyB397Kx3mhC3xkSUPA5Tttd79S1bu8rt2Y",
    authDomain: "newlog-177ff.firebaseapp.com",
    projectId: "newlog-177ff",
    storageBucket: "newlog-177ff.firebasestorage.app",
    messagingSenderId: "754206413710",
    appId: "1:754206413710:web:1890640ad0c7e429788adf",
    measurementId: "G-WDGHV3ER7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin email configuration (must match the one in firebaseauth.js)
const ADMIN_EMAIL = "saniulhasan23@gmail.com";

// Pagination variables
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
let rowsPerPage = 5;
let searchTerm = "";
let totalPages = 1;

// Function to show messages
function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Check if current user is admin
function isAdmin(userEmail) {
    return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Load all users from Firestore
async function loadAllUsers() {
    try {
        const usersTableContainer = document.getElementById('usersTableContainer');
        usersTableContainer.innerHTML = '<div class="loading">Loading users...</div>';
        
        // Query all users from Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            allUsers = [];
            filteredUsers = [];
            renderTable();
            updatePaginationControls();
            return;
        }
        
        // Convert to array
        allUsers = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;
            allUsers.push({
                id: userId,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                provider: userData.provider || 'email',
                createdAt: userData.createdAt || null,
                isAdmin: isAdmin(userData.email)
            });
        });
        
        // Apply search filter
        applySearchFilter();
        
        // Render table and update pagination
        renderTable();
        updatePaginationControls();
        
    } catch (error) {
        console.error("Error loading users:", error);
        document.getElementById('usersTableContainer').innerHTML = 
            `<div class="error">Error loading users: ${error.message}</div>`;
    }
}

// Apply search filter
function applySearchFilter() {
    if (!searchTerm.trim()) {
        filteredUsers = [...allUsers];
    } else {
        const term = searchTerm.toLowerCase();
        filteredUsers = allUsers.filter(user => 
            (user.firstName && user.firstName.toLowerCase().includes(term)) ||
            (user.lastName && user.lastName.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term))
        );
    }
    
    // Calculate total pages
    totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 1;
    }
}

// Render table with current page data
function renderTable() {
    const usersTableContainer = document.getElementById('usersTableContainer');
    
    if (filteredUsers.length === 0) {
        usersTableContainer.innerHTML = `<div class="loading">${searchTerm ? 'No users found matching your search.' : 'No users found in the database.'}</div>`;
        document.getElementById('stats').textContent = `Showing 0 of 0 users`;
        return;
    }
    
    // Calculate start and end indices
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredUsers.length);
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Create table HTML
    let tableHTML = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Provider</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    currentUsers.forEach((user, index) => {
        const userNumber = startIndex + index + 1;
        const createdAt = user.createdAt ? 
            new Date(user.createdAt).toLocaleDateString() : 
            'N/A';
        
        // Don't allow admin to delete themselves or other admins
        const isCurrentUser = user.id === auth.currentUser?.uid;
        const deleteDisabled = isCurrentUser || user.isAdmin;
        
        tableHTML += `
            <tr>
                <td>${userNumber}</td>
                <td>${user.firstName || 'N/A'}</td>
                <td>${user.lastName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.provider || 'email'}</td>
                <td>${createdAt}</td>
                <td>
                    <button class="delete-btn" 
                            data-userid="${user.id}"
                            data-email="${user.email || ''}"
                            ${deleteDisabled ? 'disabled' : ''}
                            onclick="deleteUser('${user.id}', '${user.email || ''}')">
                        ${deleteDisabled ? (isCurrentUser ? 'Current User' : 'Admin User') : 'Delete'}
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    usersTableContainer.innerHTML = tableHTML;
    
    // Update stats
    document.getElementById('stats').textContent = 
        `Showing ${startIndex + 1}-${endIndex} of ${filteredUsers.length} users${searchTerm ? ' (filtered)' : ''}`;
}

// Update pagination controls
function updatePaginationControls() {
    // Update page info
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('pageInfoBottom').textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update button states
    const prevButtons = document.querySelectorAll('#prevPage, #prevPageBottom');
    const nextButtons = document.querySelectorAll('#nextPage, #nextPageBottom');
    const firstButtons = document.querySelectorAll('#firstPage');
    const lastButtons = document.querySelectorAll('#lastPage');
    
    prevButtons.forEach(btn => {
        btn.disabled = currentPage === 1;
    });
    
    nextButtons.forEach(btn => {
        btn.disabled = currentPage === totalPages || totalPages === 0;
    });
    
    firstButtons.forEach(btn => {
        btn.disabled = currentPage === 1;
    });
    
    lastButtons.forEach(btn => {
        btn.disabled = currentPage === totalPages || totalPages === 0;
    });
}

// Change page
function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    renderTable();
    updatePaginationControls();
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchTerm = e.target.value.trim();
            currentPage = 1; // Reset to first page on search
            applySearchFilter();
            renderTable();
            updatePaginationControls();
        }, 300); // 300ms debounce delay
    });
}

// Setup pagination controls
function setupPagination() {
    // Rows per page change
    document.getElementById('rowsPerPage').addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page
        totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        renderTable();
        updatePaginationControls();
    });
    
    // Previous page buttons
    document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('prevPageBottom').addEventListener('click', () => changePage(currentPage - 1));
    
    // Next page buttons
    document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));
    document.getElementById('nextPageBottom').addEventListener('click', () => changePage(currentPage + 1));
    
    // First page buttons
    document.getElementById('firstPage').addEventListener('click', () => changePage(1));
    
    // Last page buttons
    document.getElementById('lastPage').addEventListener('click', () => changePage(totalPages));
}

// Delete user function
async function deleteUser(userId, userEmail) {
    // Double-check: prevent admin from deleting themselves or other admins
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email || '';
    
    if (userId === currentUser?.uid) {
        showMessage('You cannot delete your own account!', 'error');
        return;
    }
    
    if (isAdmin(userEmail)) {
        showMessage('You cannot delete admin users!', 'error');
        return;
    }
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        // Delete the user document from Firestore
        await deleteDoc(doc(db, "users", userId));
        
        showMessage(`User ${userEmail} has been deleted successfully!`, 'success');
        
        // Refresh the users list
        await loadAllUsers();
        
    } catch (error) {
        console.error("Error deleting user:", error);
        showMessage(`Failed to delete user: ${error.message}`, 'error');
    }
}

// Make deleteUser function available globally for onclick events
window.deleteUser = deleteUser;

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed. User:", user);
    
    if (user) {
        // User is signed in
        console.log("User is signed in with UID:", user.uid);
        
        // Check if user is admin
        if (!isAdmin(user.email)) {
            // Not an admin, redirect to homepage
            showMessage('Access denied! You are not an administrator.', 'error');
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 2000);
            return;
        }
        
        // User is admin, load their data and all users
        loadUserData(user.uid);
        loadAllUsers();
        
        // Setup search and pagination
        setupSearch();
        setupPagination();
        
    } else {
        // User is signed out
        console.log("No user signed in");
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        
        if (loggedInUserId) {
            // Try to load data from localStorage ID
            console.log("Loading from localStorage ID:", loggedInUserId);
            loadUserData(loggedInUserId);
        } else {
            // No user data found, redirect to login
            console.log("No user ID found, redirecting to login");
            window.location.href = 'index.html';
        }
    }
});

// Load current user data
function loadUserData(userId) {
    console.log("Loading user data for ID:", userId);
    
    const docRef = doc(db, "users", userId);
    
    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("User data retrieved:", userData);
                
                // Display user data
                if (document.getElementById('loggedUserFName')) {
                    document.getElementById('loggedUserFName').innerText = userData.firstName || "Admin User";
                }
                if (document.getElementById('loggedUserLName')) {
                    document.getElementById('loggedUserLName').innerText = userData.lastName || "";
                }
                if (document.getElementById('loggedUserEmail')) {
                    document.getElementById('loggedUserEmail').innerText = userData.email || "Admin Account";
                }
                
                // Update localStorage with current user ID
                localStorage.setItem('loggedInUserId', userId);
            } else {
                console.log("No document found in Firestore for this user ID");
                // Show default values
                document.getElementById('loggedUserFName').innerText = "Admin";
                document.getElementById('loggedUserLName').innerText = "User";
                document.getElementById('loggedUserEmail').innerText = "Data not available";
            }
        })
        .catch((error) => {
            console.error("Error getting document from Firestore:", error);
            document.getElementById('loggedUserFName').innerText = "Error";
            document.getElementById('loggedUserLName').innerText = "Loading data";
            document.getElementById('loggedUserEmail').innerText = "Please try again";
        });
}

// Logout functionality
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        console.log("Logout initiated");
        
        signOut(auth)
            .then(() => {
                // Clear localStorage
                localStorage.removeItem('loggedInUserId');
                console.log("User signed out successfully");
                
                // Redirect to login page
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error signing out:', error);
                showMessage('Error signing out. Please try again.', 'error');
            });
    });
}