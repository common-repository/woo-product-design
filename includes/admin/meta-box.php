<?php
/**
 * WC Dependency Checker
 *
 * Checks if WooCommerce is enabled
 */
class WC_PD_Meta_Box {
	
	function __construct() {
		global $wcpd;
		if(isset($_POST['post_ID'])){
			$post_type = get_post_type( esc_sql($_POST['post_ID']));
		}else{
			$post_type = get_post_type( esc_sql($_GET['post']));
		}
		if(!$post_type) 
			$post_type = esc_sql($_GET['post_type']);

	
		include_once(dirname(__FILE__).'/meta_box/meta.php');

	

		if(file_exists(dirname(__FILE__).'/meta_box/'.$post_type.'-meta.php'))
			include(dirname(__FILE__).'/meta_box/'.$post_type.'-meta.php');

		//print_r(dirname(__FILE__).'/meta_box/'.$post_type.'-meta.php');
		//exit();
    }

}

return new WC_PD_Meta_Box();



