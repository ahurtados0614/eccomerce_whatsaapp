(function (Drupal, once, $) {

  Drupal.behaviors.productGallery = {
    attach: function (context) {

      // ===== ZOOM =====
      once('initZoom', context.querySelectorAll('#tmzoom'))
        .forEach(function (el) {
          $(el).elevateZoom({
            gallery: false,
            cursor: "pointer",
            zoomType: "lens",
            //zoomType: "window",
            lensSize: 250,
            zoomLevel: 1.5
          });
        });

      // ===== CAMBIO DE IMAGEN =====
      once('galleryClick', context.querySelectorAll('.elevatezoom-gallery'))
        .forEach(function (el) {

          el.addEventListener('click', function (e) {
            e.preventDefault();

            var newImage = el.dataset.image;
            var newZoom = el.dataset.zoomImage;

            var ez = $('#tmzoom').data('elevateZoom');

            if (ez) {
              ez.swaptheimage(newImage, newZoom);
            }
            
          });

        });

      // ===== PREV / NEXT FUNCIONAL =====
      once('carouselNav', context.querySelectorAll('.additional-carousel'))
  .forEach(function (wrapper) {

    var inner = wrapper.querySelector('.slider-wrapper');
    var outer = wrapper.querySelector('.slider-wrapper-outer');
    var prevBtn = wrapper.querySelector('.prev');
    var nextBtn = wrapper.querySelector('.next');

    if (!inner || !outer) return;

    var position = 0;
    var step = 110;

    inner.style.transition = "transform 0.3s ease";

    prevBtn.addEventListener('click', function () {

      position += step;
      if (position > 0) position = 0;

      inner.style.transform = "translateX(" + position + "px)";
    });

    nextBtn.addEventListener('click', function () {

      var visibleWidth = outer.offsetWidth;
      var totalWidth = inner.scrollWidth;
      var maxScroll = totalWidth - visibleWidth;

      position -= step;

      if (Math.abs(position) > maxScroll) {
        position = -maxScroll;
      }

      inner.style.transform = "translateX(" + position + "px)";
    });

  });

    }
  };

})(Drupal, once, jQuery);