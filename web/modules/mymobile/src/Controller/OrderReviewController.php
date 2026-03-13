<?php

namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;

class OrderReviewController extends ControllerBase {

  public function view($id) {

    $client = \Drupal::httpClient();

    try {

      $response = $client->get(\Drupal::request()->getSchemeAndHttpHost() . '/api/order/' . $id);

      $data = json_decode($response->getBody(), TRUE);

      $order = $data['data'];

      // Decodificar payload
      $payload = json_decode($order['payload'], TRUE);

    } catch (\Exception $e) {

      $order = [];
      $payload = [];

    }

    return [
      '#theme' => 'order_review',
      '#order' => $order,
      '#payload' => $payload,
      '#cache' => [
          'max-age' => 0,
        ],
    ];

  }

}