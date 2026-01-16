import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


  const firebaseConfig = {
    apiKey: "AIzaSyA5BfyQMBH4LS_yorgo54xgLV-kIK8NWOw",
    authDomain: "setup-crud.firebaseapp.com",
    projectId: "setup-crud",
    storageBucket: "setup-crud.firebasestorage.app",
    messagingSenderId: "617422603142",
    appId: "1:617422603142:web:4323ab520461e68ab9e207"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    await addDoc(collection(db, "users"), {
      name: "don",
      lastName: "sani",
      born: 20101999
    });
    console.log("good");
  } catch (err) {
    console.log(err);
  }

  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach(doc => {
    console.log(doc.data());
  });