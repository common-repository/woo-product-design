<?php

class WC_PD_Customizer{
	function __construct(){
		add_action( 'woocommerce_after_add_to_cart_button', array($this,'add_content_after_addtocart_button') );

		add_filter( 'query_vars', array($this,'customizes_rewrite_add_var'), 1);
		add_action( 'template_redirect', array($this,'customizes_rewrite_catch'));
		add_filter('rewrite_rules_array',array($this,'add_customize_rewrite_rule'));
		add_filter('init',	array($this,'flushRules'));
		add_filter('wp_enqueue_scripts', array($this,'add_scripts'));

		add_action('wp_ajax_wc_pc_save_customizetion',array($this,'wc_pc_save_customizetion')); 
		add_action('wp_ajax_nopriv_wc_pc_save_customizetion',array($this,'wc_pc_save_customizetion')); 

		add_filter('woocommerce_add_cart_item_data',array($this, 'namespace_force_individual_cart_items'),10,2);
		add_filter('woocommerce_add_cart_item', array($this, 'add_cart_item'), 99, 1);


		add_filter( 'woocommerce_get_item_data',  array($this,'render_meta_on_cart_and_checkout'), 99, 2 );
		add_action( 'woocommerce_add_order_item_meta', array($this,'customize_order_meta_handler'), 99, 3 );
		add_action( 'woocommerce_before_calculate_totals', array($this,'update_custom_price'), 99, 1 );


		add_filter('woocommerce_cart_item_permalink',array($this,'wc_pd_customizer_image_link'),99,3);
		add_filter('woocommerce_cart_item_thumbnail',array($this,'wc_pd_customizer_image'),1,3);
		
		add_filter('woocommerce_cart_item_quantity',array($this, 'cart_item_quantity'),99,3);

		add_filter('woocommerce_cart_item_class',array($this, 'cart_item_class'),99,3);


		add_action('woocommerce_remove_cart_item', array($this, 'remove_cart_item'),10,3);
		add_action('woocommerce_cart_item_permalink', array($this, 'cart_item_permalink'),10,3);
		
		add_action('woocommerce_add_order_item_meta',  array($this,'add_order_item_meta'),1,3);


		add_action('woocommerce_cart_item_name', array($this, 'cart_item_name'),11,3);
		add_filter('woocommerce_order_item_permalink', array($this, 'order_item_permalink'),11,3);

		add_filter('woocommerce_order_item_name', array($this, 'order_item_name'),11,3);
		
		//add_action('woocommerce_order_item_meta_start', array($this, 'woocommerce_order_item_meta_start'),11,3);
		add_filter('woocommerce_order_items_meta_get_formatted', array($this, 'order_items_meta_get_formatted'),11,2);



	}
	function add_order_item_meta($item_id, $values, $cart_item_key){
		global $woocommerce,$wpdb;
        $customize_data = $values['customize_data'];
        
        if(!empty($customize_data)){
            wc_add_order_item_meta($item_id,'customize_data',$customize_data);  
        }
        if(isset($values['main_product']) && !empty($values['main_product'])){
        	wc_add_order_item_meta($item_id,'main_product',$values['main_product']); 
        	wc_add_order_item_meta($item_id,'cart_id',$cart_item_key); 
        }
        if(isset($values['parent_cart_id']) && !empty($values['parent_cart_id'])){
        	wc_add_order_item_meta($item_id,'parent_cart_id',$values['parent_cart_id']); 
        	wc_add_order_item_meta($item_id,'cart_id',$cart_item_key); 
        }
	}

