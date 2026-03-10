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
    $products = [];

    foreach ($ids as $id) {

      $node = Node::load($id);

      if ($node && $node->bundle() === 'article') {

        $price = (float) $node->field_precio_del_articulo->value;

        $products[] = [
          'id' => $node->id(),
          'name' => $node->label(),
          'price' => $price,
        ];
      }
    }

    return new JsonResponse($products);
  }
}