<?php
namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;

class CartController extends ControllerBase {

  public function getProducts() {

  $ids = \Drupal::request()->query->get('ids');

  if (!$ids) {
    return new JsonResponse([]);
  }

  $ids = explode(',', $ids);
  $nodes = Node::loadMultiple($ids);

  $products = [];

  foreach ($nodes as $node) {

    if ($node->bundle() === 'article') {

      $products[] = [
        'id' => $node->id(),
        'sku' => $node->field_codigo_sku->value ?? null,
        'name' => $node->label(),
        'price' => (float) $node->field_precio_del_articulo->value,
      ];
    }
  }

  return new JsonResponse($products);

  }
}