<?php
/**
 * Template part for Taxi.js view wrapper - Opening
 *
 * Include this at the start of any page template after get_header()
 *
 * @package Isotope
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
  exit;
}

// Generate namespace/slug for the current page
$namespace = 'page';

if (is_page()) {
  $post = get_post();
  $namespace = $post->post_name;
} elseif (is_archive()) {
  $namespace = 'archive';
} elseif (is_search()) {
  $namespace = 'search';
} elseif (is_404()) {
  $namespace = '404';
} elseif (is_singular()) {
  $post = get_post();
  $namespace = $post->post_name;
}
?>
<div data-taxi-view id="site-main-wrapper" data-page="<?php echo esc_attr($namespace); ?>">
