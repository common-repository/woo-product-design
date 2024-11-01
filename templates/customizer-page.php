<?php 
global $post;
$product = new WC_Product($post->ID);
get_header(); 


$bootstrapData = get_post_meta($post->ID,'customizer_bootstrap_data', true);
$session_data = false; 
if(!isset($_SESSION)){
	@session_start();
}
if(isset($_SESSION['wc_pd_customizetion_data'][$product->id])){
	//echo "<pre>";
	//print_r($_SESSION['wc_pd_customizetion_data'][$product->id]);
	//echo "</pre>";
	$bootstrapDataNew = "'".json_encode($_SESSION['wc_pd_customizetion_data'][$product->id]['customize_data'])."'";
	$session_data = true;

	$bootstrapData = $bootstrapDataNew;
}


$enable_bounding = get_post_meta($post->ID, 'enable_bounding', true);

$bounding_coords = get_post_meta($post->ID, 'bounding_coords', true);
$bounding_box_mode = get_post_meta($post->ID, 'bounding_box_mode', true);
?>
<header class="entry-header">
	<h2 class="entry-title"><?php echo $post->post_title; ?></h2>
</header>
<?php do_action('before_wcpd_cutomizer', $post) ?>	

<div id="wc_pd_cutomizer" class="customizer-main"></div>

<?php do_action('after_wcpd_cutomizer', $post) ?>

<?php do_action( 'wc_pd_before_add_to_cart_form' ); ?>

<form id="wc_pd_add_to_cart">
 	<?php do_action( 'wc_pd_before_add_to_cart_button' ); ?>

 	<?php
 		//if ( ! $product->is_sold_individually() ) {
 			/*woocommerce_quantity_input( array(
 				'min_value'   => apply_filters( 'woocommerce_quantity_input_min', 1, $product ),
 				'input_value' => ( isset( $_POST['quantity'] ) ? wc_stock_amount( $_POST['quantity'] ) : 1 )
 			) );*/
 		//}
 	?>

 	<input type="hidden" name="product_id" value="<?php echo esc_attr( $post->ID ); ?>" />
 	<input type="hidden" name="customize_data" value="" />
 	<button type="submit" id="wc_pd_add_to_cart_button" class="single_add_to_cart_button button alt"> Save <?php //echo esc_html( $product->single_add_to_cart_text() ); ?></button> 

	<?php do_action( 'wc_pd_after_add_to_cart_button' ); ?>
</form>

<?php do_action( 'wc_pd_after_add_to_cart_form' ); ?>

<?php  
$colors = array();

//if ( $product->is_type( 'variable' ) ) {
    $attributes = $product->get_attributes();
    $attributes = array_map(function($attribute){
        if($attribute['is_taxonomy']){
            $terms = wc_get_product_terms( $product->id, $attribute_name, array( 'fields' => 'all' ) );
            $attribute['terms'] = $terms;
            foreach($terms as $term) {
                $attribute['value'][] = $term->name;
            }
        }else{
            $attribute['value'] = array_map('trim',explode('|', $attribute['value']));
            return $attribute;
        }
    },  $attributes);
//}
//$attributes = $product->get_attributes();
//print_r($attributes);

$colors = $attributes['color']['value'];

$colors = is_array($colors) ? $colors  : explode('|', $attributes['color']['value']);

?>

