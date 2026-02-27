<?php
/**
 * Vite Assets Manager
 *
 * Centralized class for handling Vite-built assets in both development
 * and production modes.
 *
 * @package Isotope
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
  exit;
}

class ViteAssets
{
  /**
   * Vite dev server URL
   */
  private const DEV_SERVER_URL = 'http://localhost:3000';

  /**
   * Manifest file path relative to dist folder
   */
  private const MANIFEST_PATH = '/.vite/manifest.json';

  /**
   * Dist folder name
   */
  private const DIST_FOLDER = '/dist';

  /**
   * Entry points configuration
   */
  private const ENTRY_POINTS = [
    'main' => 'assets/js/main.js',
  ];

  /**
   * Cached manifest data
   * @var array|null
   */
  private static $manifest = null;

  /**
   * Cached dev mode status
   * @var bool|null
   */
  private static $is_dev_mode = null;

  /**
   * Check if we're in development mode (no dist folder)
   *
   * @return bool True if in dev mode, false if in production
   */
  public static function is_dev_mode(): bool
  {
    if (self::$is_dev_mode === null) {
      self::$is_dev_mode = !file_exists(self::get_dist_path());
    }
    return self::$is_dev_mode;
  }

  /**
   * Check if we're in production mode (dist folder exists)
   *
   * @return bool True if in production mode
   */
  public static function is_production(): bool
  {
    return !self::is_dev_mode();
  }

  /**
   * Get the Vite dev server URL
   *
   * @return string The dev server URL
   */
  public static function get_dev_server_url(): string
  {
    return self::DEV_SERVER_URL;
  }

  /**
   * Get the full path to the dist folder
   *
   * @return string Absolute path to dist folder
   */
  public static function get_dist_path(): string
  {
    return get_template_directory() . self::DIST_FOLDER;
  }

  /**
   * Get the dist folder URI for URLs
   *
   * @return string URI to dist folder
   */
  public static function get_dist_uri(): string
  {
    return get_template_directory_uri() . self::DIST_FOLDER;
  }

  /**
   * Get the Vite manifest data
   *
   * @return array|null Manifest data or null if not available
   */
  public static function get_manifest(): ?array
  {
    if (self::$manifest === null) {
      $manifest_path = self::get_dist_path() . self::MANIFEST_PATH;

      if (file_exists($manifest_path)) {
        $content = file_get_contents($manifest_path);
        self::$manifest = json_decode($content, true) ?: [];
      } else {
        self::$manifest = [];
      }
    }

    return self::$manifest ?: null;
  }

  /**
   * Get the entry path for a named entry point
   *
   * @param string $name Entry point name
   * @return string|null The entry path or null if not found
   */
  public static function get_entry_path(string $name): ?string
  {
    return self::ENTRY_POINTS[$name] ?? null;
  }

  /**
   * Get the JavaScript URL for an entry point
   *
   * @param string $entry Entry point name or path
   * @return string|null The JS URL or null if not found
   */
  public static function get_js_url(string $entry): ?string
  {
    $entry_path = self::ENTRY_POINTS[$entry] ?? $entry;

    if (self::is_dev_mode()) {
      return self::DEV_SERVER_URL . '/' . $entry_path;
    }

    $manifest = self::get_manifest();
    if ($manifest && isset($manifest[$entry_path]['file'])) {
      return self::get_dist_uri() . '/' . $manifest[$entry_path]['file'];
    }

    return null;
  }

  /**
   * Get the CSS URLs for an entry point
   *
   * @param string $entry Entry point name or path
   * @return array Array of CSS URLs
   */
  public static function get_css_urls(string $entry): array
  {
    if (self::is_dev_mode()) {
      return [];
    }

    $entry_path = self::ENTRY_POINTS[$entry] ?? $entry;

    $manifest = self::get_manifest();
    if (!$manifest || !isset($manifest[$entry_path]['css'])) {
      return [];
    }

    $css_urls = [];
    foreach ($manifest[$entry_path]['css'] as $css_file) {
      $css_urls[] = self::get_dist_uri() . '/' . $css_file;
    }

    return $css_urls;
  }

  /**
   * Get imported chunk URLs for modulepreload
   *
   * @param string $entry Entry point name or path
   * @return array Array of chunk URLs for preloading
   */
  public static function get_chunk_urls(string $entry): array
  {
    if (self::is_dev_mode()) {
      return [];
    }

    $entry_path = self::ENTRY_POINTS[$entry] ?? $entry;

    $manifest = self::get_manifest();
    if (!$manifest || !isset($manifest[$entry_path]['imports'])) {
      return [];
    }

    $chunk_urls = [];
    foreach ($manifest[$entry_path]['imports'] as $import) {
      if (isset($manifest[$import]['file'])) {
        $chunk_urls[] = self::get_dist_uri() . '/' . $manifest[$import]['file'];
      }
    }

    return $chunk_urls;
  }

  /**
   * Escape a dev server URL, preserving HTTP protocol
   *
   * @param string $url The URL to escape
   * @return string The escaped URL
   */
  private static function esc_dev_url(string $url): string
  {
    return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
  }

  /**
   * Output the Vite dev client script tag
   */
  public static function print_dev_client(): void
  {
    if (!self::is_dev_mode()) {
      return;
    }

    echo '<script type="module" src="' . self::esc_dev_url(self::DEV_SERVER_URL . '/@vite/client') . '"></script>' . "\n";
  }

  /**
   * Output a dev server entry point script tag
   *
   * @param string $entry Entry point name or path
   */
  public static function print_dev_entry(string $entry): void
  {
    if (!self::is_dev_mode()) {
      return;
    }

    $url = self::get_js_url($entry);
    if ($url) {
      echo '<script type="module" src="' . self::esc_dev_url($url) . '"></script>' . "\n";
    }
  }

  /**
   * Output modulepreload link tags for chunks
   *
   * @param string $entry Entry point name or path
   */
  public static function print_modulepreload_tags(string $entry): void
  {
    foreach (self::get_chunk_urls($entry) as $chunk_url) {
      echo '<link rel="modulepreload" href="' . esc_url($chunk_url) . '">' . "\n";
    }
  }

  /**
   * Enqueue CSS files for an entry point (production only)
   *
   * @param string $entry Entry point name or path
   * @param string $handle Base handle for wp_enqueue_style
   * @param array $deps Style dependencies
   */
  public static function enqueue_css(string $entry, string $handle = 'isotope-theme', array $deps = []): void
  {
    $css_urls = self::get_css_urls($entry);
    $version = wp_get_theme()->get('Version');

    foreach ($css_urls as $index => $css_url) {
      $style_handle = $index === 0 ? $handle . '-css' : $handle . '-css-' . $index;
      wp_enqueue_style(
        $style_handle,
        $css_url,
        $deps,
        $version
      );
    }
  }

  /**
   * Reset cached values (useful for testing)
   */
  public static function reset(): void
  {
    self::$manifest = null;
    self::$is_dev_mode = null;
  }
}
