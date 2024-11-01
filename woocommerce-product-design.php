<?php
/**
 * Plugin Name: Woocommerce Product Design
 * Version: 1.0.0
 * Plugin URI: 
 * Description: Allows to customize product in admin and customer in WooCommerce
 * Author: 
 * Author URI: 
 * Tested up to: 4.1.1
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


final class ProductDesign {

	protected static $_instance = null;

    public static function instance() {
		if (self::$_instance == null) {
			self::$_instance = new self();
			
		}
		return self::$_instance;
	}
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, __( "You can't clone the object of Woocommerce Product Design", 'wc-pd' ), '1.0' );
	}
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, __( "You can't clone the object of Woocommerce Product Design", 'wc-pd' ), '1.0' );
	}

    function __construct() {

    	ini_set('post_max_size', '160Mb');

    	if(!$this->check_dependencies()){
    		return false;
    	}

    	$this->plugin_path = $this->plugin_path();

		$this->plugin_url = $this->plugin_url();
		$this->include_path = $this->plugin_path('includes');
		$this->plugin_name = basename($this->plugin_path);

		$this->cont_define();
		$this->includes();
		$this->hooks();
    }


    function check_dependencies(){

    	$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() )
			$active_plugins = array_merge( $active_plugins, get_site_option( 'active_sitewide_plugins', array() ) );

		$is_woocommerce_active = in_array( 'woocommerce/woocommerce.php', $active_plugins ) || array_key_exists( 'woocommerce/woocommerce.php', $active_plugins );


    	if (!$is_woocommerce_active) {
		    add_action( 'admin_notices', function(){
		    	echo '<div class="error"><p>' . sprintf( __( 'WooCommerce Vendor Fronted requires WooCommerce in order to work properly. <a href="%s" target="_blank">Please install WooCommerce</a>.', 'wc-ost' ), 'http://wordpress.org/plugins/woocommerce/' ) . '</p></div>';
		    });
		    return false;
		}else{
			return true;
		}
    }


	function cont_define(){

	}
	
	public function includes(){

		require_once 'includes/functions.php';
		
		if ( $this->is_request( 'admin' ) ) {
			include_once($this->plugin_path."/includes/admin/meta-box.php");
			include_once($this->plugin_path."/includes/admin/list-table.php");
			include_once($this->plugin_path("includes/admin/customizer.php"));
		}

		include_once($this->plugin_path."/includes/admin/register-post.php");

		if ( $this->is_request( 'frontend' ) ) {
			include_once($this->plugin_path("includes/customizer.php"));
		}
		
	}
	public function hooks(){
		add_action('init',array($this,'init'));

		add_action( 'wp_logout', array($this,'session_destroy' ));

		if ( $this->is_request( 'admin' ) ) {
			add_action('admin_print_styles', array($this, 'admin_css'));
			

			$menu = include($this->plugin_path."/includes/admin/menu.php");

			add_action('admin_menu', array($menu, 'init'));

		}

		if ( $this->is_request( 'frontend' ) ) {
			add_filter('page_template', array($this, 'page_template'));

			add_action('wp_enqueue_style', array($this, 'styles'));
			add_action('wp_enqueue_scripts', array($this, 'script'));
		}


		
	}	
	public function init(){
		
	}

    function start_session() {
	    if (! session_id()) {
	        session_start();
	    }
	    
	}
	function session_destroy() {

	}

	
	private function is_request( $type ) {
		switch ( $type ) {
			case 'admin' :
				return is_admin();
			case 'ajax' :
				return defined( 'DOING_AJAX' );
			case 'cron' :
				return defined( 'DOING_CRON' );
			case 'frontend' :
				return ( ! is_admin() || defined( 'DOING_AJAX' ) ) && ! defined( 'DOING_CRON' );
		}
	}
	
	public function admin_css(){
		wp_enqueue_style( 'pd-admin-style', $this->plugin_url. '/assets/css/admin-style.css');
	}

	function styles() {
		/*wp_enqueue_style('pd-kinetic-style',$this->plugin_url('assets/js/kinetic.js'));*/
	}
	function script() {
		//wp_enqueue_script('pd-kinetic-script',$this->plugin_url('assets/js/kinetic.js'));
		//wp_enqueue_script('pd-script-script',$this->plugin_url('assets/js/script.js'), array('pd-kinetic-script'));

		//wp_enqueue_script('pd-customizer-vendor-script',$this->plugin_url('assets/customizer/js/vendor.js'));
		//wp_enqueue_script('pd-customizer-script',$this->plugin_url('assets/customizer/js/customizer.js'), array('pd-customizer-vendor-script'));
		//wp_enqueue_script('pd-script-script',$this->plugin_url('assets/js/script.js'), array('pd-customizer-script'));
	}
	
	
	public function page_template($template) {
		if(is_page(get_option('wcpd_product_design_page_id'))){
			$template = $this->locate_plugin_template(array('wcpd-product-design-page.php'));
		}
		return $template;
	}
	
	public function locate_plugin_template($template_names, $path = "", $args = array(), $load = false, $debug = false ){
		if ( !is_array($template_names) && $template_names )
			$template_names = array($template_names);
		elseif(!is_array($template_names))
			return false;
	
		$located = '';
	
		$plugin_dir = trailingslashit($this->plugin_path("templates/"));
		if(!empty($path)){
			$plugin_dir .= trailingslashit($path);
		}
		
		$theme_dir = STYLESHEETPATH . '/product_design/';
		if(!empty($path)){
			$theme_dir .= trailingslashit($path);
		}

		$template_dir = TEMPLATEPATH . '/product_design/';
		if(!empty($path)){
			$template_dir .= trailingslashit($path);
		}
		foreach ( $template_names as $template_name ) {
			if ( !$template_name )
				continue;
			
			if ( file_exists($theme_dir . $template_name)) {
				$located = $template_dir . $template_name;
				break;
			} else if ( file_exists($template_dir . $template_name) ) {
				$located = $template_dir. $template_name;
				break;
			} else if ( file_exists( $plugin_dir.  $template_name) ) {
				$located = $plugin_dir . $template_name;
				break;
			}
		}
		
		if($debug){
			echo "<br>-------------------------<br /> template_names = "; print_r($template_names);
			echo "<br><br /> theme_file = ". $template_dir . $template_name;
			echo "<br><br /> theme_file = ". $template_dir. $template_name;
			echo "<br><br /> plugin_file = ". $plugin_dir . $template_name;
			echo "<br><br /> path = ".$path;
			echo "<br><br /> this_plugin_dir = ".$this_plugin_dir;
			echo "<br> located = ".$located."<br>--------------------------------<br />";
		}
	
		if ( $load && '' != $located )
			$this->pl_load_template( $located, $args);
		return $located;
	}
	
	function pl_load_template( $_template_file, $args = array(), $require_once = false ) {
		global $posts, $post, $wp_did_header, $wp_query, $wp_rewrite, $wpdb, $wp_version, $wp, $id, $comment, $user_ID;
		
		if ( is_array( $wp_query->query_vars ) )
			extract( $wp_query->query_vars, EXTR_SKIP );
		if(is_array($args))
			extract($args);
		if ( $require_once )
			require_once( $_template_file );
		else
			require( $_template_file );
	}

    public function plugin_path($path="") {
		return untrailingslashit( plugin_dir_path( __FILE__ ) )."/".$path;
	}
    public function include_path($path="") {
		return untrailingslashit($this->include_path)."/".$path;
	}

    public function plugin_url($path="") {
    	return untrailingslashit(  plugins_url('', __FILE__ ) )."/".$path;
	}
	
}

function WC_PD() {
	return ProductDesign::instance();
}
$GLOBALS['wcpd'] = WC_PD();