import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Use the SAME Firebase config as homepage.js
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

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
      messageDiv.style.opacity = 0;
    }, 5000);
  }
}

// Sign Up Functionality
const signUp = document.getElementById('submitSignUp');
if (signUp) {
  signUp.addEventListener('click', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
          email: email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date().toISOString()
        };
        
        showMessage('Account Created Successfully', 'signUpMessage');
        
        // Save user data to Firestore
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
          .then(() => {
            console.log("User data saved to Firestore with ID:", user.uid);
            // Store user ID in localStorage
            localStorage.setItem('loggedInUserId', user.uid);
            // Redirect to homepage
            window.location.href = 'homepage.html';
          })
          .catch((error) => {
            console.error("Error writing document to Firestore:", error);
            showMessage('Error saving user data. Please try again.', 'signUpMessage');
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
          showMessage('Email Address Already Exists!', 'signUpMessage');
        } else if (errorCode === 'auth/weak-password') {
          showMessage('Password should be at least 6 characters', 'signUpMessage');
        } else if (errorCode === 'auth/invalid-email') {
          showMessage('Invalid email address', 'signUpMessage');
        } else {
          showMessage('Unable to create user: ' + error.message, 'signUpMessage');
        }
        console.error("Sign up error:", error);
      });
  });
}

// Sign In Functionality
const signIn = document.getElementById('submitSignIn');
if (signIn) {
  signIn.addEventListener('click', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        showMessage('Login successful!', 'signInMessage');
        
        // Store user ID in localStorage
        localStorage.setItem('loggedInUserId', user.uid);
        console.log("User logged in with ID:", user.uid);
        
        // Redirect to homepage
        setTimeout(() => {
          window.location.href = 'homepage.html';
        }, 1000);
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
          showMessage('Incorrect Email or Password', 'signInMessage');
        } else if (errorCode === 'auth/user-not-found') {
          showMessage('Account does not exist', 'signInMessage');
        } else if (errorCode === 'auth/wrong-password') {
          showMessage('Incorrect password', 'signInMessage');
        } else if (errorCode === 'auth/invalid-email') {
          showMessage('Invalid email format', 'signInMessage');
        } else {
          showMessage('Login failed: ' + error.message, 'signInMessage');
        }
        console.error("Sign in error:", error);
      });
  });
}