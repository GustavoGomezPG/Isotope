<?php
/**
 * Production Scripts Loader
 * Loads bundled and optimized assets from the dist folder
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit; // Exit if accessed directly.
}

class IsotopeProductionScripts
{
  function __construct()
  {
    add_action('elementor/frontend/after_register_scripts', array($this, 'register_theme_scripts'));
    add_action('admin_enqueue_scripts', array($this, 'enqueue_wp_i18n'));
    add_filter('script_loader_tag', array($this, 'add_module_type_attribute'), 10, 3);
  }

  /**
   * Enqueue WordPress i18n script for sprintf and other functions
   */
  public function enqueue_wp_i18n()
  {
    wp_enqueue_script('wp-i18n');
  }

  /**
   * Add type="module" attribute to script tags for ES modules
   */
  public function add_module_type_attribute($tag, $handle, $src)
  {
    if ($handle === 'isotope-theme-main') {
      // Get modulepreload links for chunks
      $modulepreload_links = '';
      foreach (ViteAssets::get_chunk_urls('main') as $chunk_url) {
        $modulepreload_links .= '<link rel="modulepreload" href="' . esc_url($chunk_url) . '">' . "\n";
      }

      // Return modulepreload links + module script tag
      return $modulepreload_links . '<script type="module" src="' . esc_url($src) . '"></script>';
    }

    return $tag;
  }

  /**
   * Enqueue bundled JavaScript
   */
  public function enqueue_main_js()
  {
    $main_js = ViteAssets::get_js_url('main');
    $version = wp_get_theme()->get('Version');

    if ($main_js) {
      wp_enqueue_script(
        'isotope-theme-main',
        $main_js,
        array('jquery', 'wp-i18n'),
        $version,
        true
      );
    } else {
      // Fallback to direct path if manifest not available
      wp_enqueue_script(
        'isotope-theme-main',
        ViteAssets::get_dist_uri() . '/js/main.min.js',
        array('jquery', 'wp-i18n'),
        $version,
        true
      );
    }
  }

  /**
   * Enqueue production CSS
   */
  public function enqueue_main_css()
  {
    ViteAssets::enqueue_css('main', 'isotope-theme-main');
  }

  /**
   * Register all theme scripts
   */
  public function register_theme_scripts()
  {
    add_action('wp_enqueue_scripts', array($this, 'enqueue_main_js'));
    add_action('wp_enqueue_scripts', array($this, 'enqueue_main_css'));
  }
}

new IsotopeProductionScripts();
