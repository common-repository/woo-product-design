<?php
if(!class_exists('WC_PD_product_desing_page')){
	class WC_PD_product_desing_page extends MenuPage{
		function __construct(){
			add_action('admin_init', array($this,'settings_init'));

		}

		function settings_init()
		{
		    register_setting('wcpd', 'wcpd_color_description');
		    register_setting('wcpd', 'wcpd_review_description');
		    register_setting('wcpd', 'wcpd_review_terms');
		    register_setting('wcpd', 'wcpd_review_button');

		    add_settings_section(
		        'wcpd_section_color',
		        __('Select Color', 'wcpd'),
		        array($this,'wcpd_section_developers_cb'),
		        'wcpd'
		    );
		    add_settings_field(
		        'wcpd_color_description',
		        __('Description for Color', 'wcpd'),
		        array($this,'color_description'),
		        'wcpd',
		        'wcpd_section_color',
		        [
		            'label_for'         => 'wcpd_color_description',
		            'class'             => 'wcpd_color_description',
		        ]
		    );

		    add_settings_section(
		        'wcpd_section_review',
		        __('Review Order', 'wcpd'),
		        array($this,'wcpd_section_developers_cb'),
		        'wcpd'
		    );
		    add_settings_field(
		        'wcpd_review_description',
		        __('Description for Review', 'wcpd'),
		        array($this,'review_description'),
		        'wcpd',
		        'wcpd_section_review',
		        [
		            'label_for'         => 'wcpd_review_description',
		            'class'             => 'wcpd_review_description',
		        ]
		    );

		    add_settings_field(
		        'wcpd_review_terms',
		        __('Review terms label', 'wcpd'),
		        array($this,'review_terms'),
		        'wcpd',
		        'wcpd_section_review',
		        [
		            'label_for'         => 'wcpd_review_terms',
		            'class'             => 'wcpd_review_terms',
		        ]
		    );

		    add_settings_field(
		        'wcpd_review_button',
		        __('Review button label', 'wcpd'),
		        array($this,'review_button'),
		        'wcpd',
		        'wcpd_section_review',
		        [
		            'label_for'         => 'wcpd_review_button',
		            'class'             => 'wcpd_review_button',
		        ]
		    );
		}

		function wcpd_section_developers_cb($args)
		{
		    ?>
		    <!-- <p id="<?= esc_attr($args['id']); ?>"><?= esc_html__('Follow the white rabbit.', 'wcpd'); ?></p> -->
		    <?php
		}

		function color_description($args) {
		    $wcpd_color_description = get_option( 'wcpd_color_description' );
		    echo wp_editor( $wcpd_color_description, 'wcpd_color_description', array('textarea_name' => 'wcpd_color_description')  );
		}

		
		function review_description($args) {
		    $wcpd_review_description = get_option( 'wcpd_review_description' );
		    echo wp_editor( $wcpd_review_description, 'wcpd_review_description', array('textarea_name' => 'wcpd_review_description')  );
		}

		function review_button($args) {
			$wcpd_review_button = get_option( 'wcpd_review_button' );
		    ?>
		    <input type="text" name="<?= esc_attr($args['label_for']); ?>" value="<?php echo $wcpd_review_button ?>">
		    <?php
		}

		
		function review_terms($args) {
			$wcpd_review_terms = get_option( 'wcpd_review_terms' );
		    ?>
		    <input type="text" name="<?= esc_attr($args['label_for']); ?>" value="<?php echo $wcpd_review_terms ?>">
		    <?php
		}

		
		 

		
		public function html(){
			// check user capabilities
		    if (!current_user_can('manage_options')) {
		        return;
		    }
		 
		    // add error/update messages
		 
		    // check if the user have submitted the settings
		    // wordpress will add the "settings-updated" $_GET parameter to the url
		    if (isset($_GET['settings-updated'])) {
		        // add settings saved message with the class of "updated"
		        add_settings_error('wcpd_messages', 'wcpd_message', __('Settings Saved', 'wcpd'), 'updated');
		    }
		 
		    // show error/update messages
		    settings_errors('wcpd_messages');
		    ?>
		    <div class="wrap">
		        <h1><?= esc_html(get_admin_page_title()); ?></h1>
		        <form action="options.php" method="post">
		            <?php
		            // output security fields for the registered setting "wcpd"
		            settings_fields('wcpd');
		            // output setting sections and their fields
		            // (sections are registered for "wcpd", each field is registered to a specific section)
		            do_settings_sections('wcpd');
		            // output save settings button
		            submit_button('Save Settings');
		            ?>
		        </form>
		    </div>
		    <?php
		}
	}
}

return new WC_PD_product_desing_page();