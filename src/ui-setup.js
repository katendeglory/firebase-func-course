import { auth, db, func } from "./firebase-setup";

const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');

const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');

const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');


let app = new Vue({
  el: '#app',
  data: {
    requests: []
  },
  mounted() {
    db.collection('request').orderBy('upvotes', 'desc').onSnapshot(snapshot => {
      const requests = [];
      snapshot.docs.forEach(doc => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  },
  methods: {
    upvoteRequest(id) {
      const upVote = func.httpsCallable('upvote');
      upVote({ id })
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
});



// open request modal
requestLink.addEventListener('click', () => {
  requestModal.classList.add('open');
});


// close request modal
requestModal.addEventListener('click', (e) => {
  if (e.target.classList.contains('new-request')) {
    requestModal.classList.remove('open');
  }
});


// toggle auth modals
authSwitchLinks.forEach(link => {
  link.addEventListener('click', () => {
    authModals.forEach(modal => modal.classList.toggle('active'));
  });
});


/********************** FIREBASE ACTIONS **********************/


// Register form
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = registerForm.email.value;
  const password = registerForm.password.value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(res => console.log(res.user.email))
    .catch(err => console.log(err.message));

});


// login form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      console.log('logged in', user);
      loginForm.reset();
    })
    .catch(error => {
      loginForm.querySelector('.error').textContent = error.message;
    });
});


// Sign out
signOut.addEventListener('click', () => {
  auth
    .signOut()
    .then(() => console.log('signed out'));
});


// On auth change
auth.onAuthStateChanged(user => {
  if (user) {
    authWrapper.classList.remove('open');
    authModals.forEach(modal => modal.classList.remove('active'));
    console.log(`Signed in as ${user.email}`);

    user
      .getIdTokenResult()
      .then(token => console.log(`${token.claims.admin ? "You're an admin" : "You're a mere user"}`));

  } else {
    authWrapper.classList.add('open');
    authModals[0].classList.add('active');
  }
});


// Add a new request
requestForm.addEventListener('submit', e => {
  e.preventDefault();

  const addRequest = func.httpsCallable('addRequest');
  addRequest({ text: requestForm.request.value })
    .then(res => {
      requestForm.reset();
      requestModal.classList.remove('open');
      requestForm.querySelector('.error').textContent = "";
    })
    .catch(err => {
      console.log(err.message);
      requestForm.querySelector('.error').textContent = err.message;
    });
})