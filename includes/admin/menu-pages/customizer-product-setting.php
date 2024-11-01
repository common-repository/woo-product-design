<?php
if(!class_exists('WC_PD_customizer_product_setting_page')){
	class WC_PD_customizer_product_setting_page extends MenuPage{
		function __construct($menu =[]){
			$this->menu = $menu;
			
			if(isset($_POST['action']) && $_POST['action'] == 'update'){
				
				$this->save($_POST);
				//var_dump($_POST['_wp_http_referer']) ;
				//wp_safe_redirect( $_POST['_wp_http_referer'] );
				//exit();
			}
			$this->html();
		}

		function admin_css(){
			wp_enqueue_style('pd-customizer-vendor-css',WC_PD()->plugin_url('assets/customizer/css/vendor.css'));
			wp_enqueue_style('pd-customizer-css',WC_PD()->plugin_url('assets/customizer/css/customizer.css'));

			wp_enqueue_script('pd-customizer-vendor-script',WC_PD()->plugin_url('assets/customizer/js/vendor.js'));
			wp_enqueue_script('pd-customizer-script',WC_PD()->plugin_url('assets/customizer/js/customizer.js'), array('pd-customizer-vendor-script'));
			wp_enqueue_script('pd-script-script',WC_PD()->plugin_url('assets/js/script.js'), array('pd-customizer-script'));
		}

		function save($post){

			if(check_admin_referer( 'update-customizer_bootstrap_data-'.$post['product_id'] )){
				$customizer_bootstrap_data = $post['customizer_bootstrap_data'];

				update_post_meta(intval($_REQUEST['product_id']), 'customizer_bootstrap_data', $customizer_bootstrap_data);


				if($post['enable_bounding']){
					update_post_meta(intval($_REQUEST['product_id']), 'enable_bounding', 'true');
					update_post_meta(intval($_REQUEST['product_id']), 'bounding_box_mode', $post['bounding_box_mode']);
					if($post['another_element_bounding']){
						update_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding', 'true');
						update_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding_name', $post['another_element_bounding_name']);
					}else{
						update_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding', 'false');
						update_post_meta(intval($_REQUEST['product_id']), 'bounding_coords', $post['bounding_coords']);
					}
				}else{
					update_post_meta(intval($_REQUEST['product_id']), 'enable_bounding', 'false');
				}
			}
		}
		
		public function html(){
			if(isset($_REQUEST['product_id']) && !empty($_REQUEST['product_id'])){
				//$edit = true;
				//$post = get_post($_REQUEST['ID']);
			}
			$this->admin_css();

			$data['enable_bounding'] = get_post_meta(intval($_REQUEST['product_id']), 'enable_bounding', true);
			$data['another_element_bounding'] = get_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding', true);
			$data['another_element_bounding_name'] = get_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding_name', $data['rue']);
			$data['another_element_bounding'] = get_post_meta(intval($_REQUEST['product_id']), 'another_element_bounding', true);
			$data['bounding_coords'] = get_post_meta(intval($_REQUEST['product_id']), 'bounding_coords', true);
			$data['bounding_box_mode'] = get_post_meta(intval($_REQUEST['product_id']), 'bounding_box_mode', true);

			extract($data);
			?>
			<style type="text/css">
			      	.customizer-main{
				        margin: 0 auto;
				        max-width: 1170px;
				        background: #FFFFFF;
			      	}
			      	.customizer-main dd, 
			      	.customizer-main li {
					  	margin-bottom: -1px;
					}
					.fb-save-wrapper{
						display: none;
					}
					/* #update_customizer_data{
						float: right;
					} */
					.claer{
						clear: both;
					}
					.customizer-page .postbox .hndle{
						margin: 0;
						padding: 10px;
						cursor: default !important;
					}
					#wp-element-bounding-panel {
					  width: 100%;
					}
					#wp-element-bounding-panel .pc-input-container {
					  clear: both;
					  margin-bottom: 10px;
					  min-height: 30px;
					}
					#wp-element-bounding-panel .pc-input-container label {
					  float: left;
					  font-weight: bold;
					  width: 180px;
					}
					#wp-element-bounding-panel .input-fields {
						float: left;
						margin-left: 10px;

					}
					#wp-element-bounding-panel .wp-pc-define-bounding-coords .input-fields label{
						width: 75px;
					}
			  </style>

			<div class="wrap customizer-page"><h2>Customizer </h2> 
				<form action="" id="update_customizer_data" method="post">

					
					<input type="hidden" name="action" value="update" >
					<input type="hidden" name="product_id" value="<?php echo intval($_REQUEST['product_id']); ?>" >
					<input type="hidden" name="customizer_bootstrap_data" value="" >
					<?php  
					wp_nonce_field( 'update-customizer_bootstrap_data-'.intval($_REQUEST['product_id']) );
					?>
					<div class="postbox">
						<h2 class="hndle"><span>Settings</span></h2>
						<div class="inside">
							<div id="wp-element-bounding-panel" class="fb-tab-pane active">

								<div class="pc-input-container input-checkbox">
									<label class="input-label" for="wp_enable_bounding">Enable bounding box</label>
									<div class="input-fields checkbox"> 
										<input type="checkbox" class="toggle-div" data-target="#wp-pc-define-bounding" id="wp_enable_bounding" name="enable_bounding" <?php echo $enable_bounding == 'true' ? 'checked' : '' ?>>
									</div>
								</div>
								<div id="wp-pc-define-bounding" class="wp-pc-define-bounding"  <?php echo $enable_bounding == 'true' ? '' : 'style="display:none"' ?>>

									<div class="wp-pc-define-bounding-coords" <?php echo $another_element_bounding == 'true' ? 'style="display:none"' : '' ?>>
										<div class="pc-input-container pc-full-width">
											<label class="input-label">Define Bounding Box Coords</label>
											<div class="input-fields text"> 
												<div class="pc-input-container pc-half-width">
													<label class="input-label">Left</label>
													<input class="bounding_coords" data-coord="X"  type="number" name="bounding_coords[left]" value="<?php echo $bounding_coords['left'] ?>">
												</div>
												<div class="pc-input-container pc-half-width">
													<label class="input-label">Top</label>
													<input class="bounding_coords" data-coord="Y" type="number" name="bounding_coords[top]" value="<?php echo $bounding_coords['top'] ?>">
												</div>
											</div>

											<div class="input-fields text"> 
												<div class="pc-input-container pc-half-width">
													<label class="input-label">Width</label>
													<input class="bounding_coords" data-coord="Width" type="number" name="bounding_coords[width]" value="<?php echo $bounding_coords['width'] ?>">
												</div>
												<div class="pc-input-container pc-half-width">
													<label class="input-label">Height</label>
													<input class="bounding_coords" data-coord="Height" type="number" name="bounding_coords[height]" value="<?php echo $bounding_coords['height'] ?>">
												</div>
											</div>
											
										</div>
									</div>


									<div class="pc-input-container pc-full-width">
										<label class="input-label">Mode</label> 
										<div class="input-fields select">
											<select class="input_bounding_box_mode" name="bounding_box_mode">
												<option value="inside" <?php echo selected('inside', $bounding_box_mode)?>>Inside</option>
												<option value="clipping" <?php echo selected('clipping', $bounding_box_mode)?>>Clipping</option>
											</select>
										</div>
									</div>
								</div>
							</div>
							<input type="submit" class="button button-primary button-large" value="Update">
						</div>
					</div>
				</form>
				<div class="claer"></div>
				<div class="postbox">
					<div class="claer"></div>
					<div class="setting_modal_inner">
						<div class='customizer-main'></div>
					</div>
								
				</div>
			<?php
			

			$background = get_post_meta(intval($_REQUEST['product_id']), 'font_file', true);

			$bootstrapData = get_post_meta(intval($_REQUEST['product_id']), 'customizer_bootstrap_data', true);
			//$bootstrapData = json_decode($bootstrapData);
			//var_dump($bootstrapData);
			?>
			<script type="text/javascript">
			var customizer, maskLayer
			(function($){
				var data = {};
				data = JSON.parse(<?php echo !empty($bootstrapData) ? $bootstrapData : '"[]"'; ?>);
				$(function(){
				    customizer = new Customizer({
				    selector: '.customizer-main',
				    bootstrapData: data.fields,
				    settings : {
				     	imageUploadUrl : '<?php echo  admin_url( 'admin-ajax.php' ) ?>',
				      	administration : true,
				      	fonts : <?php echo json_encode(wppd_get_fonts())?>,
				     	images : [{
				     		id : 1,
							title : "Clip-arts",
				        	images : <?php echo json_encode(wppd_get_cliparts())?>
				      	}]
				    }
				  });


				  customizer.on('save', function(payload){
				    payload = JSON.stringify(payload);
				    $('#update_customizer_data').find('[name="customizer_bootstrap_data"]').val(payload);
				   
				  })



					$parent = jQuery('#wp-element-bounding-panel');
					$parent.on('click', '.toggle-div', function(e){
						target = jQuery(this).data('target');
					    $parent.find(target).slideToggle();
					});

					$parent.on('click', '#wp_enable_bounding', function(e){
						if(jQuery(this).is(':checked')){
					    	create_mask_layer();
					    	update_mask_layer();
					   	}else{
					   		remove_mask_layer()
					   	}
					});	

					if($parent.find('#wp_enable_bounding').is(':checked'))
					    create_mask_layer()

					$parent.on('change', '.bounding_coords', function(e){
						update_mask_layer()
					});	
					$parent.on('keyup', '.bounding_coords', function(e){
						update_mask_layer()
					});	
					$parent.on('keydown', '.bounding_coords', function(e){
						update_mask_layer()
					});	



				});
			})(jQuery)

			function create_mask_layer(){
				
				if(maskLayer === undefined || maskLayer === null || maskLayer == ""){
					
				 if(customizer.mainView.canvas.getItemByName('maskLayer') !== null){
				 	maskLayer = customizer.mainView.canvas.getItemByName('maskLayer').model;
				 	
				 	return;
				 }

				var coords = getCoords();
				var attrs = {
				  	type : 'rect',
				  	object : 'rect',
				  	name : 'rect',
				  	title : 'maskLayer',
				  	layer_data : {
				  		displayInLayerBar : false,
				  		left: coords.left, 
				        top: coords.top, 
	          			fill : 'rgba(0,0,0,0)',
				        stroke: '#000',
				        strokeDashArray: [5, 5],
	   					strokeWidth: 1,
				  		width : coords.width,
				  		height : coords.height,
				  		opacity: 1,
				  		selectable: false,
				  		locked : true,
				  		zIndex : 999,
				  		stayOnTop : true,
				  		dontSync : true,
				  		evented : false,
				  	}
				  }

				  maskLayer = customizer.mainView.createField(attrs)
				}
			}

			function remove_mask_layer(){
				customizer.mainView.removeLayer(maskLayer.cid)
				maskLayer = null;
			}

			function update_mask_layer(){
				var coords = getCoords();
				if(maskLayer === undefined || maskLayer === null || maskLayer == ""){
					create_mask_layer();
				}else{
					customizer.mainView.updateLayer(maskLayer.cid,{
						left: coords.left, 
					    top: coords.top, 
					    width : coords.width,
					  	height : coords.height,
					  	stroke : 'rgba(0,0,0,1)',
				  		stayOnTop : true,
				  		zIndex : 999,
				  		dontSync : true,
				  		evented : false,
					})
				}
			}

			function getCoords(){
				$parent = jQuery('#wp-element-bounding-panel');

				var left = parseInt($parent.find('[name="bounding_coords[left]"]').val());
				var top = parseInt($parent.find('[name="bounding_coords[top]"]').val());
				var width = parseInt($parent.find('[name="bounding_coords[width]"]').val());
				var height = parseInt($parent.find('[name="bounding_coords[height]"]').val());
				return {
					left:  left > 0 ? left : 0, 
				    top:  top > 0 ? top : 0, 
				    width :  width > 0 ? width : 0,
				  	height :  height > 0 ? height : 0,
				};
			}

			</script>
			</div>
			<?php
		}
	}
}

return new WC_PD_customizer_product_setting_page();