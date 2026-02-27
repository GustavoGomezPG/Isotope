<?php
/**
 * Data Localizer Class
 * Shares data between backend (PHP) and frontend (JavaScript)
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
  exit; // Exit if accessed directly.
}

class DataLocalizer
{
  /**
   * Constructor
   */
  public function __construct()
  {
    add_action('wp_enqueue_scripts', array($this, 'localize_data'));
  }

  /**
   * Localize data for frontend JavaScript
   */
  public function localize_data()
  {
    // Define the name of the data object in JavaScript
    $script_name = 'backend_data';

    // Prepare data to pass from PHP to JS
    $theme_data = array(
      'site_info' => array(
        'site_url' => get_site_url(),
        'theme_url' => get_template_directory_uri(),
        'ajax_url' => admin_url('admin-ajax.php'),
      ),
      'theme_settings' => array(
        'theme_name' => 'Isotope',
        'theme_version' => wp_get_theme()->get('Version'),
      ),
    );

    // Register an empty script to attach our data to
    wp_register_script($script_name, '');
    wp_enqueue_script($script_name);

    // Add inline script that creates window.backend_data object
    wp_add_inline_script(
      $script_name,
      'window.' . $script_name . ' = ' . wp_json_encode($theme_data),
      'before'
    );
  }
}

// Initialize the DataLocalizer
new DataLocalizer();
