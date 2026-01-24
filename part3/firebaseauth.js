import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Use the SAME Firebase config as homepage.js
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
const googleProvider = new GoogleAuthProvider();

// Admin email configuration
const ADMIN_EMAIL = "saniulhasan23@gmail.com";

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

// Function to determine redirect URL based on user email
function getRedirectUrl(userEmail) {
  return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() 
    ? 'admin.html' 
    : 'homepage.html';
}

// Function to handle Google Sign In/Sign Up
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Extract user information from Google
    const userData = {
      email: user.email,
      firstName: user.displayName?.split(' ')[0] || "Google",
      lastName: user.displayName?.split(' ')[1] || "User",
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      provider: "google"
    };
    
    // Save user data to Firestore
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, userData, { merge: true });
    
    showMessage('Google login successful!', 'signInMessage');
    
    // Store user ID in localStorage
    localStorage.setItem('loggedInUserId', user.uid);
    console.log("Google user logged in with ID:", user.uid);
    
    // Determine redirect URL based on email
    const redirectUrl = getRedirectUrl(user.email);
    
    // Redirect to appropriate page
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
    
  } catch (error) {
    console.error("Google sign in error:", error);
    
    const errorCode = error.code;
    if (errorCode === 'auth/popup-closed-by-user') {
      showMessage('Sign in cancelled', 'signInMessage');
    } else if (errorCode === 'auth/popup-blocked') {
      showMessage('Popup was blocked. Please allow popups for this site.', 'signInMessage');
    } else if (errorCode === 'auth/unauthorized-domain') {
      showMessage('This domain is not authorized. Please contact support.', 'signInMessage');
    } else {
      showMessage('Google sign in failed: ' + error.message, 'signInMessage');
    }
  }
}

// Google Sign In Button Event Listeners
const googleSignInBtn = document.getElementById('googleSignIn');
const googleSignUpBtn = document.getElementById('googleSignUp');

if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

if (googleSignUpBtn) {
  googleSignUpBtn.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

// Sign Up Functionality (email/password)
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
          createdAt: new Date().toISOString(),
          provider: "email"
        };
        
        showMessage('Account Created Successfully', 'signUpMessage');
        
        // Save user data to Firestore
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
          .then(() => {
            console.log("User data saved to Firestore with ID:", user.uid);
            // Store user ID in localStorage
            localStorage.setItem('loggedInUserId', user.uid);
            
            // Determine redirect URL based on email
            const redirectUrl = getRedirectUrl(email);
            
            // Redirect to appropriate page
            window.location.href = redirectUrl;
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

// Sign In Functionality (email/password)
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
        
        // Determine redirect URL based on email
        const redirectUrl = getRedirectUrl(email);
        
        // Redirect to appropriate page
        setTimeout(() => {
          window.location.href = redirectUrl;
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