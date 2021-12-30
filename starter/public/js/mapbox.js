/* eslint-disable */
// grabbing the data-locations from our map element from tour.pug map section.
// we converted the locations data to a string and then here back to JSON.
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoidGhlam9lZ2FsYXh5IiwiYSI6ImNreHM3MmIzbDVrbHIycXBmb25paDZuc3gifQ.y4N0oIW-R5kXeUiqhogVJA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/thejoegalaxy/ckxsa7wms2kll14t8ua9tdh7g',
  scrollZoom: false,
  //   center: [-96, 37.8],
  //   zoom: 5,
  //   //interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

//for each loc, location, we are adding a marker on the map.
locations.forEach((loc) => {
  //Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom', //specifying the bottom of the image to be on the gps location.
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // add a popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // extend map bounds to include current location.
  bounds.extend(loc.coordinates);

  //ensures all the markers fit on the map, with padding.
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
});
