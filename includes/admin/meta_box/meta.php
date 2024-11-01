<?php
/**
 * WC Dependency Checker
 *
 * Checks if WooCommerce is enabled
 */
class WC_PD_Meta {

    function init($post_type=""){
       
    }

    function ajax_get_pd_image_data(){
        $request = $_REQUEST;
        $data = array();
        if(isset($request['id']) && !empty($request)){
            $data['images']['image'] = wp_get_attachment_image_src(intval($request['id']),'full');
        }
        echo json_encode($data);
        exit();
    }
	
	function save_meta($post_meta, $post_id){
		if ( !current_user_can( 'edit_post', $post_id ))
			return false;

		foreach ($post_meta as $key => $value) { 
			//if( $post->post_type == 'revision' ) return; 
			//	$value = implode(',', (array)$value);
			
			if(get_post_meta($post_id, $key, FALSE)) { 
				update_post_meta($post_id, $key, $value);
			} else {
				add_post_meta($post_id, $key, $value);
			}
			
			if(!$value) 
				delete_post_meta($post_id, $key);
		}
	}

    function get_upload_field($args){
        global $wpdb;
        $default = array(
            'name'          => '',
            'value'         => '',
            'save_by'       => 'id',
            //'multiple'      => 'true',
            'button_text'   => 'Upload Image',
            'title'         => 'Custom Image',
            'onSelect'      => '',
            'onRemove'      => '',
            'setting_button'=> 'hide',
            );
        $args = array_merge($default, $args);
        $key = $args['name'];
        $images = $args['value'];

        ob_start();
        $is_show_settings_button = false;
        $settings_button_name = 'Setting';

        #$settings_button_link = '#TB_inline?height=full&width=full&inlineId='.$key.'_setting_modal'; //'javascript:';
        
        $settings_button_link = admin_url('admin.php?page=customizer-product-setting&product_id='.intval($_REQUEST['post'])); 

        $setting_button_html = '<a href="%1$s" class="%2$s_settings button button-small" data-post-id="%3$s">%4$s</a> ';

        if(is_array($args['setting_button'])){
            $setting_button = $args['setting_button'];
            $is_show_settings_button = true;
            if(isset($setting_button['html'])){
                $setting_button_html = $setting_button['html'];
            }
            if(isset($setting_button['name'])){
                $settings_button_name = $setting_button['name'];
            }
            if(isset($setting_button['link'])){
                $settings_button_link = $setting_button['link'];
            }
        }else{
            if($args['setting_button'] == 'show'){
                $is_show_settings_button = true;
            }
        }
        ?>

        <div class="image_upload" > 
            <div class="image_upload_container" id="image-container-<?php echo $key; ?>"> 
            </div>
        </div>
        <script type="text/javascript">


        jQuery(document).ready(function($) {

            var ele = jQuery('#image-container-<?php echo $key; ?>');
            var data = <?php echo json_encode($args); ?>;
            add_image_item(data, ele);

            function add_image_item(data, ele){

                var container = jQuery("<ul class='image_upload_"+data.name+"'></ul>");
                var setting_link = '<?php if($is_show_settings_button) printf($setting_button_html, $settings_button_link, $key, $post_id, $settings_button_name); ?>';

                if(data !== undefined && data.value !== undefined){
                    if(typeof data.value === Array){
                        for (var i = 0; i <= data.value.length; i++) {
                            add_html(data.value[i]);   
                        }
                    }else{
                        if(data.value == null || data.value == "")
                            add_html();
                        else
                            add_html(data.value);  
                    }
                }else{
                    add_html();
                }

                container.appendTo(ele);

                function add_html(attachment){

                    if(attachment !== undefined){

                        var image_continer = jQuery('<div class="image-continer"></div>');
                        var img = jQuery('<img class="image" height="100" width="100"/>').attr('src', attachment.url );
                        var image_hidden = jQuery('<input type="hidden" name="'+data.name+'['+data.save_by+']" size="60" value="'+attachment[data.save_by]+'">');
                        var image_hidden_id = jQuery('<input type="hidden" name="'+data.name+'[id]" size="60" value="'+attachment.id+'">');
                        var image_hidden_id = jQuery('<input type="hidden" name="'+data.name+'[url]" size="60" value="'+attachment.url+'">');
                            
                        img.appendTo(image_continer);
                        image_hidden_id.appendTo(image_continer);
                        image_hidden.appendTo(image_continer);
                    }

                    var remove_btn = jQuery('<a href="javascript:" class="remove button button-red button-small">Remove</a> ').on('click', function(){
                            add_html();
                            jQuery(this).closest('li').remove();
                        });

                    var add_btn =  jQuery('<a href="javascript:" class="add button button-primary button-small">Add</a> ').on('click', function(){
                            select_image('relpace', jQuery(this).closest('li'));
                        });

                    var change_btn = jQuery('<a href="javascript:" class="change button button-primary button-small">Change</a> ').on('click', function(){
                            select_image('relpace', jQuery(this).closest('li'));
                        });

                    var setting_btn = jQuery(setting_link);

                    /*var setting_btn = "";
                    if(setting_link != ''){
                        var setting_btn = jQuery(setting_link).on('click', function(e){
                            e.preventDefault();
                            tb_show(jQuery(this).attr('title'), jQuery(this).attr('data-href'));

                            var target = jQuery('#'+data.name+'_setting_modal');
                            after_load = target.attr('data-after-load');
                            var ele = jQuery('#TB_ajaxContent');
                           
                            if(after_load !== undefined && after_load !== null && after_load !== ""){
                                window[after_load](attachment, data, ele, target);
                            }
                        });
                    }*/

                    var button_container = jQuery('<div class="button-continer"></div>');
                    if(attachment !== undefined){
                        button_container.append(change_btn).append(remove_btn).append(setting_btn);
                    }else{
                        button_container.append(add_btn);
                    }

                    var li = jQuery('<li></li>');

                    li.append(image_continer).append(button_container);


                    container.append(li);

                    console.log(attachment);
                }


                function select_image(type, ele){
                    if(type === undefined){
                        type = 'add'
                    }

                    var custom_uploader = wp.media({
                        title: data.title,
                        button: {
                            text: data.button_text
                        },
                        multiple: false,
                    })
                    .on('select', function(){
                        var length = custom_uploader.state().get("selection").length;
                        var attachments = custom_uploader.state().get("selection").models
                        

                        for(var i = 0; i < length; i++) {
                            attachment = attachments[i].toJSON();
                            add_html(attachment);
                        }
                        if(type == 'relpace'){
                            jQuery(ele).remove();
                        }
                        <?php echo $args['onSelect']; ?>
                    }).open();
                }
            }
        });
        </script>
        <?php echo do_action('pd_upload_field_jquery_'.$key,$setting_button, $args);
        echo do_action('pd_upload_field_jquery',$setting_button, $args); ?>
        <?php
        return ob_get_clean();
    }


