/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 */

(function() {
    let touchingCarousel = false,
      touchStartCoords;

    document.body.addEventListener('touchstart', function(e) {
      if (e.target.closest('.flickity-slider')) {
        touchingCarousel = true;
      } else {
        touchingCarousel = false;
        return;
      }

      touchStartCoords = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }
    });

    document.body.addEventListener('touchmove', function(e) {
      if (!(touchingCarousel && e.cancelable)) {
        return;
      }

      let moveVector = {
        x: e.touches[0].pageX - touchStartCoords.x,
        y: e.touches[0].pageY - touchStartCoords.y
      };

      if (Math.abs(moveVector.x) > 7)
        e.preventDefault()

    }, {passive: false});
  })();