/* eslint-disable */

const stripe = Stripe(
  'pk_test_51KGXixG08hObwnMYYMfOAgT1RpB6Igp0WZUGX3xEceN6UXj5RiHVDkzFboGE43eQIUsHkEpDehHZ8F3WHblnccyZ00op8D1zla'
);

const bookBtn = document.getElementById('book-tour');

const bookTour = async (tourId) => {
  try {
    // 1. Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //console.log(session);
    //2. Create checkout form + charge the credit card.
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    //console.log(err);
    Alert(err);
  }
};

//grab tourId from tour.pug and call bookTour with tourId.
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    //console.log('.book-tour');
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; //e.target.dataset.tourId, destructuring.
    bookTour(tourId);
  });
}
