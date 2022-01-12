/* eslint-disable */

// updateSettings
// type is either 'password' or 'data'
const updateSettings = async (data, type) => {
  //alert(type);
  try {
    //axios, returns a promise.

    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    //- if update success, alert, redirect to / after 1.5sec.
    if (res.data.status === 'success') {
      alert(`${type.toUpperCase()} Update successfully!`);
      //showAlert('success', 'Logged in successfully!');
      //   window.setTimeout(() => {
      //     location.reload();
      //   }, 500);
    }

    //console.log(res);
  } catch (err) {
    alert(err.response.data.message);
    //showAlert('error', err.response.data.message);
  }
};

//listen for user data submit.
if (document.querySelector('.form-user-data')) {
  document.querySelector('.form-user-data').addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    //console.log(form);

    //grab name & email values
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // console.log(name, email);
    //axios ajax will recognize form as an object and work.
    updateSettings(form, 'data');
  });
}

if (document.querySelector('.form-user-password')) {
  document
    .querySelector('.form-user-password')
    .addEventListener('submit', (e) => {
      e.preventDefault();
      //document.querySelector('.btn--save-password').textContent = 'Updating...';
      //TODO: fix button textContent.
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      // console.log(name, email);
      updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );
      //   document.querySelector('.btn--save-password').textContent =
      //     'Save password';

      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
}
