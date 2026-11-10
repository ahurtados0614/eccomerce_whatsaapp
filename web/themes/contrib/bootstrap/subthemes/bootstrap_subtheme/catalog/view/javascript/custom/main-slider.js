(function (Drupal, once) {

  Drupal.behaviors.mainSlider = {
    attach: function (context) {

      once('main-slider', context.querySelectorAll('#slideshow0')).forEach(function (container) {
        loadItemsMainSlider(container);
      });

      function loadItemsMainSlider(container) {
        fetch('/api/slider-principal')
          .then(res => res.json())
          .then(data => {
            let html = '';

            data.forEach(item => {
              if (item.items && item.items.includes('<img')) {
                html += item.items;
              }
            });

            const wrapper = container.querySelector('.swiper-wrapper');

            if (wrapper) {
              wrapper.innerHTML = html;
              initSwiper(container);
            }
          });
      }

      function initSwiper(container) {

        // Destruir Swiper previo si existe
        if (container.swiper) {
          container.swiper.destroy(true, true);
        }

        const slides = container.querySelectorAll('.swiper-slide');
        const totalSlides = slides.length;

        if (totalSlides <= 1) return;

        // 🔹 Forzar loop incluso con 2 slides para que autoplay funcione
        const loopSlides = totalSlides >= 2;

        const swiper = new Swiper(container, {
          slidesPerView: 1,
          effect: 'fade',
          fade: true, // Swiper 3.x
          speed: 800,
          loop: loopSlides,
          autoplay: 1000, // 25 segundos
          autoplayDisableOnInteraction: false,

          navigation: {
            nextEl: '.swiper-next',
            prevEl: '.swiper-prev',
          },

          pagination: {
            el: '.swiper-pagination',
            clickable: true
          }
        });

        // Botones personalizados dentro de <ul class="swiper-pager-button">
        const pagerPrev = container.closest('.swiper-viewport').querySelector('.swiper-button-prev a');
        const pagerNext = container.closest('.swiper-viewport').querySelector('.swiper-button-next a');

        if (pagerPrev && pagerNext) {
          pagerPrev.addEventListener('click', function (e) {
            e.preventDefault();
            swiper.slidePrev();
          });
          pagerNext.addEventListener('click', function (e) {
            e.preventDefault();
            swiper.slideNext();
          });
        }

        // Control manual del autoplay al pasar el cursor
        const viewport = container.closest('.swiper-viewport');
        viewport.addEventListener('mouseenter', () => {
          swiper.stopAutoplay();
        });
        viewport.addEventListener('mouseleave', () => {
          swiper.startAutoplay();
        });

      }

    }
  };

})(Drupal, once);