	function update_custom_price( $cart_object ) {
	    foreach ( $cart_object->get_cart() as $cart_item_key => $cart_item ) {  
	    	if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
		    	$customize_price = get_post_meta( $cart_item['product_id'], '_pd_customize_price', true);

	        	$additionalPrice = (isset($customize_price) && !empty($customize_price)) ? $customize_price : 0;

	        	if( isset( $cart_item['data']->price ) ) {
                    /* Version before 3.0 */
                    $orgPrice = floatval( $cart_item['data']->price );
                    $cart_item['data']->price = ( $orgPrice + $additionalPrice );

                } else {
                    /* Woocommerce 3.0 + */
                    print_r($cart_item);
                    $orgPrice = floatval( $cart_item['data']->get_price() );
                    $cart_item['data']->set_price( $orgPrice + $additionalPrice );
                } 
	        }
	    }
	}

	function render_meta_on_cart_and_checkout( $cart_data, $cart_item = null ) {
	    $meta_items = array();
	    /* Woo 2.4.2 updates */
	    if( !empty( $cart_data ) ) {
	        $meta_items = $cart_data;
	    }

	    if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
	    	$customize_price = get_post_meta( $cart_item['product_id'], '_pd_customize_price', true);

        	$additionalPrice = (isset($customize_price) && !empty($customize_price)) ? $customize_price : 0;

        	$meta_items[] = array( "name" => "Customize fee", "value" => $additionalPrice );
	    }
	    return $meta_items;
	}

	function customize_order_meta_handler( $item_id, $values, $cart_item_key ) {
		$cart_items = $woocommerce->cart->get_cart();
		$cart_item = $cart_items[$cart_item_key];
		if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
	    	$customize_price = get_post_meta( $cart_item['product_id'], '_pd_customize_price', true);

        	$additionalPrice = (isset($customize_price) && !empty($customize_price)) ? $customize_price : 0;

        	wc_add_order_item_meta( $item_id, "Customize fee", $additionalPrice);
	    }
	}


    function add_cart_item($cart_item){

        if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){

			if(!isset($_SESSION)){
				session_start();
			}

			$product_id = $cart_item['product_id'];

			unset($_SESSION['wc_pd_customizetion_data'][$product_id]);
			
        	$customize_price = get_post_meta( $cart_item['product_id'], '_pd_customize_price', true);
    		$additionalPrice = (isset($customize_price) && !empty($customize_price)) ? $customize_price : 0;

        	if( isset( $cart_item['data']->price ) ) {
                /* Version before 3.0 */
                $orgPrice = floatval( $cart_item['data']->price );
                $cart_item['data']->price = ( $orgPrice + $additionalPrice );
            } else {
                /* Woocommerce 3.0 + */
                $orgPrice = floatval( $cart_item['data']->get_price() );
                $cart_item['data']->set_price( $orgPrice + $additionalPrice );
            } 

        	return $cart_item;
        }
        
        return $cart_item;
    }

	function cart_item_name($name, $cart_item, $cart_item_key){
		if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
			$link = ' <a class="cart-product-view-proof btn btn-tiny" target="_blank" href="'.$cart_item['customize_data']['customize_image'].'">View Proof</a>';

			$name = "Custom ".$name.$link;

		}
		return $name;
	}

	/*function woocommerce_order_item_meta_start($item_id, $item, $order){
		//print_r( $item);
		
	}*/
	function order_items_meta_get_formatted( $formatted_meta, $class){
		foreach ($formatted_meta as $key => $value) {
        	$attributes = $class->product->get_attributes();
        	$attributes = array_keys($attributes);
			if(!in_array($value['key'], $attributes)){
				unset($formatted_meta[$key]);
			}
		}
		return $formatted_meta;
	}


	function order_item_permalink($link, $item, $order){
		$item['customize_data'] = maybe_unserialize( $item['customize_data'] );
		if( $item['main_product'] == true || !empty($item['parent_cart_id'])){
			$link = "";
		}
		return $link;

	}
	function order_item_name($name, $item, $is_visible){
		$item['customize_data'] = maybe_unserialize( $item['customize_data'] );
		if(isset($item['customize_data']) && !empty($item['customize_data'])){
			$link = ' <a class="cart-product-view-proof btn btn-tiny" target="_blank" href="'.$item['customize_data']['customize_image'].'">View Proof</a>';

			$name = "Custom ".$name.$link;
		}
		return $name;
	}

	function cart_item_permalink($link, $cart_item, $cart_item_key){
		if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
			$link = "";
		}
		return $link;
	}

	function cart_item_class ($calss, $cart_item, $cart_item_key){
		if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
			$calss .= " wc-pd-custom";
			
			if(isset($cart_item['main_product'])){
				$calss .= " wc-pd-main-product wc-pd-custom-product";
			}else {
				$calss .= " wc-pd-variation wc-pd-custom-product";
			}

		}
		return $calss;
	}

	function remove_cart_item($cart_item_key, $cart){
		
		$cart_item = $cart->get_cart_item($cart_item_key);
	
		if(isset($cart_item['main_product'])){
			$this->first_delete = isset($this->first_delete) && !empty($this->first_delete) ? $this->first_delete : 'main_product';

			if($this->first_delete == 'main_product'){
				foreach ($cart->cart_contents as $key => $cart_item) {
					if($cart_item['parent_cart_id'] == $cart_item_key){
						$cart->remove_cart_item( $key );
					}
				}
			}
		}elseif(isset($cart_item['parent_cart_id'])){
			$this->first_delete = isset($this->first_delete) && !empty($this->first_delete) ? $this->first_delete : 'child_product';
				$items = $cart->get_cart();
				$notfound = true;
				foreach ($items as $key => $item) {
					if(isset($item['parent_cart_id']) && ($item['unique_key'] !== $cart_item['unique_key']) && ($cart_item['parent_cart_id'] == $item['parent_cart_id'])){
						$notfound = false;
						
					}
				}
				if($this->first_delete == 'child_product' && $notfound){
					$cart->remove_cart_item($cart_item['parent_cart_id']);
				}
		}

	}	

    function namespace_force_individual_cart_items($cart_item_data, $product_id)
    {
        $unique_cart_item_key = md5(microtime().rand()."WC_PD");
        $cart_item_data['unique_key'] = $unique_cart_item_key;

			if(!isset($_SESSION)){
				session_start();
			}
        if(isset($_SESSION['wc_pd_customizetion_data'][$product_id])){
			$cart_item_data['customize_data'] = $_SESSION['wc_pd_customizetion_data'][$product_id];
		}

        return $cart_item_data;
    }
    function cart_item_quantity($product_quantity, $cart_item_key, $cart_item){
    	if(!empty($cart_item['customize_data'])){
	        return '<div class="quantity">'.$cart_item['quantity']."</div>";
	    }
        return $product_quantity;
    }


	function wc_pd_customizer_image($image_url, $cart_item, $cart_item_key){
        /*code to add custom data on Cart & checkout Page*/ 

        if(isset($cart_item['customize_data']) && !empty($cart_item['customize_data'])){
        	if(!empty($cart_item['customize_data']['customize_image'])){
	            $image_url = '<img src="'.$cart_item['customize_data']['customize_image'].'" width="180" height="180">';
       
	        }
        }
        return $image_url;
    }
	function wc_pd_customizer_image_link($image_url, $cart_item, $cart_item_key){
        /*code to add custom data on Cart & checkout Page*/  
        if(!empty($cart_item['customize_data']['customize_image'])){
            //$image_url = $cart_item['customize_data']['customize_image'];
        }
        return $image_url;
    }


	
	function wc_pc_remove_customizetion(){
		$product_id = apply_filters( 'wc_pc_remove_customizetion_product_id', absint( $_POST['product_id'] ) );

			if(!isset($_SESSION)){
				session_start();
			}
			
		$old_data = $_SESSION['wc_pd_customizetion_data'];
		
		if(isset($old_data[$product_id])){
			unlink($old_data[$product_id]['customize_path']);
			unset($old_data[$product_id]);
		}
			
		$_SESSION['wc_pd_customizetion_data'] = $old_data;

		$data = array(
			'success'       => true,
			'cart_url'   	=> $cart_url,
			'extra_data'  	=> $extra_data,
			'image'       	=> $targetUrl,
			'product_url' 	=> apply_filters( 'wc_pc_remove_customizetion_redirect_after_success', get_permalink( $product_id ), $product_id )
		);
		wp_send_json( $data );

	}
	function wc_pc_save_customizetion(){

			
		$product_id        = apply_filters( 'wc_pc_save_customizetion_product_id', absint( $_POST['product_id'] ) );
		$passed_validation = apply_filters( 'wc_pc_save_customizetion_validation', true, $product_id, $quantity );
		$product_status    = get_post_status( $product_id );
		
		if ( $passed_validation && ('publish' === $product_status) ) {
			$customize_data = json_decode(stripslashes($_POST['customize_data']));

			$file_name = $product_id."-".time().'-'.rand(0,1000);
			$dir = wp_pd_content_dir();
			$targetPath = $dir."images/custome_product/";
			$new_file_name = $this->save_base64_image($_POST['image'], $file_name, $targetPath);
			
			$url = wp_pd_content_dir('url');
			$targetUrl = $url."images/custome_product/".$new_file_name;

			
			$extra_data['customize_path'] = $targetPath;
			$extra_data['customize_image'] = $targetUrl;
			$extra_data['customize_data'] = $customize_data;

			if(!isset($_SESSION)){
				session_start();
			}

			$old_data = $_SESSION['wc_pd_customizetion_data'];
			$old_data[$product_id] =  $extra_data;
			$_SESSION['wc_pd_customizetion_data'] = $old_data;



			$data = array(
				'success'       => true,
				'cart_url'      => $cart_url,
				'extra_data'    => $extra_data,
				//'image'       	=> $targetUrl,
				'product_url' 	=> apply_filters( 'wc_pc_save_customizetion_redirect_after_success', get_permalink( $product_id ), $product_id )
			);
			wp_send_json( $data );
		}else {

			// If there was an error adding to the cart, redirect to the product page to show any errors
			$data = array(
				'error'       => true,
				'product_url' => apply_filters( 'wc_pc_save_customizetion_redirect_after_error', get_permalink( $product_id ), $product_id )
			);

			wp_send_json( $data );

		}
		exit();
	}

	

	function flushRules(){
		global $wp_rewrite;
	   	$wp_rewrite->flush_rules();
	}
	function add_customize_rewrite_rule($rules){

		$rules['customize/product/(.+)'] = 'index.php/?page=&post_type=product&product=$matches[1]&name=$matches[1]&customize=1';
		
		$rules['product/(.+)/customize'] = 'index.php/?page=&post_type=product&product=$matches[1]&name=$matches[1]&customize=1&attachment=';

	    return $rules;
	}
	function customizes_rewrite_add_var( $vars ){
		$vars[] = 'customize';
		return $vars;
	}

	function add_content_after_addtocart_button() {
		global $product;

		if(!isset($_SESSION)){
			@session_start();
		}
		if(isset($_REQUEST['reset']) && $_REQUEST['reset'] == true){
			unset($_SESSION['wc_pd_customizetion_data'][$product->id]);
		}
		$customize_enabled = get_post_meta($product->id, '_pd_is_enable', true);



		if(isset($customize_enabled) && $customize_enabled == 'yes'){

			if(isset($_SESSION['wc_pd_customizetion_data']) && isset($_SESSION['wc_pd_customizetion_data'][$product->id])){
				?> <div class="customize-button">
					<a href="<?php echo wp_pd_customize_link(); ?>" rel="nofollow" class="single_customize_button button alt">Edit Design</a>
				</div><?php
			}else{
				?> <div class="customize-button">
					<a href="<?php echo wp_pd_customize_link(); ?>" rel="nofollow" class="single_customize_button button alt">Customize</a>
				</div><?php
			}
		}
	}

	function add_scripts(){
		global $wp_query, $wcpd, $post;

		if($wp_query->query_vars['customize'] == 1){

			wp_enqueue_script('pd-kinetic-script',$wcpd->plugin_url('assets/js/kinetic.js'));
			wp_enqueue_script('pd-script-script',$wcpd->plugin_url('assets/js/script.js'), array('pd-kinetic-script'));

			wp_localize_script('pd-script-script', 'wp_pd_cutomizer', [
				'product_image' => get_post_meta($post->ID, '_pd_product_image', true),
				'post' => $post,
				'meta' => array_map(function($v){return $v[0];}, get_post_meta($post->ID)) 
				]);
		}
	}

	function customizes_js_css(){
		wp_enqueue_style('pd-customizer-vendor-css',WC_PD()->plugin_url('assets/customizer/css/vendor.css'));
		wp_enqueue_style('pd-customizer-css',WC_PD()->plugin_url('assets/customizer/css/customizer.css'));

		wp_enqueue_script('pd-customizer-vendor-script',WC_PD()->plugin_url('assets/customizer/js/vendor.js'), array('jquery'));
		wp_enqueue_script('pd-customizer-script',WC_PD()->plugin_url('assets/customizer/js/customizer.js'), array('pd-customizer-vendor-script'));
		wp_enqueue_script('pd-script-script',WC_PD()->plugin_url('assets/js/script.js'), array('pd-customizer-front-script'));
	}
	
	function customizes_rewrite_catch(){
		global $wp_query, $wcpd, $post;
		
		if($wp_query->query_vars['customize'] == 1){
			$this->customizes_js_css();
			$post->guid = $post->guid."&customize=1";
			$wcpd->locate_plugin_template(array('customizer-page.php'), "", [], true);
			
		    exit;
		}
	}

	function save_base64_image($base64_image_string, $file_name, $path="" ) {
		_wcpc_createPath($path);
	    $splited = explode(',', substr( $base64_image_string , 5 ) , 2);
	    $mime=$splited[0];
	    $data=$splited[1];

	    $mime_split_without_base64=explode(';', $mime,2);
	    $mime_split=explode('/', $mime_split_without_base64[0],2);
	    if(count($mime_split)==2)
	    {
	        $extension=$mime_split[1];
	        if($extension=='jpeg')$extension='jpg';
	        	$output_file_with_extentnion.=$file_name.'.'.$extension;
	    }
	    file_put_contents( trailingslashit($path) . $output_file_with_extentnion, base64_decode($data) );
	    return $output_file_with_extentnion;
	}

}











return new WC_PD_Customizer();