    function get_upload_field1($args){
        global $wpdb;
    	$default = array(
    		'name' 			=> '',
    		'value'			=> '',
    		'save_by'		=> 'id',
    		'multiple' 		=> 'true',
    		'button_text'	=> 'Upload Image',
    		'title'			=> 'Custom Image',
    		'onSelect'		=> '',
    		'onRemove'		=> '',
    		'setting_button'=> 'hide',
    		);
    	$args = array_merge($default, $args);
    	$key = $args['name'];
    	$images = $args['value'];

    	ob_start();
    	?>

    	<div class="image_upload" id="<?php echo $key; ?>"> 
        	
        	<div class="image_container">
        		<?php if($args['multiple'] == 'false'){
                    if(!empty($images))
                        $images = array($images);
        		}?>
        		<ul class="all_images">
        		<?php 

                $is_show_settings_button = false;
                $settings_button_name = 'Setting';
                $settings_button_link = 'javascript:';//'#TB_inline?height=full&width=full&inlineId='.$key.'_select_modal';
                $setting_button_html = '<a href="%1$s" class="%2$s_settings image_settings_button button button-small" data-post-id="%3$s">%4$s</a> ';

                if(is_array($args['setting_button'])){
                    $setting_button = $args['setting_button'];
                    $is_show_settings_button = true;
                    if(isset($setting_button['html'])){
                        $setting_button_html = $setting_button['html'];
                    }
                    if(isset($setting_button['name'])){
                        $settings_button_name = $setting_button['name'];
                    }
                    if(isset($setting_button['link'])){
                        $settings_button_link = $setting_button['link'];
                    }
                }else{
                    if($args['setting_button'] == 'show'){
                        $is_show_settings_button = true;
                    }
                }


        		foreach ($images as $value) {
        			if(is_numeric($value)){
        				$image_url = wp_get_attachment_image_src($value) ;// $size, $icon
        				$image_full = wp_get_attachment_image_src($value,'full');

        				$image_url =$image_url[0];
                        $image_id = $value;
        			}else{
        				$image_url = $value;
                       
                        $attachment = $wpdb->get_col($wpdb->prepare("SELECT ID FROM $wpdb->posts WHERE guid='%s';", $image_url )); 
                        $image_id = $attachment[0]; 
        			}
                if($args['multiple'] != 'false'){
                    $name = $key."[]";
                }else{
                    $name = $key;
                }

        		?>
        			<li data-post-id="<?php echo $post_id; ?>" data-image-id="<?php echo $image_id; ?>">
        				<input class="<?php echo $key; ?>_value" type="hidden" name="<?php echo $name; ?>" size="60" value="<?php echo $value ?>">
        				<img class="<?php echo $key; ?>_image" src="<?php echo $image_url ?>" height="100" width="100"/>

                        <a href="javascript:" class="<?php echo $key; ?>_remove image_remove_button button button-red button-small">Remove</a>

        				<?php 
        				if($is_show_settings_button){
        					printf($setting_button_html, $settings_button_link, $key, $post_id, $settings_button_name);
        				}

        				?>
        			</li>
        		<?php } ?>
        		</ul>
        		
			</div>
			<div class="buttons">
				<a href="javascript:" class="<?php echo $key; ?>_upload image_upload_button button button-primary button-small">Add image</a>
			</div>
        	
        </div>
        <script type="text/javascript">

		jQuery(document).ready(function($) {

            var $parent = jQuery('#<?php echo $key; ?>');
            var $upload = $parent.find('.<?php echo $key; ?>_upload');
            var $remove = $parent.find('.<?php echo $key; ?>_remove');
            var $image  = $parent.find('.<?php echo $key; ?>_image'); 
            var $ul = $parent.find('.all_images');

            var multiple = <?php echo $args["multiple"] == 'true' ? 'true' : 'false'?>;
	        $upload.click(function(e) {


		            e.preventDefault();
		            var custom_uploader = wp.media({
		                title: '<?php echo $args["title"] ?>',
		                button: {
		                    text: '<?php echo $args["button_text"] ?>'
		                },
		                multiple: multiple,
		            })
		            .on('select', function() {

		            	var length = custom_uploader.state().get("selection").length;
        				var attachments = custom_uploader.state().get("selection").models

        				

        				for(var i = 0; i < length; i++) {

				            attachment = attachments[i].toJSON();

				            console.log([multiple, attachments,i]);

				            var li = '<li data-post-id="<?php echo $post_id; ?>" data-image-id="'+attachment.id+'">'+
	        				'<input class="<?php echo $key; ?>_value" type="hidden" name="<?php echo $name ?>" size="60" value="'+attachment.<?php echo $args['save_by']; ?>+'">'+
	        				'<img class="<?php echo $key; ?>_image" src="'+attachment.url+'" height="100" width="100"/>';

                            
	        				li +='<a href="javascript:" class="<?php echo $key; ?>_remove button button-red button-small">Remove</a>';
                        

                            li += '<?php $is_show_settings_button ? printf($setting_button_html, $settings_button_link, $key, $post_id, $settings_button_name) : '';?>';

	        				li +='</li>';

                            if(multiple == true){
	        				   $ul.append(li);
                            }else{
                               $ul.html(li);
                            }
				        }
                        if(multiple == false){
		        		    $upload.text("Change");
                        } 
		                <?php echo $args['onSelect']; ?>
                        return true;
		            })
		            .open();
		        });
				jQuery(document).on('click','.<?php echo $key; ?>_remove', function(){
					jQuery(this).closest('li').remove();
				});
				
		    });
		</script>
        <?php echo do_action('pd_upload_field_jquery_'.$key,$setting_button, $args);
        echo do_action('pd_upload_field_jquery',$setting_button, $args); ?>
    	<?php
    	return ob_get_clean();
    }
}


