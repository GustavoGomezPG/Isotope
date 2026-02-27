<?php
/**
 * Fallback footer template.
 * Used when no Elementor footer template is assigned.
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
	exit;
}

$site_name = get_bloginfo('name');
$footer_nav_menu = wp_nav_menu([
	'theme_location' => 'menu-2',
	'fallback_cb' => false,
	'container' => false,
	'echo' => false,
]);
?>
<footer id="site-footer" class="site-footer">
	<div class="footer-inner">
		<?php if ($footer_nav_menu) : ?>
			<nav class="site-navigation" aria-label="<?php echo esc_attr__('Footer menu', 'isotope'); ?>">
				<?php echo $footer_nav_menu; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</nav>
		<?php endif; ?>

		<div class="copyright">
			<p>&copy; <?php echo date('Y'); ?> <?php echo esc_html($site_name); ?></p>
		</div>
	</div>
</footer>
