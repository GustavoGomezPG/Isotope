<?php
/**
 * Development Scripts Loader
 * Loads scripts from Vite dev server with HMR support
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit; // Exit if accessed directly.
}

class IsotopeDevScripts
{
  function __construct()
  {
    // Ensure wp-i18n is loaded for Elementor compatibility
    add_action('wp_enqueue_scripts', array($this, 'enqueue_wp_i18n'));
    add_action('admin_enqueue_scripts', array($this, 'enqueue_wp_i18n'));
    // Add Vite dev server script tags to wp_head
    add_action('wp_head', array($this, 'add_vite_dev_server_tags'), 1);
  }

  /**
   * Enqueue WordPress i18n script for sprintf and other functions
   */
  public function enqueue_wp_i18n()
  {
    wp_enqueue_script('wp-i18n');
  }

  /**
   * Add Vite dev server script tags
   */
  public function add_vite_dev_server_tags()
  {
    // Vite client for HMR
    ViteAssets::print_dev_client();

    // Main entry point - Vite will handle all imports from here
    ViteAssets::print_dev_entry('main');
  }
}

new IsotopeDevScripts();
