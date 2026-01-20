import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Use the SAME Firebase config as firebaseauth.js
const firebaseConfig = {
  apiKey: "AIzaSyCgDEWC1U7C-A5ylFS5qkeADeak1I92Vj4",
  authDomain: "log-in-423de.firebaseapp.com",
  projectId: "log-in-423de",
  storageBucket: "log-in-423de.firebasestorage.app",
  messagingSenderId: "872948931505",
  appId: "1:872948931505:web:129da55a940c9e70353b90",
  measurementId: "G-DQT0N7GZ12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed. User:", user);
  
  if (user) {
    // User is signed in
    console.log("User is signed in with UID:", user.uid);
    loadUserData(user.uid);
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
          document.getElementById('loggedUserFName').innerText = userData.firstName || "Not set";
        }
        if (document.getElementById('loggedUserLName')) {
          document.getElementById('loggedUserLName').innerText = userData.lastName || "Not set";
        }
        if (document.getElementById('loggedUserEmail')) {
          document.getElementById('loggedUserEmail').innerText = userData.email || "Not set";
        }
        
        // Also update localStorage with current user ID
        localStorage.setItem('loggedInUserId', userId);
      } else {
        console.log("No document found in Firestore for this user ID");
        // Show default values
        document.getElementById('loggedUserFName').innerText = "User";
        document.getElementById('loggedUserLName').innerText = "Not found";
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
        alert('Error signing out. Please try again.');
      });
  });
}