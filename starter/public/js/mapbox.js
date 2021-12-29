/* eslint-disable */
// grabbing the data-locations from our map element from tour.pug map section.
// we converted the locations data to a string and then here back to JSON.
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
