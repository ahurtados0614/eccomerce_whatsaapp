<?php

namespace Drupal\color_pickr\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'color_pickr' field type.
 *
 * @FieldType(
 *   id = "color_pickr_code",
 *   label = @Translation("Color Pickr"),
 *   description = @Translation("This field stores code color pickrs in the database."),
 *   default_widget = "color_pickr_default",
 *   default_formatter = "color_pickr_default"
 * )
 */
class ColorPickrItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field) {
    return [
      'columns' => [
        'color_pickr' => [
          'type' => 'varchar',
          'length' => 256,
          'not null' => FALSE,
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $value = $this->get('color_pickr')->getValue();
    return $value === NULL || $value === '';
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties['color_pickr'] = DataDefinition::create('string')
      ->setLabel(t('Color pickr'));

    return $properties;
  }

}
