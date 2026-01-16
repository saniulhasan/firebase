

  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
  import { 
    getFirestore ,
    addDoc,
    collection ,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc

} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
     apiKey: "AIzaSyADn8XpkMEpNWiHVnZzKh28joCr0_kPEy0",
    authDomain: "crud-bf443.firebaseapp.com",
    projectId: "crud-bf443",
    storageBucket: "crud-bf443.firebasestorage.app",
    messagingSenderId: "561708638704",
    appId: "1:561708638704:web:f46a790625986d4082fd35",
    measurementId: "G-EHHTN1J0D9"

  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app)

  const notify = document.querySelector('.notify');

//   add data to Fire store 


 async function addData(){

    const name =  document.querySelector('#name').value;
    const email =  document.querySelector('#email').value;
    
      try {
          const DocRef = await addDoc(collection(db,"users"),{
              name:name,
              email:email

          })
           notify.innerHTML = `Data Added `
            document.querySelector('#name').value="";
             document.querySelector('#email').value="";


             setTimeout(()=>{
                notify.innerHTML = ""
             },3000)

             GetData()

      } catch(eror){
        console.log(eror);
      }

 }
  const addBtn = document.querySelector('#add_Data')

  addBtn.addEventListener('click', addData)



//   Get Data from Fire store

 async function GetData(){
     try{
         const getDataQuery = await getDocs(collection(db,"users"))
          let html = "";

            getDataQuery.forEach((doc)=>{
               const data = doc.data()

                html  += `
                 <tr>
                     <td>${doc.id}</td>
                     <td>${data.name}</td>
                     <td>${data.email}</td>
                     <td><button class="del_btn" onclick="deleteData('${doc.id}')">Delete</button></td>
                     <td><button class="up_btn" onclick="updateData('${doc.id}')">Update</button></td>
  

                 </tr>        
                `

            })
            document.querySelector('table').innerHTML = html

     }catch(err){
        console.log(err);
     }
 }

 GetData()


//  deleteData

 window.deleteData =  async function(id){
          try{
             await deleteDoc(doc(db, "users", id))
             notify.innerHTML = "data Deleted";

              setTimeout(()=>{
                 notify.innerHTML = ""
              },3000)

             getDocs()

          }catch(err){
                    console.log(err);
          }
 }


//  update data 

window.updateData =  async function(id){
     try{
          const docSnapShot = await getDoc(doc(db , "users", id))
           const currentUser  = docSnapShot.data()
           document.querySelector('#name').value= currentUser.name;
           document.querySelector('#email').value=currentUser.email;

           const updateDataBtn = document.querySelector('#update_data')
            updateDataBtn.classList.add('show')
            addBtn.classList.add('hide')
            updateDataBtn.addEventListener("click", async function (){
                 const newName = document.querySelector('#name').value;
                 const newEmail = document.querySelector('#email').value

                 if( newName !== null && newEmail !== null){
                     await updateDoc(doc(db,"users",id),{
                         name: newName,
                         email: newEmail
                     })

                      notify.innerHTML = "Data Updated"
                      GetData()
                      updateDataBtn.classList.remove('show')
                      addBtn.classList.remove('hide')

                      document.querySelector('#name').value="";
                        document.querySelector('#email').value="";


                        setTimeout(()=>{
                            notify.innerHTML = ""
                        },3000)

                 }

            })


     }catch(err){
        console.log(err);
     }

}
