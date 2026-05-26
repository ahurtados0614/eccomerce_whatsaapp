## Description
I have created a "basic" color pickr in Drupal 9/10. I won't go into detail 
about [PSR–4](https://drupal.org/node/1971198), [annotations](https://drupal.org/node/1882526) or [plugins](https://drupal.org/node/2087839) or this tutorial will be huge.

Instead, I'll add links to other websites that explain the concept further.

That being said, if you're looking for detailed documentation on the Field API 
in Drupal 8.

In Drupal 8/9, fields are not implemented using hooks like they are in Drupal 7.
Instead, they are created using Drupal 8/9's new 
[Plugin API](https://drupal.org/node/2087839). This means that instead of 
implementing hooks, we define a class for a widget, formatter and field item.
Most Drupal 7 field hooks like `hook_field_schema`, `hook_field_is_empty` and
more; are now methods in classes.


**Getting started:-**


### [](#s-step-1-implement-field-item "Permalink to this headline")Step 1: Implement Field Item

The first bit of work we need to do is define a field item class called 
`ColorPickrItem` that extends the `FieldItemBase` class.

1\. In Drupal 8/9 classes are loaded using [PSR-4](https://drupal.org/node/1971198).

So, to define the `ColorPickrItem` class, we need to create a 
`ColorPickrItem.php` file and place it in 
`"module"/src/Plugin/Field/FieldType/ColorPickrItem.php`

```php
/**
 * @file
 * Contains \Drupal\color_pickr\Plugin\Field\FieldType\ColorPickrItem.
 */

namespace Drupal\color_pickr\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

```

Then in the file we add a namespace `Drupal\color_pickr\Plugin\Field\FieldType` 
and three _use_ statements:

*   `Drupal\Core\Field\FieldItemBase`.
*   `Drupal\Core\Field\FieldStorageDefinitionInterface` .
*   `Drupal\Core\TypedData\DataDefinition`.

2\. Now we need to define the actual field details like the field id, label, 
default widget and formatter etc.. This is equivalent of implementing 
`hook_field_info` in Drupal 7.

In Drupal 8/9 a lot, if not all, of the info hooks have been replaced by [annotations](https://drupal.org/node/1882526).

```php
/**
 * Plugin implementation of the 'color_pickr' field type.
 *
 * @FieldType(
 *   id = "color_pickr_code",
 *   label = @Translation("ColorPickr field"),
 *   description = @Translation("This field stores code color_pickr
 *   in the database."),
 *   default_widget = "color_pickr_default",
 *   default_formatter = "color_pickr_default"
 * )
 */
class ColorPickrItem extends FieldItemBase { }
```

So instead of implementing `hook_field_info`, we define the field as an 
annotation inside of a comment above the class.

The annotation attributes are quite self-explanatory. Just make sure that the
`default_widget` and `default_formatter` reference the widget and formatter 
annotation ID and not the class.

> If you want to learn more about annotations, check out the [Annotations-based plugins](https://drupal.org/node/1882526) documentation page on drupal.org.

3\. Now that we have our field item class, we need to define a few methods. 
The first one we'll look at is `schema()`.

In Drupal 7, when you create a color pickr you define its schema using 
`hook_field_schema`. In Drupal 8/9, we define the schema by adding a `schema()` 
method to the `ColorPickrItem` class.

> The [Schema API documentation](https://api.drupal.org/api/drupal/core%21lib%21Drupal%21Core%21Database%21database.api.php/group/schemaapi/latest) provides a description of schema array structure and possible values. 

```php
/**
 * {@inheritdoc}
 */
public static function schema(FieldStorageDefinitionInterface $field) {
  return array(
    'columns' => array(
      'color_pickr' => array(
        'type' => 'varchar',
        'length' => 256,
        'not null' => FALSE,
      ),
    ),
  );
}
```

4\. Now we need to add the `isEmpty()` method and define what constitutes an 
empty field item. This method is the same as implementing `hook_field_is_empty` 
in Drupal 7.

```php
/**
 * {@inheritdoc}
 */
public function isEmpty() {
  $value = $this->get('color_pickr')->getValue();
  return $value === NULL || $value === '';
}
```

5\. The final method we'll add to the class is the `propertyDefinitions()` 
method.

```php
/**
 * {@inheritdoc}
 */
static $propertyDefinitions;

/**
 * {@inheritdoc}
 */
public static function propertyDefinitions(FieldStorageDefinitionInterface 
  $field_definition) {
  $properties['color_pickr'] = DataDefinition::create('string')
  ->setLabel(t('CustomField description'));

  return $properties;
}
```

This method is used to define the type of data that exists in the field values.
The "ColorPickr field" has just three values: description, code and language. 
So I just added those values to the method as strings.

> Go to the [How Entity API implements Typed Data API](https://drupal.org/node/1795854) documentation on drupal.org to learn more about this.

Note: it needs to be updated to the PSR-4 specification, see 
[https://www.drupal.org/node/2128865](https://www.drupal.org/node/2128865) for 
more details._

### [](#s-step-2-implement-field-widget "Permalink to this headline")Step 2: Implement Field Widget

Now that we've defined the field item, let's create the field widget. 
We need to create a class called `ColorPickrDefaultWidget` that extends 
the `WidgetBase` class.

1\. So create a `ColorPickrDefaultWidget.php` file and add it 
to `"module"/src/Plugin/Field/FieldWidget/ColorPickrDefaultWidget.php`.

```php
/**
 * @file
 * Contains \Drupal\color_pickr\Plugin\Field\FieldWidget\ColorPickrDefaultWidget.
 */

namespace Drupal\color_pickr\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
```

Make sure the file namespace is `Drupal\color_pickr\Plugin\Field\FieldWidget` 
and add the following three _use_ statements:

*   `Drupal\Core\Field\FieldItemListInterface`.
*   `Drupal\Core\Field\WidgetBase`.
*   `Drupal\Core\Form\FormStateInterface`.

2\. Next, we need to define the widget using an annotation. This is the 
equivalent of using `hook_field_widget_info` in Drupal 7.

```php
/**
 * Plugin implementation of the 'color_pickr_default' widget.
 *
 * @FieldWidget(
 *   id = "color_pickr_default",
 *   label = @Translation("ColorPickr default"),
 *   field_types = {
 *     "color_pickr_code"
 *   }
 * )
 */
class ColorPickrDefaultWidget extends WidgetBase { }
```

Just a heads up, make sure that the `field_types` attribute in the annotation 
references the field types using their ID. For this module, it is 
`color_pickr_code` because we added `id = "color_pickr_code",` to 
the `@FieldType` annotation.

3\. And finally, we need to define the actual widget form. We do this by 
adding a `formElement()` method to the `ColorPickrDefaultWidget` class.
This method is the same as using `hook_field_widget_form` in Drupal 7.

```php
/**
 * {@inheritdoc}
 */
public function formElement(FieldItemListInterface $items, $delta, 
  array $element, array &$form, FormStateInterface $form_state) {

  $element['color_pickr'] = array(
    '#title' => $this->t('Color Pickr'),
    '#type' => 'textfield',
    '#default_value' => isset($items[$delta]->color_pickr) 
    ? $items[$delta]->color_pickr : NULL,
  );

  return $element;
}
```

Note: it needs to be updated to the PSR-4 specification, 
see [https://www.drupal.org/node/2128865](https://www.drupal.org/node/2128865) 
for more details._

### [](#s-step-3-implement-field-formatter "Permalink to this headline")Step 3: Implement Field Formatter

The final piece to the puzzle, is the field formatter, and we create it by 
defining a class called `ColorPickrDefaultFormatter` that extends 
the `FormatterBase` class.

1\. Create a `ColorPickrDefaultFormatter.php` file and add it 
to `"module"/src/Plugin/Field/FieldFormatter/ColorPickrDefaultFormatter.php`.

```php
/**
 * @file
 * Contains \Drupal\color_pickr\Plugin\field\formatter\ColorPickrDefaultFormatter.
 */

namespace Drupal\color_pickr\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
```

Make sure the file namespace is `Drupal\color_pickr\Plugin\Field\FieldFormatter` 
and add the following _use_ statements:

*   `Drupal\Core\Field\FieldItemListInterface`.
*   `Drupal\Core\Field\FormatterBase`.

2\. Next, we need to define the formatter as an annotation. The same as we did 
for the widget and field type, this is the equivalent of using 
`hook_field_formatter_info`.

```php
/**
 * Plugin implementation of the 'color_pickr_default' formatter.
 *
 * @FieldFormatter(
 *   id = "color_pickr_default",
 *   label = @Translation("ColorPickr default"),
 *   field_types = {
 *     "color_pickr_code"
 *   }
 * )
 */
class ColorPickrDefaultFormatter extends FormatterBase { }
```

3\. Now the only thing left to do is add the `viewElements()` method and 
define the actual field formatter. Again, this method is the same as 
using `hook_field_formatter_view` in Drupal 7.

```php
/**
 * {@inheritdoc}
 */
public function viewElements(FieldItemListInterface $items, $langcode) {
  $elements = array();
  foreach ($items as $delta => $item) {
    // Render output using color_pickr_default theme.
    $source = array(
      '#theme' => 'color_pickr_default',
      '#color_pickr' => $item->color_pickr,
    );

    $elements[$delta] = array('#markup' => \Drupal::service('renderer')
      ->render($source));
  }

  return $elements;
}
```

4\. Create a color_pickr.module file and add code that defines twig templates. 
The key of each item in the array is what you will need to call the template.

```php
/**
 * Implements hook_theme().
 */
function color_pickr_theme() {
  return array(
    'color_pickr_default' => array(
      'variables' => array('color_pickr' => NULL),
      'template' => 'color-pickr-default',
    ),
  );
}
```

5\. In our module, inside of the templates folder, create a twig 
template. The name of the file has to match what you put into hook_theme() 
(make sure replace underscores with dashes). In this case, the file name 
would be `color-pickr-default.html.twig`. The reason for this is I didn't 
want to put a lot of logic or HTML code in the `viewElements()` method.

```twig
{% if color_pickr %}
  <div class="color-pickr-default" style="background-color: 
  {{ color_pickr }};"></div>
{% endif %}
```

### [](#s-conclusion "Permalink to this headline")Conclusion

As stated earlier the biggest change in Drupal 8 is that fields are created 
using the [Plugin API](https://drupal.org/node/2087839) and not hooks. 
Once you understand that, the concept of creating a field is very similar to 
Drupal 7. A lot of the methods in Drupal 8 match the hooks in Drupal 7.
