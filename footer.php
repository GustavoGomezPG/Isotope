<?php
/**
 * The template for displaying the footer.
 *
 * @package Isotope
 */

if (!defined('ABSPATH')) {
	exit;
}

?>

  </div><!-- close data-taxi wrapper -->

<?php
if (!function_exists('elementor_theme_do_location') || !elementor_theme_do_location('footer')) {
	get_template_part('template-parts/dynamic-footer');
}
?>

<?php wp_footer(); ?>

</body>

</html>
