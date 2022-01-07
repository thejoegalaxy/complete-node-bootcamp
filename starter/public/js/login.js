/* eslint-disable */
//import axios from 'axios'; //may not need to import this because not using bundle.js.

//import { showAlert } from './alerts';
//hack: put this here so it would work.
// const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) el.parentElement.removeChild(el);
// };
// // type is 'success' or 'error'
// const showAlert = (type, msg) => {
//   hideAlert();
//   console.log('showAlert');
//   const markup = `<div class="alert alert--${type}">${msg}</div>`;
//   document.querySelector('body').insertAdjacentElement('afterbegin', markup);
//   window.setTimeout(hideAlert, 5000);
// };

const login = async (email, password) => {
  //   alert(email);
  //   console.log(email, password);
  try {
    //axios, returns a promise.
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    //- if login success, alert, redirect to / after 1.5sec.
    if (res.data.status === 'success') {
      alert('Logged in successfully!');
      //showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }

    //console.log(res);
  } catch (err) {
    alert(err.response.data.message);
    //showAlert('error', err.response.data.message);
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) location.reload(true); //important so won't reload from cache.
  } catch (err) {
    alert('Error logging out! Try again.');
  }
};

// console.log('Hello from parcel');
//event listener listening for the submit event on our login form.
//form class.  select form element.  event when user clicks the submit buttom
// browser will fire off this event. we will have access to that event in the callback function.
// added an if for the .form to get rid of syntax error occuring on non login pages with no form.
if (document.querySelector('.form--login')) {
  document.querySelector('.form--login').addEventListener('submit', (e) => {
    e.preventDefault();
    //grab email & password values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

//add event listener for the logout class, if it exists.
if (document.querySelector('.nav__el--logout')) {
  document.querySelector('.nav__el--logout').addEventListener('click', logout);
}

//- include this login file into the base.pug.
