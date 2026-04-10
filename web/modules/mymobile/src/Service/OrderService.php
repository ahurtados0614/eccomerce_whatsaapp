<?php

namespace Drupal\mymobile\Service;

use Drupal\Core\Database\Connection;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\Core\Database\Query\PagerSelectExtender;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;

class OrderService {

  protected $database;
  protected $requestStack;

  public function __construct(Connection $database, RequestStack $request_stack) {
    $this->database = $database;
    $this->requestStack = $request_stack;
  }

  public function createOrder(array $data) {

    $total = 0;
    $items_text = '';

    foreach ($data['items'] as $item) {

      $item_total = $item['price'] * $item['quantity'];
      $total += $item_total;

      $items_text .= "- {$item['quantity']} {$item['name']} [SKU: {$item['sku']}] "
        . "/ COP " . number_format($item['price'], 0, ',', '.') . "\n";
    }

    // Insertar primero para obtener ID
    $id = $this->database->insert('mymobile_orders')
      ->fields([
        'order_number' => '',
        'nombre' => $data['nombre'],
        'celular' => $data['celular'],
        'total' => $total,
        'payload' => json_encode($data),
        'ip_address' => $this->requestStack->getCurrentRequest()->getClientIp(),
        'created' => time(),
        'status' => 'pending'
      ])
      ->execute();

    // Generar número MM-2026-00015
    $year = date('Y');
    $order_number = 'MM-' . $year . '-' . str_pad($id, 5, '0', STR_PAD_LEFT);

    $this->database->update('mymobile_orders')
      ->fields(['order_number' => $order_number])
      ->condition('id', $id)
      ->execute();

    return [
      'id' => $id,
      'order_number' => $order_number,
      'total' => $total,
      'items_text' => $items_text
    ];
  }




public function getOrder($id = null) {

  $query = $this->database->select('mymobile_orders', 'o')
    ->fields('o');

  if (!empty($id)) {

    $query->condition('id', $id);
    $order = $query->execute()->fetchAssoc();

    if ($order) {

      $payload = json_decode($order['payload'], TRUE);

      if (!empty($payload['items'])) {

        foreach ($payload['items'] as &$item) {

          if (!empty($item['id'])) { // 👈 CAMBIO IMPORTANTE

            $node = Node::load($item['id']);

            if ($node && $node->hasField('field_image') && !$node->get('field_image')->isEmpty()) {

              $file = $node->get('field_image')->entity;

              if ($file) {
                $url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
$item['image'] = $url;
              }

            }

          }

        }

      }
      //\Drupal::logger('mymobile')->info('<pre>' . print_r($payload, TRUE) . '</pre>');
      // 👇 devolver array (no json)
      $order['payload'] = $payload;
    }

    return $order;
  }

  return $query->execute()->fetchAllAssoc('id');
}



public function getOrdersFilter($filters = [], $limit = 50) {

  $query = $this->database->select('mymobile_orders', 'o')
    ->fields('o')
    ->orderBy('created', 'DESC');

  if (!empty($filters['status'])) {
    $query->condition('status', $filters['status']);
  }

  if (!empty($filters['nombre'])) {
    $query->condition('nombre', '%' . $filters['nombre'] . '%', 'LIKE');
  }

  if (!empty($filters['celular'])) {
    $query->condition('celular', '%' . $filters['celular'] . '%', 'LIKE');
  }

  /** @var PagerSelectExtender $pager */
  $pager = $query->extend(PagerSelectExtender::class);

  $pager->limit($limit);

  return $pager->execute()->fetchAllAssoc('id');
}

}