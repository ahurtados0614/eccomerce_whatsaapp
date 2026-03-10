(function ($, Drupal) {

  $.fn.tabs = function () {

    var selector = this;

    this.each(function () {

      var obj = $(this);

      $(obj.attr('href')).hide();

      obj.on('click', function (e) {
        e.preventDefault();

        $(selector).removeClass('selected');
        $(this).addClass('selected');

        $($(this).attr('href')).fadeIn();

        $(selector).not(this).each(function (i, element) {
          $($(element).attr('href')).hide();
        });

        if (typeof productListAutoSet === 'function') {
          productListAutoSet();
        }

      });

    });

    $(this).show();
    $(this).first().trigger('click');

    return this;

  };

})(jQuery, Drupal);