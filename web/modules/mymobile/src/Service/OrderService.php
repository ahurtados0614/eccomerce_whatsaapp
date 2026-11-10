<?php

namespace Drupal\mymobile\Service;

use Drupal\Core\Database\Connection;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\node\Entity\Node;

class OrderService
{

  protected $database;
  protected $requestStack;

  public function __construct(
    Connection $database,
    RequestStack $request_stack
  ) {
    $this->database = $database;
    $this->requestStack = $request_stack;
  }

  /**
   * Crear pedido.
   */
  public function createOrder(array $data)
  {

    $total = 0;
    $items_text = '';

    foreach ($data['items'] as $item) {

      $item_total =
        $item['price'] * $item['quantity'];

      $total += $item_total;

      $color_text = !empty($item['color'])
        ? " | Color: {$item['color']}"
        : '';

      $talla_text = !empty($item['talla'])
        ? " | Talla: {$item['talla']}"
        : '';

      $items_text .=
        "- {$item['quantity']} {$item['name']} " .
        "[SKU: {$item['sku']}]" .
        $color_text .
        $talla_text .
        " / COP " .
        number_format(
          $item['price'],
          0,
          ',',
          '.'
        ) .
        "\n";
    }


    // ==========================================================
    // FECHA ESTIMADA DE ENTREGA
    // ==========================================================
    //
    // Si el frontend/API envía una fecha,
    // utilizamos esa fecha.
    //
    // Si no la envía, usamos +3 días como
    // fecha estimada predeterminada.
    //

    if (!empty($data['estimated_delivery_date'])) {

      $estimated_delivery_date =
        $data['estimated_delivery_date'];

    }
    else {

      $estimated_delivery_date =
        date(
          'Y-m-d',
          strtotime('+3 days')
        );
    }


    // ==========================================================
    // INSERTAR PEDIDO
    // ==========================================================

    $fields = [

      'order_number' => '',

      'nombre' =>
        $data['nombre'],

      'celular' =>
        $data['celular'],

      'email' =>
        $data['email'] ?? '',

      'total' =>
        $total,

      'payload' =>
        json_encode(
          $data,
          JSON_UNESCAPED_UNICODE
        ),

      'ip_address' =>
        $this->requestStack
          ->getCurrentRequest()
          ->getClientIp(),

      'created' =>
        time(),

      'status' =>
        'pending',

      // NUEVO
      'estimated_delivery_date' =>
        $estimated_delivery_date,
    ];


    $id =
      $this->database
        ->insert('mymobile_orders')
        ->fields($fields)
        ->execute();


    // ==========================================================
    // GENERAR NÚMERO DE PEDIDO
    // ==========================================================

    $year =
      date('Y');

    $order_number =
      'MM-' .
      $year .
      '-' .
      str_pad(
        $id,
        5,
        '0',
        STR_PAD_LEFT
      );


    $this->database
      ->update('mymobile_orders')
      ->fields([
        'order_number' =>
          $order_number,
      ])
      ->condition(
        'id',
        $id
      )
      ->execute();


    // ==========================================================
    // RETORNAR PEDIDO
    // ==========================================================

    return [

      'id' =>
        $id,

      'order_number' =>
        $order_number,

      'total' =>
        $total,

      'items_text' =>
        $items_text,

      'email' =>
        $data['email'] ?? '',

      'estimated_delivery_date' =>
        $estimated_delivery_date,
    ];
  }


