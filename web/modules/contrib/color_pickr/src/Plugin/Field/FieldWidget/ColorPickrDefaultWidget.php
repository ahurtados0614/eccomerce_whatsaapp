<?php

namespace Drupal\color_pickr\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'color_pickr_default' widget.
 *
 * @FieldWidget(
 *   id = "color_pickr_default",
 *   label = @Translation("Color Pickr Default"),
 *   field_types = {
 *     "color_pickr_code"
 *   }
 * )
 */
class ColorPickrDefaultWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'theme' => "classic",
      'hide_description' => FALSE,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = parent::settingsForm($form, $form_state);

    $elements['theme'] = [
      '#type' => 'select',
      '#title' => $this->t('Theme'),
      '#default_value' => $this->getSetting('theme'),
      '#options' => [
        'classic' => $this->t('Classic'),
        'monolith' => $this->t('Monolith'),
        'nano' => $this->t('Nano'),
      ],
      '#description' => $this->t('The input theme used for this field.'),
    ];

    // Hide Description textbox on edit page.
    $elements['hide_description'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide Description Field'),
      '#description' => $this->t('Check this box to hide the description field.'),
      '#default_value' => $this->getSetting('hide_description'),
    ];
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Theme: @theme', ['@theme' => $this->getSetting('theme')]);
    $summary[] = $this->t('Hide Description Textbox : @hide_description',
      [
        '@hide_description' => $this->getSetting('hide_description') == 1 ?
        'Yes' : "No",
      ]);
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    $theme = $this->getSetting('theme');
    $uuid = \Drupal::service('uuid')->generate();
    $element['color_pickr'] = [
      '#title' => $this->t('Description'),
      '#type' => 'textfield',
      '#default_value' => $items[$delta]->color_pickr ?? NULL,
      '#attached' => [
        'library' => ['color_pickr/color_pickr'],
        'drupalSettings' => [
          'uuid' => $uuid,
          'theme' => $theme,
        ],
      ],
      '#suffix' => '<div class="color-picker" data-id=' . $uuid . '></div>',
      '#attributes' => [
        'class' => ['color-picker-' . $uuid, 'color-picker-field'],
        'readonly' => TRUE,
        'style' => $this->getSetting('hide_description') == TRUE ? 'display:none' : 'display:block',
      ],
    ];
    return $element;
  }

}
