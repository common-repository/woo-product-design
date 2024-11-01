<?php
/**
 * WC Dependency Checker
 *
 * Checks if WooCommerce is enabled
 */
if(!class_exists('WC_PD_List_Table')){
	if(!class_exists('WP_List_Table')){
		require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
	}

	class WC_PD_List_Table extends WP_List_Table{


		protected $table = 'posts';
		protected $primery_key = 'ID';
		protected $name_key = 'post_title';
		protected $key = 'posts';

		protected $data = [];
		protected $custom_column = [];
		protected $columns = [];
		protected $sortable = [];
		protected $hidden = [];
		protected $where = [];
		protected $record_count = 0;
		
		protected $config;
		
		protected $label = [
				'singular' => 'Customer',
				'plural'   => 'Customers',
				];
	
		function __construct($config = []) {

			$default = [
				'singular'	=> 'Customer',
				'plural'	=> 'Customers',
				'ajax'		=> false,
				'limit'		=> 20,
				'edit_link'	=> '',
				'page_link'		=> '',
			];


			$this->config = array_merge($default, $config);

			parent::__construct( [
				'singular' => $this->config['singular'],
				'plural'   => $this->config['plural'], 
				'ajax'     => $this->config['ajax']
			] );

			if(!empty($this->table)){
				$this->set_query_data();
			}
	    }

	    public function screen_option(){
			$option = 'per_page';
			$args   = [
				'label'   => $label['singular'],
				'default' => 20,
				'option'  => $table.'_per_page'
			];
			add_screen_option($option, $args);
		}
		function set_query_data(){
			$this->data = $this->get_db_data($this->config['limit']);
			$this->set_pagination_args([
				'total_items' => $this->record_count(),  
				'per_page'    => $this->config['limit']
			]);
		}
		function prepare_items() {
		  	$columns = $this->get_columns();
		  	$hidden = $this->hidden;
		  	$sortable = $this->sortable;
			$this->process_bulk_action();
			$this->_column_headers = array($columns, $hidden, $sortable);
			$this->items = $this->data;
		}

		function column_cb($item) {
	        return sprintf(
	            '<input type="checkbox" name="'.$this->primery_key.'[]" value="%s" />', $item[$this->primery_key]
	        );    
	    }

	    function column_action( $item ) {
			$delete_nonce = wp_create_nonce( 'delete_'.$key );
			$title = '<strong>' . $item[$this->name_key] . '</strong>';
			$actions = [
				'delete' => sprintf('<a href="?page=%s&action=%s&'.$this->primery_key.'=%s&_wpnonce=%s">Delete</a>', esc_attr( $_REQUEST['page'] ), 'delete', absint( $item[$this->primery_key] ), $delete_nonce ),
				'edit' => sprintf('<a href="?page=%s&action=%s&'.$this->primery_key.'=%s&_wpnonce=%s">Edit</a>', esc_attr( $_REQUEST['page'] ), 'edit', absint( $item[$this->primery_key] ), $delete_nonce )
			];
			return $title . $this->row_actions( $actions );
		}

		function column_default( $item, $column_name ) {
			switch (true) {
				
				case isset($this->custom_column[$column_name]):
					$function = $this->custom_column[$column_name];
					if(is_callable($function)){
						return call_user_func($function, $item);
		    		}else{
		    			return $function;
		    		}
					break;

				case ($column_name == 'cb'):
					return $this->column_cb($item);
					break;

				case ($column_name == $this->name_key):
					return $this->column_action($item);
					break;

				case isset($item[$column_name]) :
					return $item[ $column_name ];
					break;
				
				default:
					return '-';
					break;
			}
		}

	    function get_columns() {
			$columns = [
				'cb'      => '<input type="checkbox" />',
			];
			$columns = array_merge($columns, $this->columns);

			return $columns;
		}
		function get_sortable_columns() {
	        return $this->sortable;
	    }

		function get_bulk_actions() {
		  $actions = array(
		    'bulk-delete'    => 'Delete'
		  );
		  return $actions;
		}

	    function display(){
	    	$this->prepare_items();
	    	parent::display();
	    }

		public function get_db_data( $per_page = 20) {
			global $wpdb;
			$where = "";
			
			$page_number = $this->get_pagenum();


			if(!empty($this->where)){
				$where = " WHERE ".implode(' AND ', $this->where);
			}

			$sql = "SELECT * FROM {$wpdb->prefix}{$this->table}".$where;
			
			if ( ! empty( esc_sql($_REQUEST['orderby']) ) ) {
				$sql .= ' ORDER BY ' . esc_sql( $_REQUEST['orderby'] );
				$sql .= ! empty( esc_sql($_REQUEST['order']) ) ? ' ' . esc_sql( $_REQUEST['order'] ) : ' ASC';
			}


			$start = ( $page_number - 1 ) * $per_page;
			$start = $start > 0 ? $start : 0;
			$sql .= " LIMIT ".$start;
			$sql .= ' , ' . $per_page;

			$result = $wpdb->get_results( $sql, 'ARRAY_A' );
			return $result;
		}
		public function record_count() {
			global $wpdb;
			if(!empty($this->where)){
				$where = " WHERE ".implode(' AND ', $this->where);
			}
			$sql = "SELECT COUNT(*) FROM {$wpdb->prefix}{$this->table}".$where;
			return $wpdb->get_var( $sql );
		}

		public function delete_data( $id ) {
			global $wpdb;
			$wpdb->delete(
				"{$wpdb->prefix}{$this->table}",
				[ $this->primery_key => $id ],
				[ '%d' ]
			);
		}
		


	    function setColumn($columns){
	    	$this->columns = $columns;
	    	foreach ($this->columns as $key => $value) {
	    		$this->addColumn($key, $value);
	    	}

	    	return $this;
	    }
	    function addColumn($key, $value){
	    	if(is_array($value)){
	    		if(isset($value['sortable']) && $value['sortable'] == true){
	    			$this->addSortable($key);
	    		}

	    		if(isset($value['label']) && $value['label'] == true){
	    			$label = $value['label'];
	    		}else{
	    			$label = $key;
	    		}

	    		if(isset($value['value'])){
	    			$this->custom_column[$key] = $value['value'];
	    		}

	    		//$this->addColumn($key, $label);
	    		$this->columns[$key] = $label;
	    	}else{

	    		//$this->addColumn($key, $value);

	    		$this->columns[$key] = $value;
	    	}
	    	return $this;
	    }

	    function setHidden($hidden){
	    	$this->hidden = $hidden;
	    	return $this;
	    }
	    function addHidden($hidden){
	    	$this->hidden[] = $hidden;
	    	return $this;
	    }

	    function setSortable($sortable){
	    	$this->sortable = $sortable;
	    	return $this;
	    }
	    function addSortable($sortable, $status = true){
	    	$this->sortable[$sortable] = [$sortable, $status];
	    	return $this;
	    }

	    function where($where = ""){
	    	if(!empty($where)){
	    		$this->where[] = wp_pd_array_to_where_str($where);
	    	}

	    	return $this;
	    }

	    public function process_bulk_action() {
			if ( 'delete' === $this->current_action() ) {
				$nonce = esc_attr( $_REQUEST['_wpnonce'] );


				$url = add_query_arg();
				$url = remove_query_arg('_wpnonce', $url );
				$url = remove_query_arg('action', $url );
				$url = remove_query_arg($this->primery_key, $url);

				if ( ! wp_verify_nonce( $nonce, 'delete_'.$key ) ) {
					die( 'Go get a life script kiddies' );
				}else{
					$this->delete_data( absint( $_GET[$this->primery_key] ) );
			        wp_redirect( esc_url_raw($url ) );
					exit;
				}

			}

			if ( ( isset( $_POST['action'] ) && $_POST['action'] == 'bulk-delete' )
			     || ( isset( $_POST['action2'] ) && $_POST['action2'] == 'bulk-delete' )
			) {


				$delete_ids = esc_sql( $_POST[$this->primery_key] );
				foreach ( $delete_ids as $id ) {
					$this->delete_data( $id );
				}
				$url = add_query_arg();
				$url = remove_query_arg('_wpnonce', $url );
				$url = remove_query_arg('action', $url );
				$url = remove_query_arg($this->primery_key, $url );

			    wp_redirect( esc_url_raw($url) );
				exit;
			}
		}


	}
}

//return new WC_PD_List_Table();