<script type="text/javascript">
	var customizer, maskLayer, customizerPayload, currentWidth = 0;
	(function($){
		var data = {};
		data = JSON.parse(<?php echo !empty($bootstrapData) ? $bootstrapData : '"[]"'; ?>);
		$(function(){
		    customizer = new Customizer({
			    selector: '#wc_pd_cutomizer',
			    bootstrapData: data.fields,
			    settings : {
			    	backgroundColors : <?php echo json_encode($colors); ?>,
			        color_description : '<?php echo  preg_replace("/\r\n|\r|\n/",'<br/>', get_option('wcpd_color_description')); ?>',
					review_description : '<?php echo  preg_replace("/\r\n|\r|\n/",'<br/>',get_option('wcpd_review_description')); ?>',
					review_terms : '<?php echo  preg_replace("/\r\n|\r|\n/",'<br/>',get_option('wcpd_review_terms')); ?>',
					review_button : '<?php echo  preg_replace("/\r\n|\r|\n/",'<br/>',get_option('wcpd_review_button')); ?>',

			     	imageUploadUrl : '<?php echo  admin_url( 'admin-ajax.php' ) ?>',
			      	administration : false,
			      	<?php echo ($enable_bounding == 'true') ?  "boundingBoxCoords : 'maskLayer'," : ""; ?>
			      	//<?php echo ($bounding_box_mode ) ? "boundingMode : '{$bounding_box_mode}'," : ""; ?>
			      		
			      	fonts : <?php echo json_encode(wppd_get_fonts())?>,
			     	images : [{
		        		id : 1,
						title : "Clip-arts",
			        	images :  <?php echo json_encode(wppd_get_cliparts())?>
			      	}]
			    }
			});


			customizer.on('add-to-cart', function(payload, evt){
		        ele = $(evt.currentTarget)
		        
		        var image = customizer.mainView.canvas.toDataURL()
		        var formData = new FormData(jQuery('#wc_pd_add_to_cart')[0])
			    formData.append('image', image);
			    formData.append('action', 'wc_pc_save_customizetion');
			    
			    payload = customizer.mainView.getPayload();
			    formData.append('customize_data', payload);

		        jQuery.ajax({
				  url: '<?php echo  admin_url( 'admin-ajax.php' ) ?>',
				  type: "post",
				  data: formData,
				  dataType: 'json',
				  contentType: false,
				  processData: false,
				  cache: false,
				  beforeSend: function() {
				  	jQuery(ele).addClass('loading button').attr('disabled', 'disabled');
				    //return _this.loader.show();
				  },
				  success: function(data) {
				  	jQuery(ele).removeClass('loading button').removeAttr('disabled');
				    window.location = data.product_url;
				  },
				  error: function() {
				  	jQuery(ele).removeClass('loading button').removeAttr('disabled');
				  }
				});
		    });

			create_mask_layer();
			show_hide_mask_layer(1);


		  	
		});
		

		jQuery(document).on('click', '#wc_pd_add_to_cart_button', function(e){
			e.preventDefault();
			add_to_cart(this);
		});
	})(jQuery)



	function add_to_cart(ele){
		//ele = $(evt.currentTarget)
		        
        var image = customizer.mainView.canvas.toDataURL()
        var formData = new FormData(jQuery('#wc_pd_add_to_cart')[0])
	    formData.append('image', image);
	    formData.append('action', 'wc_pc_save_customizetion');
	    
	    var payload = customizer.mainView.getPayload();
	    formData.append('customize_data', payload);

        jQuery.ajax({
		  url: '<?php echo  admin_url( 'admin-ajax.php' ) ?>',
		  type: "post",
		  data: formData,
		  dataType: 'json',
		  contentType: false,
		  processData: false,
		  cache: false,
		  beforeSend: function() {
		  	jQuery(ele).addClass('loading button').attr('disabled', 'disabled');
		    //return _this.loader.show();
		  },
		  success: function(data) {
		  	jQuery(ele).removeClass('loading button').removeAttr('disabled');
		    window.location = data.product_url;
		  },
		  error: function() {
		  	jQuery(ele).removeClass('loading button').removeAttr('disabled');
		  }
		});
		/*var image = customizer.mainView.canvas.toDataURL()

		var payload = customizer.mainView.getPayload();

		var formData = new FormData(jQuery('#wc_pd_add_to_cart')[0])

	    formData.append('customize_data', payload);
	    formData.append('image', image);
	    formData.append('action', 'wc_pc_add_to_cart');


		jQuery.ajax({
		  url: '<?php echo  admin_url( 'admin-ajax.php' ) ?>',
		  type: "post",
		  data: formData,
		  dataType: 'json',
		  contentType: false,
		  processData: false,
		  cache: false,
		  beforeSend: function() {
		  	jQuery(ele).addClass('loading').attr('disabled', 'disabled');
		    //return _this.loader.show();
		  },
		  success: function(data) {
		  	jQuery(ele).removeClass('loading').removeAttr('disabled');
		    window.location = data.cart_url;
		  },
		  error: function() {
		  	jQuery(ele).removeClass('loading').removeAttr('disabled');
		  }
		});*/
	}

	function show_hide_mask_layer(is_visible){
  		maskLayer = customizer.mainView.canvas.getItemByName('maskLayer').model;
  		if(is_visible)
    		opacity = 1
    	else
    		opacity = 0
		customizer.mainView.updateLayer(maskLayer.cid,{ opacity : opacity });
		 
	}

	function create_mask_layer(){
		
		if(maskLayer === undefined || maskLayer === null || maskLayer == ""){
			
		 	if(customizer.mainView.canvas.getItemByName('maskLayer') !== null){
			 	maskLayer = customizer.mainView.canvas.getItemByName('maskLayer').model;
			 	return;
			}

			var coords = <?php echo json_encode($bounding_coords); ?>;
			var attrs = {
			  	type : 'rect',
			  	object : 'rect',
			  	name : 'rect',
			  	title : 'maskLayer',
			  	layer_data : {
			  		displayInLayerBar : false,
			  		left: parseInt(coords.left), 
			        top: parseInt(coords.top), 
	      			fill : 'rgba(0,0,0,0)',
			        stroke: '#000',
			        strokeDashArray: [5, 5],
					strokeWidth: 1,
			  		width : parseInt(coords.width),
			  		height : parseInt(coords.height),
			  		opacity: 1,
			  		selectable: false,
			  		locked : true,
			  		zIndex : 999,
			  		stayOnTop : true,
			  		dontSync : true,
			  		evented : false,
			  		bindFor : 'maskLayer',
			  	}
			  }
			  maskLayer = customizer.mainView.createField(attrs)

		}else{
			if( customizer.mainView.canvas.getItemByName('maskLayer') !== null){
			 	maskLayer = customizer.mainView.canvas.getItemByName('maskLayer').model;
			 	return;
			}
		}
	}

	</script>
	<style type="text/css">
	.fb-save-wrapper{
		display: none;
	}
	</style>
<?php get_footer();