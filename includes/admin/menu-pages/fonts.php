<?php
if(!class_exists('WC_PD_fonts_page')){
	
	class WC_PD_fonts_list_table extends WC_PD_List_Table{ 
		function __construct($config = []){
			$columns = [
				'post_title' => [
						'label' => 'Title',
						'sortable' => true,
					],
				/*'post_content' => [
						'label' => 'Title',
						'value' => function($item){
							return wp_trim_words($item['post_content'], 20, '...');

						},
						'sortable' => true,
					],*/
				'example' => [
						'label' => ' ',
						'value' => function($item){
							return $item['post_title'];
						}
					],
			];

			$this->setColumn($columns)
				->where([
						'where' => 'AND',
						[
							'key' => 'post_type',
							'value' => 'wc_pd_fonts'
						],
						/*[
							'key' => 'post_status',
							'value' => 'publish'
						]*/
					]);
			
			$default = [
			'edit_link' => add_query_arg(),
			'page_link' => add_query_arg()
			];

			$config = array_merge($default, $config);
			$this->menu = $menu;
			parent::__construct($config);
		}
	}

	class WC_PD_fonts_page extends MenuPage{
		function __construct($menu =[]){
			$this->menu = $menu;
			$this->html();
		}

		public function save($post){
			$data = [
				'post_type' => 'wc_pd_fonts',
				'post_title' => $post['title'],
				'post_content' => ' ',
			];

			$post_id = wp_insert_post( $data, true );

			if( ! is_wp_error( $post_id )){
				require_once(ABSPATH . "wp-admin" . '/includes/image.php');
				require_once(ABSPATH . "wp-admin" . '/includes/file.php');
				require_once(ABSPATH . "wp-admin" . '/includes/media.php');

				$attachment_id = media_handle_upload('font_file', $post_id);

				if ($attachment_id > 0 ) 
					add_post_meta( $post_id, 'font_file', $attachment_id);

			}else{

			}
			$url = $this->menu->page_url;
			wp_redirect( esc_url_raw($url ) );
		}

		public function update($post, $post_id){

			$data = [
				'ID' => esc_sql($post['id']),
				'post_type' => 'wc_pd_fonts',
				'post_title' => esc_sql($post['title']),
				'post_content' => esc_sql($post['description']),
			];
			$post_id = wp_update_post( $data, true );

			if( ! is_wp_error( $post_id )){
				require_once(ABSPATH . "wp-admin" . '/includes/image.php');
				require_once(ABSPATH . "wp-admin" . '/includes/file.php');
				require_once(ABSPATH . "wp-admin" . '/includes/media.php');
				
				$old_attachment_id = get_post_meta($post_id, 'font_file', true);
				wp_delete_attachment( $old_attachment_id, true);

				$attachment_id = media_handle_upload('font_file', $post_id);

				if ($attachment_id > 0 ) 
					update_post_meta( $post_id, 'font_file', $attachment_id);

			}else{

			}
			$url = $this->menu->page_url;
			wp_redirect( esc_url_raw($url) );
		}

		public function html($id=""){

			$table = new WC_PD_fonts_list_table([
				'edit_link' => $this->menu->page_url,
				'page_link' => $this->menu->page_url
				]);

			if(isset($_POST['action']) && $_POST['action'] == 'add'){
				$this->save($_POST);
				return;
			}elseif(isset($_POST['action']) && $_POST['action'] == 'edit'){
				$this->update($_POST, esc_sql($_REQUEST['id']));
				return;
			}

			if(isset($_REQUEST['action']) && $_REQUEST['action'] == 'edit'){
				$edit = true;
				$post = get_post(intval($_REQUEST['ID']));
			}

			?>
			<div class="wrap">
				<h2>Fonts</h2>
					<div id="post-body" class="metabox-holder columns-2">
						<div id="col-left">
							<div class="col-wrap">
							<div class="postbox ">
								<h2 class="hndle ui-sortable-handle"><span><?php echo $edit ? "Edit" : "Add New"?> </span></h2>
								<div class="inside">
									<form action=""  enctype="multipart/form-data" method="post">
										<p>
											<label class="field-label full-width" for="title">Name</label>
											<input name="title" value="<?php echo $post->post_title ?>" class="full-width" id="title" type="text">
										</p>
										<p>
											<label class="field-label full-width" for="font_file">Font (.ttf file)</label>
											<input name="font_file" accept=".ttf" class="full-width" id="font_file" type="file">
										</p>
										<p>
											<input name="submit"  name="Submit"value="Submit" class="button button-primery" id="font_file" type="submit">
											<?php if($edit){
												?><input name="submit" value="Cancel" class="button button-primery" onClick="window.location = '<?php echo $this->menu->page_url; ?>'" type="button"><?php 
											} ?>
										</p>
										<input type="hidden" value="<?php echo $edit ? 'edit' : 'add' ?>" name="action">
										<input type="hidden" value="<?php echo $post->ID ?>" name="id">
									</form>
								</div>
							</div>
							</div>
						</div>


						<div id="col-right">
							<div class="col-wrap">
							<div id="post-body-content">
								<div class="meta-box-sortables ui-sortable">
									<form method="post">
										<?php
										$table->display(); ?>
									</form>
								</div>
						
							</div>
						</div>
					</div>
					<br class="clear">
				</div>
			</div>
			<?php
		}

	}
}
return new WC_PD_fonts_page($this);