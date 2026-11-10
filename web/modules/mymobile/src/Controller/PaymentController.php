<?php

namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\mymobile\Service\OrderService;

class PaymentController extends ControllerBase
{

  /**
   * @var \Drupal\mymobile\Service\OrderService
   */
  protected $orderService;

  public function __construct(OrderService $order_service)
  {
    $this->orderService = $order_service;
  }

  /**
   * Dependency injection.
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('mymobile.order_service')
    );
  }

  /**
   * Registrar pedido.
   */
  public function registerPayment(Request $request)
  {

    // ==========================================================
    // VALIDAR API KEY
    // ==========================================================

    $api_key = $request->headers->get('X-API-KEY');

    $config = \Drupal::config('mymobile.settings');

    $config_key = $config->get('api_key') ?? '';

    if (!$api_key || $api_key !== $config_key) {

      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Unauthorized'
      ], 401);
    }


    // ==========================================================
    // OBTENER DATOS
    // ==========================================================

    $content = json_decode($request->getContent(), TRUE);

    if (!is_array($content)) {

      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Invalid JSON'
      ], 400);
    }


    // ==========================================================
    // VALIDAR CAMPOS PRINCIPALES
    // ==========================================================

    if (
      empty($content['nombre']) ||
      empty($content['celular']) ||
      empty($content['email']) ||
      empty($content['items'])
    ) {

      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Missing required fields'
      ], 400);
    }


    // ==========================================================
    // NORMALIZAR ITEMS
    // ==========================================================

    try {

      $items = [];

      foreach ($content['items'] as $item) {

        if (
          empty($item['id']) ||
          empty($item['name']) ||
          !isset($item['price']) ||
          empty($item['quantity'])
        ) {

          return new JsonResponse([
            'status' => 'fail',
            'message' => 'Invalid product data'
          ], 400);
        }

        $items[] = [

          'id' => $item['id'],

          'sku' => $item['sku'] ?? '',

          'name' => $item['name'],

          'price' => (float) $item['price'],

          'quantity' => (int) $item['quantity'],

          'color' => $item['color'] ?? '',

          'talla' => $item['talla'] ?? '',

          // GTIN opcional para Google
          'gtin' => $item['gtin'] ?? '',
        ];
      }

      $content['items'] = $items;


      // ========================================================
      // CREAR PEDIDO
      // ========================================================

      $order = $this->orderService->createOrder($content);


      // ========================================================
      // URL BASE
      // ========================================================

      $base_url = \Drupal::request()->getSchemeAndHttpHost();


      // ========================================================
      // URL DEL PEDIDO
      // ========================================================

      $order_link =
        $base_url .
        '/order-review/' .
        $order['id'];


      // ========================================================
      // URL DE GOOGLE CUSTOMER REVIEWS
      // ========================================================

      $google_review_url =
        $base_url .
        '/google-review-optin/' .
        $order['id'];


      // ========================================================
      // NOMBRE DEL SITIO
      // ========================================================

      $site_name =
        \Drupal::config('system.site')->get('name');


      // ========================================================
      // CONSTRUIR ITEMS PARA WHATSAPP
      // ========================================================

      $items_text = "";


      foreach ($items as $item) {

        $subtotal =
          $item['price'] *
          $item['quantity'];


        $color_text =
          !empty($item['color'])
          ? " | Color: {$item['color']}"
          : '';


        $talla_text =
          !empty($item['talla'])
          ? " | Talla: {$item['talla']}"

          : '';


        $items_text .=
          "SKU: {$item['sku']} - " .
          "{$item['name']} x{$item['quantity']}" .
          $color_text .
          $talla_text .
          " - COP " .
          number_format(
            $subtotal,
            0,
            ',',
            '.'
          ) .
          "\n";
      }


      // ========================================================
      // MENSAJE WHATSAPP
      // ========================================================

      $message =
        "Hola, soy {$content['nombre']},\n" .
        "Link a mi pedido: {$order_link}\n" .
        "Pedido: {$order['order_number']}\n" .
        "Nombre: {$content['nombre']}\n" .
        "Celular: {$content['celular']}\n" .
        "Correo: {$content['email']}\n" .
        "========================\n" .
        "Quiero hacer este pedido en {$site_name}:\n\n" .
        $items_text .
        "========================\n" .
        "TOTAL: COP " .
        number_format(
          $order['total'],
          0,
          ',',
          '.'
        ) .
        "\n\n" .
        "Google Customer Reviews:\n" .
        $google_review_url;


      // ========================================================
      // WHATSAPP
      // ========================================================

      $whatsapp_number =
        $config->get('site_whatsapp') ?? '';


      $whatsapp_url =
        "https://wa.me/{$whatsapp_number}?text=" .
        urlencode($message);


      // ========================================================
      // RESPUESTA
      // ========================================================

      return new JsonResponse([

        'status' => 'success',

        'order_id' => $order['id'],

        'order_number' => $order['order_number'],

        'whatsapp_message' => $message,

        'whatsapp_url' => $whatsapp_url,

        'google_review_url' => $google_review_url,

      ]);


    } catch (\Exception $e) {

      \Drupal::logger('mymobile')
        ->error(
          'Error creando pedido: @error',
          [
            '@error' => $e->getMessage()
          ]
        );


      return new JsonResponse([

        'status' => 'fail',

        'message' => 'Error creating order'

      ], 500);
    }
  }


