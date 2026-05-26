(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.color_picker = {
    attach: function (context, settings) {
      once('color_picker', 'body', context).forEach(function (element) {
        function color_picker_handle() {
          var theme = drupalSettings.theme;
          jQuery('.color-picker').each(function (index, value) {
            var uuid = jQuery(this).data('id');
            var default_color = jQuery('.color-picker-' + uuid).val();
            if(default_color == '') {
              default_color = '#3F51B5CC';
            } else if(default_color == 'none') {
              default_color = '';
            }

            var pickr = Pickr.create({
              el: this,
              theme: theme,
            default: default_color,
              swatches: [
                'rgba(244, 67, 54, 1)',
                'rgba(233, 30, 99, 0.95)',
                'rgba(156, 39, 176, 0.9)',
                'rgba(103, 58, 183, 0.85)',
                'rgba(63, 81, 181, 0.8)',
                'rgba(33, 150, 243, 0.75)',
                'rgba(3, 169, 244, 0.7)',
                'rgba(0, 188, 212, 0.7)',
                'rgba(0, 150, 136, 0.75)',
                'rgba(76, 175, 80, 0.8)',
                'rgba(139, 195, 74, 0.85)',
                'rgba(205, 220, 57, 0.9)',
                'rgba(255, 235, 59, 0.95)',
                'rgba(255, 193, 7, 1)',
                'rgba(170, 128, 2, 1)'
                ],

              components: {

        // Main components
                preview: 'TRUE',
                opacity: 'TRUE',
                hue: 'TRUE',

        // Input / output Options
                interaction: {
                  hex: 'TRUE',
                  rgba: 'TRUE',
                  hsla: 'TRUE',
                  hsva: 'TRUE',
                  cmyk: 'TRUE',
                  input: 'TRUE',
                  clear: 'TRUE',
                  save: 'TRUE',
                  cancel: 'TRUE'
                }
              }
            });

            pickr.on('init', instance => {
            }).on('hide', instance => {
            }).on('show', (color, instance) => {

            }).on('save', (color, instance) => {
              if (typeof color !== 'undefined') {
                var current_color = color
                .toHEXA()
                .toString();
                jQuery('.color-picker-' + uuid).val(current_color).trigger("change");

              }
              pickr.hide();

            }).on('clear', instance => {

              jQuery('.color-picker-' + uuid).val('none');

            }).on('change', (color, source, instance) => {
            }).on('changestop', (source, instance) => {
            }).on('cancel', instance => {
            }).on('swatchselect', (color, instance) => {
            });
          });
        }
        color_picker_handle();
        $(document, context).ajaxComplete(function () {
          color_picker_handle();
        });
      });
    }
  }
}(jQuery, Drupal, drupalSettings, once));
