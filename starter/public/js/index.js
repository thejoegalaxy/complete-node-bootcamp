/* eslint-disable */
//import '@babel/polyfill';
//import { displayMap } from './mapbox'; this change doesn't work.
//import { login } from './login';

//This file is used to get info from the user interface and delegate the actions.

// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// displayMap(locations); //this change didn't work. rolled it back.

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) alert(`${alertMessage}`);