/**
 * Página de integración de Google Customer Reviews.
 */
public function googleReviewOptIn($id)
{
  // ==========================================================
  // BUSCAR PEDIDO
  // ==========================================================

  $order = $this->orderService->getOrder($id);

  // ==========================================================
  // VALIDAR PEDIDO
  // ==========================================================

  if (!$order) {

    return [
      '#markup' =>
        '<div class="container">' .
        '<div class="alert alert-danger">' .
        'Pedido no encontrado.' .
        '</div>' .
        '</div>',
    ];
  }

  // ==========================================================
  // DEBUG EMAIL
  // ==========================================================

//  \Drupal::logger('mymobile')->notice(
    //'Google Review pedido @id - email: @email',
    //[
      //'@id' => $id,
     // '@email' => $order['email'] ?? 'NO EXISTE',
   // ]
 // );
//
  // ==========================================================
  // FECHA ESTIMADA DE ENTREGA
  // ==========================================================

  $estimated_delivery_date =  $order['estimated_delivery_date'];

  // ==========================================================
  // PAÍS
  // ==========================================================

  $delivery_country = 'CO';

  // ==========================================================
  // PRODUCTOS / GTIN
  // ==========================================================

  $google_products = [];

  if (!empty($order['items']) && is_array($order['items'])) {

    foreach ($order['items'] as $item) {

      if (!empty($item['gtin'])) {

        $google_products[] = [
          'gtin' => $item['gtin'],
        ];
      }
    }
  }

  // ==========================================================
  // TEMPLATE
  // ==========================================================

  $build = [

    '#theme' => 'mymobile_google_review_optin',

    '#order' => $order,

    '#estimated_delivery_date' =>
      $estimated_delivery_date,

    '#delivery_country' =>
      $delivery_country,

    '#google_products' =>
      $google_products,

    '#attached' => [

      'html_head' => [

        [

          [

            '#tag' => 'script',

            '#attributes' => [

              'src' =>
                'https://apis.google.com/js/platform.js?onload=renderOptIn',

              'async' => TRUE,

              'defer' => TRUE,

            ],

          ],

          'google_customer_reviews_script',

        ],

      ],

    ],

  ];

  return $build;
}


  /**
   * Obtener pedido.
   */
  public function getOrder($id)
  {

    $order =
      $this->orderService->getOrder($id);


    if (!$order) {

      return new JsonResponse([

        'status' => 'fail',

        'message' => 'Order not found'

      ], 404);
    }


    return new JsonResponse([

      'status' => 'success',

      'data' => $order

    ]);
  }
}