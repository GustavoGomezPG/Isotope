<?php
/**
 * Fallback header template.
 * Used when no Elementor header template is assigned.
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
	exit;
}

$site_name = get_bloginfo('name');
$tagline   = get_bloginfo('description', 'display');
$menu_args = [
	'theme_location' => 'menu-1',
	'fallback_cb' => false,
	'container' => false,
	'echo' => false,
];
$header_nav_menu = wp_nav_menu($menu_args);
?>
<header id="site-header" class="site-header">
	<div class="header-inner">
		<div class="site-branding">
			<?php if (has_custom_logo()) : ?>
				<div class="site-logo">
					<?php the_custom_logo(); ?>
				</div>
			<?php endif; ?>

			<?php if ($site_name) : ?>
				<div class="site-title">
					<a href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_attr__('Home', 'isotope'); ?>" rel="home">
						<?php echo esc_html($site_name); ?>
					</a>
				</div>
			<?php endif; ?>

			<?php if ($tagline) : ?>
				<p class="site-description">
					<?php echo esc_html($tagline); ?>
				</p>
			<?php endif; ?>
		</div>

		<?php if ($header_nav_menu) : ?>
			<nav class="site-navigation" aria-label="<?php echo esc_attr__('Main menu', 'isotope'); ?>">
				<?php echo $header_nav_menu; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</nav>
		<?php endif; ?>
	</div>
</header>
