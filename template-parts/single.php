<?php
/**
 * The template for displaying singular content (posts, pages)
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit;
}

while (have_posts()) :
  the_post();
  ?>
  <main id="content" <?php post_class('site-main'); ?>>
    <?php if (apply_filters('hello_elementor_page_title', true)) : ?>
      <header class="page-header">
        <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
      </header>
    <?php endif; ?>
    <div class="page-content">
      <?php the_content(); ?>
    </div>
  </main>
  <?php
endwhile;
