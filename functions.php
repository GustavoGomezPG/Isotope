<?php
/**
 * Theme functions and definitions
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

// Load ViteAssets class first - provides centralized asset management for dev/prod
require_once get_template_directory() . '/includes/ViteAssets.php';

// Load appropriate scripts based on environment (uses ViteAssets internally)
if (ViteAssets::is_production()) {
	require_once get_template_directory() . '/includes/production-scripts.php';
} else {
	require_once get_template_directory() . '/includes/script-imports.php';
}

// Load data localizer to share PHP data with JavaScript
require_once get_template_directory() . '/includes/DataLocalizer.php';

if (!isset($content_width)) {
	$content_width = 800;
}

/**
 * Set up theme support.
 */
function isotope_setup()
{
	register_nav_menus([
		'menu-1' => esc_html__('Header', 'isotope'),
		'menu-2' => esc_html__('Footer', 'isotope'),
	]);

	add_post_type_support('page', 'excerpt');

	add_theme_support('post-thumbnails');
	add_theme_support('automatic-feed-links');
	add_theme_support('title-tag');
	add_theme_support(
		'html5',
		[
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'script',
			'style',
		]
	);
	add_theme_support(
		'custom-logo',
		[
			'height' => 100,
			'width' => 350,
			'flex-height' => true,
			'flex-width' => true,
		]
	);
	add_theme_support('align-wide');
	add_theme_support('responsive-embeds');
	add_theme_support('editor-styles');

	// WooCommerce support
	if (apply_filters('isotope_add_woocommerce_support', true)) {
		add_theme_support('woocommerce');
		add_theme_support('wc-product-gallery-zoom');
		add_theme_support('wc-product-gallery-lightbox');
		add_theme_support('wc-product-gallery-slider');
	}
}
add_action('after_setup_theme', 'isotope_setup');

/**
 * Set default content width.
 */
function isotope_content_width()
{
	$GLOBALS['content_width'] = apply_filters('isotope_content_width', 800);
}
add_action('after_setup_theme', 'isotope_content_width', 0);

/**
 * Register Elementor theme builder locations (if Elementor Pro is active).
 */
function isotope_register_elementor_locations($elementor_theme_manager)
{
	$elementor_theme_manager->register_all_core_location();
}
add_action('elementor/theme/register_locations', 'isotope_register_elementor_locations');

/**
 * Add description meta tag from post excerpt.
 */
function isotope_add_description_meta_tag()
{
	if (!is_singular()) {
		return;
	}

	$post = get_queried_object();
	if (empty($post->post_excerpt)) {
		return;
	}

	echo '<meta name="description" content="' . esc_attr(wp_strip_all_tags($post->post_excerpt)) . '">' . "\n";
}
add_action('wp_head', 'isotope_add_description_meta_tag');

/**
 * Check whether to display the page title.
 * Respects Elementor's "Hide Title" document setting.
 */
function isotope_check_hide_title($val)
{
	if (defined('ELEMENTOR_VERSION')) {
		$current_doc = Elementor\Plugin::instance()->documents->get(get_the_ID());
		if ($current_doc && 'yes' === $current_doc->get_settings('hide_title')) {
			$val = false;
		}
	}
	return $val;
}
add_filter('isotope_page_title', 'isotope_check_hide_title');

/**
 * Disable theme update checks (custom theme, not in WP.org repo).
 */
function isotope_disable_update_checks($value)
{
	if (is_object($value) && isset($value->response)) {
		unset($value->response[get_template()]);
	}
	return $value;
}
add_filter('site_transient_update_themes', 'isotope_disable_update_checks');
