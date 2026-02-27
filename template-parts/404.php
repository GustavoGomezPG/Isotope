<?php
/**
 * The template for displaying 404 pages
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit;
}
?>
<main id="content" class="site-main">
  <header class="page-header">
    <h1 class="entry-title"><?php esc_html_e('Page Not Found', 'isotope'); ?></h1>
  </header>

  <div class="page-content">
    <p><?php esc_html_e('The page you are looking for does not exist. It may have been moved, or removed altogether.', 'isotope'); ?></p>
  </div>
</main>
