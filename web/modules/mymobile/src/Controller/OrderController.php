<?php

namespace Drupal\mymobile\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\mymobile\Service\OrderService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;


class OrderController extends ControllerBase
{

  protected $orderService;

  public function __construct(OrderService $orderService)
  {
    $this->orderService = $orderService;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('mymobile.order_service')
    );
  }


  public function orders(Request $request)
  {

    $filters = [
      'status' => $request->query->get('status'),
      'nombre' => $request->query->get('nombre'),
      'celular' => $request->query->get('celular'),
    ];
    $orders = $this->orderService->getOrdersFilter($filters);

    return [
      '#theme' => 'mymobile_orders',
      '#orders' => $orders,
      '#filters' => $filters,
      '#pager' => [
  '#type' => 'pager',
  '#parameters' => $filters,
],
    ];
  }

  public function updateStatus(Request $request)
  {

    $id = $request->request->get('id');
    $status = $request->request->get('status');

    \Drupal::database()->update('mymobile_orders')
      ->fields(['status' => $status])
      ->condition('id', $id)
      ->execute();

    return new JsonResponse(['status' => 'ok']);
  }
}
