(function (Drupal, once, $) {

  // ---------------------------
  // GET URL VAR
  // ---------------------------

  function getURLVar(key) {

    var value = [];
    var query = String(document.location).split('?');

    if (query[1]) {

      var part = query[1].split('&');

      for (var i = 0; i < part.length; i++) {

        var data = part[i].split('=');

        if (data[0] && data[1]) {
          value[data[0]] = data[1];
        }

      }

      return value[key] ? value[key] : '';

    }

  }

  // ---------------------------
  // DRUPAL BEHAVIOR
  // ---------------------------

  Drupal.behaviors.opencartTheme = {

    attach: function (context) {

      once('errorHighlight', context.querySelectorAll('.text-danger')).forEach(function (el) {

        var element = $(el).parent().parent();

        if (element.hasClass('form-group')) {
          element.addClass('has-error');
        }

      });

    }

  };

  // ---------------------------
  // CART GLOBAL
  // ---------------------------

  window.cart = {

    add: function (product_id, quantity) {

      $.ajax({
        url: 'index.php?route=checkout/cart/add',
        type: 'post',
        data: {
          product_id: product_id,
          quantity: (typeof quantity !== 'undefined' ? quantity : 1)
        },
        dataType: 'json'
      });

    }

  };

  // ---------------------------
  // AUTOCOMPLETE FIX
  // ---------------------------

  $.fn.autocomplete = function(option) {

    return this.each(function() {

      var self = this;
      self.timer = null;
      self.items = [];

      $.extend(self, option);

      $(self).attr('autocomplete', 'off');

    });

  };

})(Drupal, once, jQuery);