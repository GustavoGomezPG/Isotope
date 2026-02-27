<?php
/**
 * The template for displaying archive pages
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit;
}
?>
<main id="content" class="site-main">
  <?php if (apply_filters('hello_elementor_page_title', true)) : ?>
    <header class="page-header">
      <?php the_archive_title('<h1 class="entry-title">', '</h1>'); ?>
      <?php the_archive_description('<p class="archive-description">', '</p>'); ?>
    </header>
  <?php endif; ?>

  <div class="page-content">
    <?php if (have_posts()) : ?>
      <?php while (have_posts()) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <h2 class="entry-title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
          </h2>
          <div class="entry-excerpt">
            <?php the_excerpt(); ?>
          </div>
        </article>
      <?php endwhile; ?>

      <?php the_posts_navigation(); ?>
    <?php else : ?>
      <p><?php esc_html_e('No posts found.', 'isotope'); ?></p>
    <?php endif; ?>
  </div>
</main>