  /**
   * Obtener un pedido.
   */
  public function getOrder($id = NULL)
  {

    $query =
      $this->database
        ->select(
          'mymobile_orders',
          'o'
        )
        ->fields('o');


    // ==========================================================
    // PEDIDO INDIVIDUAL
    // ==========================================================

    if (!empty($id)) {

      $query->condition(
        'id',
        $id
      );

      $order =
        $query
          ->execute()
          ->fetchAssoc();


      if ($order) {

        // ======================================================
        // DECODIFICAR PAYLOAD
        // ======================================================

        $payload =
          json_decode(
            $order['payload'],
            TRUE
          );


        if (!is_array($payload)) {

          $payload = [];
        }


        // ======================================================
        // EMAIL
        // ======================================================

        if (
          empty($order['email']) &&
          !empty($payload['email'])
        ) {

          $order['email'] =
            $payload['email'];
        }


        // ======================================================
        // FECHA ESTIMADA DE ENTREGA
        // ======================================================

        if (
          empty($order['estimated_delivery_date']) &&
          !empty(
            $payload['estimated_delivery_date']
          )
        ) {

          $order['estimated_delivery_date'] =
            $payload['estimated_delivery_date'];
        }


        // ======================================================
        // COMPATIBILIDAD CON PEDIDOS ANTIGUOS
        // ======================================================

        if (
          empty($order['estimated_delivery_date'])
        ) {

          $order['estimated_delivery_date'] =
            date(
              'Y-m-d',
              strtotime('+3 days')
            );
        }


        // ======================================================
        // PRODUCTOS
        // ======================================================

        if (
          !empty($payload['items']) &&
          is_array($payload['items'])
        ) {

          foreach (
            $payload['items']
            as &$item
          ) {

            if (!empty($item['id'])) {

              $node =
                Node::load(
                  $item['id']
                );


              if (
                $node &&
                $node->hasField('field_image') &&
                !$node
                  ->get('field_image')
                  ->isEmpty()
              ) {

                $file =
                  $node
                    ->get('field_image')
                    ->entity;


                if ($file) {

                  $url =
                    \Drupal::service(
                      'file_url_generator'
                    )->generateAbsoluteString(
                      $file->getFileUri()
                    );


                  $item['image'] =
                    $url;
                }
              }
            }
          }

          unset($item);
        }


        // ======================================================
        // PAYLOAD
        // ======================================================

        $order['payload'] =
          $payload;
      }


      return $order;
    }


    // ==========================================================
    // TODOS LOS PEDIDOS
    // ==========================================================

    return $query
      ->execute()
      ->fetchAllAssoc('id');
  }


  /**
   * Obtener pedidos filtrados.
   */
  public function getOrdersFilter(
    $filters = [],
    $page = 0,
    $limit = 20
  ) {

    $query =
      $this->database
        ->select(
          'mymobile_orders',
          'o'
        )
        ->fields('o')
        ->orderBy(
          'created',
          'DESC'
        );


    if (!empty($filters['status'])) {

      $query->condition(
        'status',
        $filters['status']
      );
    }


    if (!empty($filters['nombre'])) {

      $query->condition(
        'nombre',
        '%' .
        $filters['nombre'] .
        '%',
        'LIKE'
      );
    }


    if (!empty($filters['celular'])) {

      $query->condition(
        'celular',
        '%' .
        $filters['celular'] .
        '%',
        'LIKE'
      );
    }


    if (!empty($filters['email'])) {

      $query->condition(
        'email',
        '%' .
        $filters['email'] .
        '%',
        'LIKE'
      );
    }


    $query->range(
      $page * $limit,
      $limit
    );


    return $query
      ->execute()
      ->fetchAllAssoc('id');
  }


  /**
   * Contar pedidos filtrados.
   */
  public function countOrdersFilter(
    $filters = []
  ) {

    $query =
      $this->database
        ->select(
          'mymobile_orders',
          'o'
        );


    $query->addExpression(
      'COUNT(*)'
    );


    if (!empty($filters['status'])) {

      $query->condition(
        'status',
        $filters['status']
      );
    }


    if (!empty($filters['nombre'])) {

      $query->condition(
        'nombre',
        '%' .
        $filters['nombre'] .
        '%',
        'LIKE'
      );
    }


    if (!empty($filters['celular'])) {

      $query->condition(
        'celular',
        '%' .
        $filters['celular'] .
        '%',
        'LIKE'
      );
    }


    if (!empty($filters['email'])) {

      $query->condition(
        'email',
        '%' .
        $filters['email'] .
        '%',
        'LIKE'
      );
    }


    return (int) $query
      ->execute()
      ->fetchField();
  }

}