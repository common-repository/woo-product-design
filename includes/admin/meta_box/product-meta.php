<?php
class WC_PD_Product_Meta extends WC_PD_Meta {
	public $post_type;
	public $meta_kyes;
	public $post;
	function __construct() {
		parent::init($this->post_type);


		if(isset($_REQUEST['post_ID'])){
			$this->post = get_post(intval($_REQUEST['post_ID']));
		}else{
			$this->post = get_post(intval($_REQUEST['post']));
		}

		$key = "_pd_product_image";
		add_action('pd_upload_field_jquery_'.$key, array( $this, 'pd_upload_field_jquery'), 1, 2);

		
		$this->post_type = 'product';
		$this->meta_keys = array(
			'_pd_is_enable',
			'_pd_customize_price',
			'_pd_product_image',
			'_pd_text_1',
			'_pd_text_2',
		);
		add_action( 'add_meta_boxes', array($this, 'meta_box'), 1, 2 );


		add_action('pre_post_update', array( $this, 'save_meta'), 1, 2);
		add_action('save_post', array( $this, 'save_meta'), 1, 2);
		add_action('publish_post', array( $this, 'save_meta'), 1, 2);
		add_action('edit_page_form', array( $this, 'save_meta'), 1, 2);


    }

    function meta_box($post){
    	add_meta_box( 
	        'pd-meta-box',
	        __( 'Product Design' ),
	        array($this,'meta_box_html'),
	        $this->post_type,
	        'normal',
	        'high'
	    );
    }

    function meta_box_html($post){
    	echo '<input type="hidden" name="'.$this->post_type.'_meta_noncename" id="'.$this->post_type.'_meta_noncename" value="'.wp_create_nonce( plugin_basename(__FILE__) ).'" />';

    	foreach ($this->meta_keys as $value) {
    		$$value = get_post_meta($post->ID, $value, true);
    	}

		if(function_exists( 'wp_enqueue_media' )){
		    wp_enqueue_media();
		}else{
		    wp_enqueue_style('thickbox');
		    wp_enqueue_script('media-upload');
		    wp_enqueue_script('thickbox');
		}
		?>
		<div class="panel-wrap product_data pd_meta_box">
				<div class="form-field">
					<div class="input-label">
						<label for="_pd_is_enable">Is enable?</label>
					</div>
					<div class="input-field">
						<input type="checkbox" <?php echo checked($_pd_is_enable, 'yes'); ?> value="yes" id="_pd_is_enable" name="_pd_is_enable" style="" class="checkbox">
						<span class="description">Enable product design</span>
					</div>
				</div>
				<div class="form-field">
					<div class="input-label">
						<label for="_pd_customize_price">Customize price</label>
					</div>
					<div class="input-field">
						<input type="text"  value="<?php echo $_pd_customize_price; ?>" id="_pd_customize_price" name="_pd_customize_price" style="">
					</div>
				</div>
				<!-- <div class="form-field">
					<div class="input-label">
						<label for="_pd_text_1">Text 1</label>
					</div>
					<div class="input-field">
						<input type="text"  value="<?php echo $_pd_text_1; ?>" id="_pd_text_1" name="_pd_text_1" style="">
					</div>
				</div>
				<div class="form-field">
					<div class="input-label">
						<label for="_pd_text_2">Text 2</label>
					</div>
					<div class="input-field">
						<input type="text"  value="<?php echo $_pd_text_2; ?>" id="_pd_text_2" name="_pd_text_2" style="">
					</div>
				</div> -->
				<div class="form-field">
					<div class="input-label">
						<label class="" for="_pd_product_image">Customizer Image</label>
					</div>
					<div class="input-field">
					<?php 
					$args = array(
						'name' => '_pd_product_image',
						'value'	=> $_pd_product_image,
						'setting_button'=>'show',
					);
					echo $this->get_upload_field($args); 
					?>
					</div>
					<!-- <div style="display:none">
						<div id="_pd_product_image_setting_modal" >
							<div class="setting_modal_inner">
								<div class='customizer-main'></div>
							</div>
						</div>
					</div> -->
					
					
					<!-- <script type="text/javascript">
					var last_code = {};
					window.set_croper = function(attachment, data, ele, target){
						var jcrop_api;

						ele.find('.target').attr('src', attachment.url);
						if(attachment.coords !== undefined){
							jQuery.each(attachment.coords, function(index,value){
								ele.find('.coords .'+index).val(value);
							});
						}
						
						ele.find('.set-coords').on('click', function(){
							jQuery('#TB_closeWindowButton').click();
							jcrop_api.destroy();
						});

					    ele.find('.target').Jcrop({
					      onChange:   showCoords,
					      onSelect:   showCoords,
					      onRelease:  clearCoords
					    },function(){
					      	jcrop_api = this;
					      	var x1 = ele.find('.x1').val(),
					          x2 = ele.find('.x2').val(),
					          y1 = ele.find('.y1').val(),
					          y2 = ele.find('.y2').val();
					      	jcrop_api.setSelect([x1,y1,x2,y2]);
					    });
					    


					    ele.find('.coords').on('change','input',function(e){
					      var x1 = ele.find('.x1').val(),
					          x2 = ele.find('.x2').val(),
					          y1 = ele.find('.y1').val(),
					          y2 = ele.find('.y2').val();
					      	jcrop_api.setSelect([x1,y1,x2,y2]);
					    });
					    function showCoords(c){
						    ele.find('.x1').attr('value',c.x).val(c.x);
						    ele.find('.y1').attr('value',c.y).val(c.y);
						    ele.find('.x2').attr('value',c.x2).val(c.x2);
						    ele.find('.y2').attr('value',c.y2).val(c.y2);
						    ele.find('.w').attr('value',c.w).val(c.w);
						    ele.find('.h').attr('value',c.h).val(c.h);
						};
						function clearCoords(){
						    ele.find('.coords input').attr('value',"").val('');
						};

					}
					</script> -->
				</div>

			</div>
		
		<?php
    }

	function save_meta($post_id, $post) {

		if ( !wp_verify_nonce( $_POST[$this->post_type.'_meta_noncename'], plugin_basename(__FILE__) )) {
			return $post->ID;
		}
		foreach ($this->meta_keys as $value) {
    		$post_meta[$value] = $_POST[$value];
    	}

		if(!parent::save_meta($post_meta, $post_id, $post))
			return $post->ID;
	}

	function pd_upload_field_jquery($setting_button="", $args =""){
		$key = $args['name'];
		ob_start();
		if($is_show_settings_button){
		?>
		<script type="text/javascript">
		jQuery(document).ready(function(){
			jQuery(document).on('click','.<?php echo $key; ?>_settings', function(){
				var $li = jQuery(this).closest('li');
	            jQuery("#TB_window").remove();
	            jQuery("body").append("<div id='TB_window'></div>");
	            var post_id = $li.attr('data-post-id');
	            var image_id = $li.attr('data-image-id');
	            var ajax_url = "<?php echo  admin_url( 'admin-ajax.php' ) ;?>?";
	            ajax_url +=  'action=get_pd_image_data';
	            ajax_url +=  'post_id='+post_id;
	            ajax_url +=  'image_id='+image_id;
	            tb_show("", ajax_url, "");
			});
		});
		</script>
		<?php
		}
		return ob_get_clean();
	}
}
new WC_PD_Product_Meta();

