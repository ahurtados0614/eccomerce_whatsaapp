<?php

namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\mymobile\Service\OrderService;
use Drupal\Core\Site\Settings;
use Drupal\Core\Url;

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
    $config_key = Settings::get('mymobile_api_key');

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

      $order = $this->orderService->createOrder($content);
      $base_url = \Drupal::request()->getSchemeAndHttpHost();
      $order_link = $base_url . '/order-review/' . $order['id'];
      $site_name = \Drupal::config('system.site')->get('name');
      $message = "Hola, soy {$content['nombre']},\n"
        . "Link a mi pedido: {$order_link}\n"
        . "Pedido: {$order['order_number']}\n"
        . "Nombre: {$content['nombre']}\n"
        . "Celular: {$content['celular']}\n"
        . "========================\n"
        . "Quiero hacer este pedido en {$site_name}:\n\n"
        . $order['items_text']
        . "========================\n"
        . "TOTAL: COP " . number_format($order['total'], 0, ',', '.');
      $config = \Drupal::config('mymobile.settings');
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