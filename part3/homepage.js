import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// In your homepage.js, update the loadUserData function:

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
          document.getElementById('loggedUserFName').innerText = userData.firstName || "Google User";
        }
        if (document.getElementById('loggedUserLName')) {
          document.getElementById('loggedUserLName').innerText = userData.lastName || "";
        }
        if (document.getElementById('loggedUserEmail')) {
          document.getElementById('loggedUserEmail').innerText = userData.email || "Google Account";
        }
        
        // Optional: Display profile picture for Google users
        if (userData.photoURL && document.getElementById('userProfilePic')) {
          document.getElementById('userProfilePic').src = userData.photoURL;
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