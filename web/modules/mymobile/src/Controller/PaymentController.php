<?php

namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\mymobile\Service\OrderService;

class PaymentController extends ControllerBase {

  /**
   * @var \Drupal\mymobile\Service\OrderService
   */
  protected $orderService;

  public function __construct(OrderService $order_service) {
    $this->orderService = $order_service;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('mymobile.order_service')
    );
  }

  /**
   * Registrar pago / pedido.
   */
  public function registerPayment(Request $request) {

    // 🔐 Validar API Key
    $api_key = $request->headers->get('X-API-KEY');
    $config = \Drupal::config('mymobile.settings');
    $config_key = $config->get('api_key') ?? '';

    if (!$api_key || $api_key !== $config_key) {
      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Unauthorized'
      ], 401);
    }

    $content = json_decode($request->getContent(), TRUE);

    if (
      empty($content['nombre']) ||
      empty($content['celular']) ||
      empty($content['items'])
    ) {
      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Missing required fields'
      ], 400);
    }

    try {

      // 🔹 Normalizar items y validar SKU
      $items = [];

      foreach ($content['items'] as $item) {

        if (
          empty($item['id']) ||
          empty($item['name']) ||
          empty($item['price']) ||
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
        ];
      }

      $content['items'] = $items;

      // Crear pedido
      $order = $this->orderService->createOrder($content);

      $base_url = \Drupal::request()->getSchemeAndHttpHost();
      $order_link = $base_url . '/order-review/' . $order['id'];
      $site_name = \Drupal::config('system.site')->get('name');

      // Construir texto de items con SKU
      $items_text = "";

      foreach ($items as $item) {

        $subtotal = $item['price'] * $item['quantity'];

        $items_text .= "SKU: {$item['sku']} - {$item['name']} x{$item['quantity']} - COP "
          . number_format($subtotal, 0, ',', '.') . "\n";
      }

      // Mensaje WhatsApp
      $message = "Hola, soy {$content['nombre']},\n"
        . "Link a mi pedido: {$order_link}\n"
        . "Pedido: {$order['order_number']}\n"
        . "Nombre: {$content['nombre']}\n"
        . "Celular: {$content['celular']}\n"
        . "========================\n"
        . "Quiero hacer este pedido en {$site_name}:\n\n"
        . $items_text
        . "========================\n"
        . "TOTAL: COP " . number_format($order['total'], 0, ',', '.');

      $whatsapp_number = $config->get('site_whatsapp') ?? '';
      $whatsapp_url = "https://wa.me/{$whatsapp_number}?text=" . urlencode($message);

      return new JsonResponse([
        'status' => 'success',
        'order_id' => $order['id'],
        'order_number' => $order['order_number'],
        'whatsapp_message' => $message,
        'whatsapp_url' => $whatsapp_url
      ]);

    }
    catch (\Exception $e) {

      \Drupal::logger('mymobile')->error($e->getMessage());

      return new JsonResponse([
        'status' => 'fail',
        'message' => 'Error creating order'
      ], 500);
    }
  }

  /**
   * Obtener pedido.
   */
  public function getOrder($id) {

    $order = $this->orderService->getOrder($id);

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