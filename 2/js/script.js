'use strict'

const form = document.querySelector('.form');

form.addEventListener('submit', elem => {
   elem.preventDefault();
   const email = form.email.value;
   const password = form.password.value;
   let at = email.indexOf("@");
   let dot = email.indexOf(".");
   if (at < 1 || dot < 1) {
      alert('Invalid email address!');
      return false;
   }
   if (password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return false;
   }
});