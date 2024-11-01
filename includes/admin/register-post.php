<?php
/**
 * WC Dependency Checker
 *
 * Checks if WooCommerce is enabled
 */
class WC_PD_Register_Post {
	
	function __construct() {
		add_action( 'init', array($this,'register_post_type'));
    }


    function register_post_type(){
    	register_post_type( 'wc_pd_clip_arts',
			array(
				'labels' => array(
					'name' => __( 'Logos' ),
					'singular_name' => __( 'Logos' )
				),
				'public' => false,
				'has_archive' => false,
				//'show_ui' => false,
				//'supports' => array('title','editor','thumbnail')
			)
		);

		register_post_type( 'wc_pd_fonts',
			array(
				'labels' => array(
					'name' => __( 'Font' ),
					'singular_name' => __( 'Fonts' )
				),
				'public' => false,
				'has_archive' => false,
				//'show_ui' => false,
				//'supports' => array('title','editor','thumbnail')
			)
		);
    }

}

return new WC_PD_Register_Post();


