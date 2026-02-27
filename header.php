<?php
/**
 * The template for displaying the header
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit;
}

$viewport_content = apply_filters('isotope_viewport_content', 'width=device-width, initial-scale=1');
$enable_skip_link = apply_filters('isotope_enable_skip_link', true);
$skip_link_url = apply_filters('isotope_skip_link_url', '#content');
?>
<!doctype html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="<?php echo esc_attr($viewport_content); ?>">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <div id="page-preloader"></div>

  <?php wp_body_open(); ?>

  <?php if ($enable_skip_link) { ?>
    <a class="skip-link screen-reader-text"
      href="<?php echo esc_url($skip_link_url); ?>"><?php echo esc_html__('Skip to content', 'isotope'); ?></a>
  <?php } ?>

  <?php
  if (!function_exists('elementor_theme_do_location') || !elementor_theme_do_location('header')) {
    get_template_part('template-parts/dynamic-header');
  }
  ?>

  <div data-taxi>
