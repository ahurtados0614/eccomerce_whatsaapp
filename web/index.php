<?php

use Drupal\Core\DrupalKernel;

require_once 'autoload_runtime.php';

$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

return static function () {
  return new DrupalKernel('prod', require 'autoload.php');
};