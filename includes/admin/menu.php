<?php
/**
 * WC Dependency Checker
 *
 * Checks if WooCommerce is enabled
 */
if(!class_exists('WC_PD_Menu')){

	include_once(dirname(__FILE__)."/menu-pages/menu-page.php");

	class WC_PD_Menu {

		public $page_url;

		function __construct(){
			$this->product_design = include(dirname(__FILE__)."/menu-pages/product-design.php");
		}
		
		function init() {
			add_menu_page( 
				__( 'Product Design', 'wp_pd'),  	// Page title
				__( 'Product Design', 'wp_pd'), 	// Menu name
				'manage_options',  	// Capability
				'product-design', 	// slug
				array($this,'product_design') 		// callback
			);

			add_submenu_page(
		        'product-design',
		        __( 'Clip-arts', 'wp_pd' ),
		        __( 'Clip-arts', 'wp_pd' ),
		        'manage_options',
		        'product-design-logo',
		        array($this,'logos')
		    );

			add_submenu_page(
		        'product-design',
		        __( 'Fonts', 'wp_pd' ),
		        __( 'Fonts', 'wp_pd' ),
		        'manage_options',
		        'product-design-fonts',
		        array($this,'fonts')
		    );

		    add_submenu_page( 
		        null, 
		        __('Customizer' , 'wp_pd' ),
		        __('Customizer', 'wp_pd' ),
		        'manage_options',
		        'customizer-product-setting',
		        array($this,'customizer_product_setting')
		    );

		    //add_action( 'admin_notices', 'sample_admin_notice__success' );

	    }

		function product_design(){
			$this->page_url = menu_page_url('product-design', false);
			$this->product_design->html();
			//$this->get_page($class);
		}

		function logos(){
			$this->page_url = menu_page_url('product-design-logo', false);
			$class = include(dirname(__FILE__)."/menu-pages/logos.php");
			//$this->get_page($class);
		}

		function fonts(){
			$this->page_url = menu_page_url('product-design-fonts', false);

			$class = include(dirname(__FILE__)."/menu-pages/fonts.php");
			//$this->get_page($class);
		}

		function customizer_product_setting(){
			#$this->page_url = menu_page_url('product-design-fonts', false);

			$class = include(dirname(__FILE__)."/menu-pages/customizer-product-setting.php");
			//$this->get_page($class);
		}

		function get_page($page){
			$this->html();
			return;

			if(isset($_REQUEST['method']) || (isset($_POST) && !empty($_POST))){
				$method = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
				if(empty($method) && (isset($_POST) && !empty($_POST))){
					$method = 'post';
				}
				switch ($method) {
					case 'post':
						if($_REQUEST['action'] == 'add'){

							$page->save($_REQUEST);

						}if($_REQUEST['action'] == 'update'){
							if(isset($_REQUEST['id'])){
								$page->update($_REQUEST,intval($_REQUEST['id']));
							}else{
								return false;
							}
						}
						if($_REQUEST['action'] == 'delete'){
							if(isset($_REQUEST['id'])){
								$page->delete(intval($_REQUEST['id']));
							}else{
								$page->delete(intval($_REQUEST['id']));
							}
						}
						break;

					case 'get':
						if($_REQUEST['action'] == 'add'){
							if(isset($_REQUEST['id'])){
								$page->add(intval($_REQUEST['id']));
							}else{
								return false;
							}
						}elseif($_REQUEST['action'] == 'edit'){
							if(isset($_REQUEST['id'])){
								$page->edit(intval($_REQUEST['id']));
							}else{
								return false;
							}
						}else{
							$page->html();
						}
						break;

					case 'delete':
						if(isset($_REQUEST['id'])){
							$page->show(intval($_REQUEST['id']));
						}else{
							return false;
						}
						break;
					
					default:
						$page->html();
						break;
				}
			}else{
				$page->html();
			}
		}
	}

}
return new WC_PD_Menu();



