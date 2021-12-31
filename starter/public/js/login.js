/* eslint-disable */

const login = async (email, password) => {
  //alert(email, password);
  console.log(email, password);
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
    console.log(res);
  } catch (err) {
    console.log(err.response.data);
  }
};
//event listener listening for the submit event on our login form.
//form class.  select form element.  event when user clicks the submit buttom
// browser will fire off this event. we will have access to that event in the callback function.
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  //grab email & password values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
//- include this login file into the base.pug.
