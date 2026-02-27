<?php
/**
 * The template for displaying search results
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit;
}
?>
<main id="content" class="site-main">
  <header class="page-header">
    <h1 class="entry-title">
      <?php printf(esc_html__('Search Results for: %s', 'isotope'), '<span>' . get_search_query() . '</span>'); ?>
    </h1>
  </header>

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
      <p><?php esc_html_e('No results found. Please try a different search.', 'isotope'); ?></p>
    <?php endif; ?>
  </div>
</main>
