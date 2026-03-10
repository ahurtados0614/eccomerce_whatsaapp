var widthClassOptions = {
  bestseller: 'bestseller_default_width',
  featured: 'featured_default_width',
  special: 'special_default_width',
  latest: 'latest_default_width',
  related: 'related_default_width',
  additional: 'additional_default_width',
  tabbestseller: 'tabbestseller_default_width',
  tabfeatured: 'tabfeatured_default_width',
  tabspecial: 'tabspecial_default_width',
  tablatest: 'tablatest_default_width',
  module: 'module_default_width',
  testimonial: 'testimonial_default_width',
  blog: 'blog_default_width',
  ourcategory: 'ourcategory_default_width'
};

(function (Drupal, once, $) {

  Drupal.behaviors.vigilsTheme = {
    attach: function (context) {

      /* ------------------------------
         SELECT PERSONALIZADO
      --------------------------------*/
      once('customSelect', context.querySelectorAll('#content select, .header-search select'))
        .forEach(el => $(el).customSelect());

      /* ------------------------------
         MOVIMIENTOS DOM
      --------------------------------*/
      once('breadcrumbMove', context.querySelectorAll('ul.breadcrumb'))
        .forEach(el => $(el).prependTo('.wrap-breadcrumb .container'));

      once('leftBannerMove', context.querySelectorAll('.leftbanner-block'))
        .forEach(el => $(el).appendTo('.featured-left'));

      /* ------------------------------
         DROPDOWNS GENERALES
      --------------------------------*/
      once('documentClick', context.querySelectorAll('body'))
        .forEach(() => {
          $(document).on('click', function () {
            $(".cart-menu, .myaccount-menu, .language-menu, .currency-menu").slideUp('slow');
            $(".dropdown-toggle").removeClass('active');
          });
        });

      /* ------------------------------
         MOBILE TOGGLE FOOTER
      --------------------------------*/
      function mobileToggleMenu() {
        if ($(window).width() < 992) {

          $("#footer .mobile_togglemenu").remove();
          $("#footer .column h5")
            .append("<a class='mobile_togglemenu'></a>")
            .addClass('toggle');

          $(".mobile_togglemenu").on('click', function () {
            $(this).parent().toggleClass('active')
              .parent().find('ul').toggle('slow');
          });

        } else {

          $("#footer .column h5")
            .removeClass('active toggle')
            .parent().find('ul').removeAttr('style');

          $(".mobile_togglemenu").remove();
        }
      }

      mobileToggleMenu();
      $(window).on('resize', mobileToggleMenu);

      /* ------------------------------
         BACK TO TOP
      --------------------------------*/
      once('topButton', 'body').forEach(() => {
  // Agregar botón solo si no existe
  if ($('.top_button').length === 0) {
    $("body").append("<a class='top_button' title='Back To Top'>TOP</a>");
  }

  // Mostrar/ocultar botón
  $(window).on('scroll', function () {
    $('.top_button').toggle($(window).scrollTop() > 70);
  });

  // Click para volver arriba
  $(document).on('click', '.top_button', function (e) {
    e.preventDefault();
    // Usa 'html, body' y fuerza scroll
    $('html, body').animate({ scrollTop: 0 }, 800);
  });
});

      /* ------------------------------
         FIXED HEADER
      --------------------------------*/
      function headerfix() {
        $(".nav-container").toggleClass('fixed', $(window).scrollTop() > 250);
      }

      headerfix();
      $(window).on('scroll resize', headerfix);

      /* ------------------------------
         PRODUCT CAROUSEL
      --------------------------------*/
      function productCarouselAutoSet() {

        $("#content .product-carousel").each(function () {

          var objectID = $(this).attr('id');
          var key = objectID.replace('-carousel', '').split('-')[0];
          var myDefClass = widthClassOptions[key] || 'grid_default_width';

          var slider = $("#" + objectID);

          slider.sliderCarousel({
            defWidthClss: myDefClass,
            subElement: '.slider-item',
            subClass: 'product-block',
            slideSpeed: 200,
            paginationSpeed: 800,
            autoPlay: false,
            responsive: true
          });

        });

      }

      productCarouselAutoSet();

    }
  };

})(Drupal, once, jQuery);