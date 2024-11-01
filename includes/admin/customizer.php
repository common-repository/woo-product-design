<?php
class WC_PD_Admin_Customizer{
	function __construct(){
		add_filter('woocommerce_admin_order_item_thumbnail', array($this, 'admin_order_item_thumbnail'),11,3);
		add_filter('woocommerce_hidden_order_itemmeta', array($this, 'hidden_order_itemmeta'),11);
		add_action('woocommerce_before_order_itemmeta', array($this, 'before_order_itemmeta'),11,3);
		
		add_action('woocommerce_order_item_add_action_buttons', array($this, 'order_item_add_action_buttons'),11,3);
		
		add_action('wp_ajax_wcpd_generate_xml', array($this, 'generate_xml'),11,3);
		add_action('wp_ajax_nopriv_wcpd_generate_xml', array($this, 'generate_xml'),11,3);
		add_action('wp_ajax_wcpd_generate_pdf', array($this, 'genrate_pdf'),11,3);
		add_action('wp_ajax_nopriv_wcpd_generate_pdf', array($this, 'genrate_pdf'),11,3);
		
		
	}
	function admin_order_item_thumbnail($image, $item_id, $item){
		$item['customize_data'] = maybe_unserialize( $item['customize_data'] );
		if(isset($item['customize_data']) && !empty($item['customize_data']) && $item['main_product'] == true){
			$image = ' <a class="cart-product-view-proof btn btn-tiny" target="_blank" href="'.$item['customize_data']['customize_image'].'"><img class="attachment-thumbnail size-thumbnail wp-post-image" src="'.$item['customize_data']['customize_image'].'"></a>';
		}
		return $image;
	}
	function hidden_order_itemmeta($meta){
		$meta[] = 'main_product';
		$meta[] = 'parent_cart_id';
		$meta[] = 'cart_id';
		return $meta;
	}
	function order_item_add_action_buttons($order){
		global $wcpd;
		?><button type="button" onClick="wcpd_genrate_xml(this)" class="button button-primary generate-xml-action"><?php _e( 'Generate XML', 'woocommerce' ); ?></button>
		
		<button type="button" onClick="wcpd_generate_pdf(this)" class="button button-primary generate-pdf-action"><?php _e( 'Generate PDF', 'woocommerce' ); ?></button>
		<script type="text/javascript" src="<?php echo $wcpd->plugin_url('assets/customizer/js/vendor.js') ?>"></script>
		<script type="text/javascript">

			wp_pc_serialize = function(obj) {
				  var str = [];
				  for(var p in obj)
				    if (obj.hasOwnProperty(p)) {
				      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				    }
				  return str.join("&");
			}
			function callAjax(url, data, callback){
			    var httpRequest = new XMLHttpRequest();
				//xmlDoc.open('POST', url, true);
				//xmlDoc.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				
				httpRequest.onreadystatechange = function() {
				    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				      callback(httpRequest.response, httpRequest);
				    }
				}
			    httpRequest.open('POST', url);
			    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			    httpRequest.send(wp_pc_serialize(data));
			}
			function download(filename, text) {
				
			    var pom = document.createElement('a');
			    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
			    pom.setAttribute('download', filename);
			    if (document.createEvent) {
			        var event = document.createEvent('MouseEvents');
			        event.initEvent('click', true, true);
			        pom.dispatchEvent(event);
			    }
			    else {
			        pom.click();
			    }
			}
			function wcpd_genrate_xml(){
				callAjax('<?php echo admin_url( 'admin-ajax.php' ) ?>', {
						action : 'wcpd_generate_xml',
						order_id : <?php echo $order->id; ?>
					}, function(data){
						var xmltext = data;
						download('order.xml', xmltext)
					}
				);
			}
			function wcpd_generate_pdf(){
				window.location = '<?php echo admin_url( 'admin-ajax.php' ) ?>?action=wcpd_generate_pdf&order_id=<?php echo $order->id; ?>';
				callAjax('<?php echo admin_url( 'admin-ajax.php' ) ?>', {
						action : 'wcpd_generate_pdf',
						order_id : <?php echo $order->id; ?>
					}, function(data){
						return demoFromHTML(data);
						var pdf = new jsPDF();
						pdf.setFontSize(20);
				        pdf.text(30, 30, 'Hello world!');
				        pdf.save('hello_world.pdf');
						//var xmltext = data;
						//download('order.xml', xmltext)
					}
				);
			}
			function demoFromHTML(data) {
			    var pdf = new jsPDF('p', 'pt', 'letter');
			    data = JSON.parse(data);
			    console.log(data);
			    jQuery.each(data, function(index,custome){
			    	pdf.writeText(custome.product.post.post_title, 0, 40 , { align: 'center' });
			    	pdf.setFontSize(11);
			    	pdf.writeText("Order id : "+custome.order.id+", Order Date : "+custome.order.order_date, 0, 65 , { align: 'center' });
			    	pdf.setFontSize(11);
			    	pdf.writeText('Note: all imprinting is in black.', 0, 80 , { align: 'center' });
			    	extension = get_image_type(custome.customize_data.customize_image_data);
			    	pdf.addImage(custome.customize_data.customize_image_data, extension, 15, 40);
			    })
			    
			    pdf.save('Test.pdf');
			
			}
			function get_image_type(decoded){
				var lowerCase = decoded.toLowerCase();
				if (lowerCase.indexOf("png") !== -1) 
					extension = "png";
				else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
				    extension = "JPEG";
				console.log(extension);
				return extension;
			}
			/*centeredText = function(text, y) {
			    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
			    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
			    doc.text(textOffset, y, text);
			}
			*/
			(function (api, $) {
				'use strict';
				api.writeText = function (text, x, y, options) {
				    options = options || {};
				    var defaults = {
				        align: 'left',
				        width: this.internal.pageSize.width
				    }
				    var settings = $.extend({}, defaults, options);
				    var fontSize = this.internal.getFontSize();
				    var txtWidth = this.getStringUnitWidth(text) * fontSize / this.internal.scaleFactor;
				    if (settings.align === 'center')
				        x += (settings.width - txtWidth) / 2;
				    else if (settings.align === 'right')
				        x += (settings.width - txtWidth);
				    //default is 'left' alignment
				    this.text(text, x, y);
				}
			})(jsPDF.API, jQuery);
		</script>
		<?php
	}
	function get_image_data($path){
		$url = site_url();
		$home_path = get_home_path();
		if(strpos($path, $url) !== false){
			$img = str_replace($url, '', $path);
			$path = trailingslashit($home_path).$img;
		}
		$type = pathinfo($path, PATHINFO_EXTENSION);
		$data = file_get_contents($path);
		$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
		return $base64;
	}
	function genrate_pdf(){
		$path = WC_PD()->plugin_path('domPDF/autoload.php');
		include_once($path);
		// reference the Dompdf namespace
		$order_id = intval($_REQUEST['order_id']);
		$order = new WC_Order( $order_id );
		$order_item = $order->get_items();
		$customer = new WC_Customer( $order_id );
		$main_products = [];
		foreach( $order->get_items() as $order_item ) {
			if ($product_variation_id) { 
			    $product = new WC_Product($order_item['variation_id']);
			} else {
			    $product = new WC_Product($order_item['product_id']);
			}
			if(isset($order_item['customize_data'])){
				$customize_data = maybe_unserialize($order_item['customize_data']);
				$customize_data = json_decode(json_encode($customize_data));
				$messages = [];
				$images = [];
				$color = "";
				foreach ($customize_data->customize_data->fields as $key => $fields) {
					
					if($fields->type == "img" || $fields->object == "image"){
						if(strtolower($fields->layer_data->title) == strtolower('Color')){
							$color = $fields->layer_data->filters[0]->color;
						}
						$fields->image_data = $this->get_image_data($fields->layer_data->src);
						
    					
						if(!isset($fields->title) || empty($fields->title)|| $fields->type == 'clipArts'){
							$images[] = $customize_data->customize_data->fields[$key];
							
						}


						$customize_data->customize_data->fields[$key] =  $fields;
					}
					if($fields->type == "text"){
						$messages[] = $fields->layer_data->text;
					}
				}
				$customize_data->customize_image_data =  $this->get_image_data($customize_data->customize_image);
				
				$main_products[] = array(
					'order' => $order,
					'product' => $product,
					'order_item' => $order_item,
					'customize_data' => $customize_data,
					'messages' => $messages,
					'images' => $images,
					'color' => $color,
					'cart_id' => $order_item['cart_id']

				);
			}
    	}
    	ob_start();
    	//print_r($main_products);
    	?>
		<!-- <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"> -->
		<!DOCTYPE html>
		<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
			<head>
			</head>
			<body>

	    	<?php 

	    	foreach($main_products as $key => $custome) {
	    	
	    	 ?>
	    		
	    		<center>
	    			<h2><?php echo $custome['product']->post->post_title ?></h2>
	    			<p><?php echo "Order id : ".$custome['order']->id.", Order Date : ".$custome['order']->order_date ?></p>
	    			<p>Note: all imprinting is in black.</p>
				</center>
				
				<h2>Design</h2>
    	
	    		<img style="max-width:100%;width:100%;" src="<?php echo $custome['customize_data']->customize_image_data; ?>"> 
	
	    		<h2>Styles/Colours & Qty's Ordered</h2>
				<?php if(isset($color)){ ?>
					<h3>Color</h3>
					<!-- <p><span style="background: <?php echo $color ?>; display: table; height: 40px; line-height: 40px; padding: 0px 10px;"><?php echo $color ?></span></p> -->

					<?php  foreach( $order->get_items()as $order_item ) { ?>
						<?php
						 if(isset($order_item['parent_cart_id']) && ($order_item['parent_cart_id'] == $custome['cart_id'])){ ?>
							<p><span style="background-color: <?php echo $order_item['color'] ?>; padding: 5px 10px;"><?php echo $order_item['color'] ?> &nbsp; X &nbsp; <?php echo $order_item['qty'] ?></span></p>
						<?php } ?>
					<?php } ?>
					<!-- <br> -->
				<?php  } ?>
				<?php if(!empty($images)){ ?>
					<h3>Images</h3>
		    		<?php 
		    			foreach ($images as $key => $value) {
		    				echo '<p style="max-width:150px;"><img style="max-width:100%;width:100%;" src="'.$value->image_data.'"></p>';
		    			}
		    		?>
					<br>
				<?php  } ?>
				<?php if(!empty($messages)){ ?>
					<h3>Text</h3>
		    		<?php 
		    			foreach ($messages as $key => $value) {
		    				echo "<p>Text - ".($key + 1)." : $value</p>";
		    			}
		    		?>
	    		<?php  } ?>
	    	<?php } ?>
	    	<script type="text/php">
		        if ( isset($pdf) ) {
		            $font = Font_Metrics::get_font("verdana");;
		            $size = 6;
		            $color = array(0,0,0);
		            $text_height = Font_Metrics::get_font_height($font, $size);
		            $foot = $pdf->open_object();
		            
		            $w = $pdf->get_width();
		            $h = $pdf->get_height();
		            // Draw a line along the bottom
		            $y = $h - 2 * $text_height - 24;
		            $pdf->line(16, $y, $w - 16, $y, $color, 1);
		            $y += $text_height;
		            $text = "Job: 132-003";
		            $pdf->text(16, $y, $text, $font, $size, $color);
		            $pdf->close_object();
		            $pdf->add_object($foot, "all");
		            global $initials;
		            $initials = $pdf->open_object();
		            
		            // Add an initals box
		            $text = "Initials:";
		            $width = Font_Metrics::get_text_width($text, $font, $size);
		            $pdf->text($w - 16 - $width - 38, $y, $text, $font, $size, $color);
		            $pdf->rectangle($w - 16 - 36, $y - 2, 36, $text_height + 4, array(0.5,0.5,0.5), 0.5);
		              
		            $pdf->close_object();
		            $pdf->add_object($initials);
		           
		            // Mark the document as a duplicate
		            $pdf->text(110, $h - 240, "DUPLICATE", Font_Metrics::get_font("verdana", "bold"),
		                       110, array(0.85, 0.85, 0.85), 0, -52);
		            $text = "Page {PAGE_NUM} of {PAGE_COUNT}";  
		            // Center the text
		            $width = Font_Metrics::get_text_width("Page 1 of 2", $font, $size);
		            $pdf->page_text($w / 2 - $width / 2, $y, $text, $font, $size, $color);
		        }
		    </script>
		</body>
		</html>
	    <?php
    	$data = ob_get_clean();
		$this->save( $data, 'Order - '.$order->id);
		//$dompdf->setPaper('A4', 'landscape');
		//$dompdf->render();
		//$dompdf->stream();
    	/*
    	pdf.writeText(custome.product.post.post_title, 0, 40 , { align: 'center' });
			    	pdf.setFontSize(11);
			    	pdf.writeText("Order id : "+custome.order.id+", Order Date : "+custome.order.order_date, 0, 65 , { align: 'center' });
			    	pdf.setFontSize(11);
			    	pdf.writeText('Note: all imprinting is in black.', 0, 80 , { align: 'center' });
			    	extension = get_image_type(custome.customize_data.customize_image_data);
			    	pdf.addImage(custome.customize_data.customize_image_data, extension, 15, 40);*/
    	//echo json_encode($main_products);
		
	}
	public function save($data, $file = ""){


	 	$dir = wp_pd_content_dir();
		$targetPath = $dir."pdf/";
		_wcpc_createPath($targetPath);
	 	$default_config = array(
    		'tempDir' 				=>$targetPath,
    		//'fontDir' 			=> 'assets/bernard-mt-condensed/',
    		//'fontCache' 			=> '',
    		//'chroot' 				=> '',
    		'logOutputFile' 		=> '', //log_output_file
    		'defaultMediaType' 		=> 'screen',  // default_media_type
    		'defaultPaperSize' 		=> 'letter', //default_paper_size
    		'defaultFont' 			=> 'serif',  //default_font
    		'dpi'					=> 96,
			'fontHeightRatio'		=> 1.1,
			'isPhpEnabled'			=> true,
			'isRemoteEnabled'		=> true,
			'isJavascriptEnabled'	=> true,
			'isHtml5ParserEnabled'	=> true,
			'isFontSubsettingEnabled'=> false,
			'debugPng'				=> true,
			'debugKeepTemp'			=> false,
			'debugCss'				=> false,
			'debugLayout'			=> false,
			'debugLayoutLines'		=> true,
			'debugLayoutBlocks'		=> true,
			'debugLayoutInline'		=> true,
			'debugLayoutPaddingBox'	=> true,
			'pdfBackend'			=> 'CPDF',
			'pdflibLicense'			=> '',
			'adminUsername'			=> 'user',
			'adminPassword'			=> 'password',
    		);
    	if(!empty($config)){
    		$options = new Dompdf\Options();
    		
    		foreach ($config as $key => $value) {
    			$options->set($key, $value);
    		}
    	}
    	$dompdf = new Dompdf\Dompdf($options);


    	$data = mb_convert_encoding($data, 'HTML-ENTITIES', 'UTF-8');
		$dompdf->loadHtml($data);


 		$dompdf->render();
        /*if(!empty($file)){
        	$dir = wp_pd_content_dir();
			$targetPath = $dir."pdf/";
			_wcpc_createPath($targetPath);
            file_put_contents(trailingslashit($targetPath).$file.'.pdf',$dompdf->output());
        }*/
		$dompdf->stream($file);
	} 
	function generate_xml(){
		$xml = new SimpleXMLElement('<xml/>');
		$order_id = intval($_REQUEST['order_id']);
		$order = new WC_Order( $order_id );
		$order_item = $order->get_items();
		$customer = new WC_Customer( $order_id );
		if ( WC()->payment_gateways() ) {
			$payment_gateways = WC()->payment_gateways->payment_gateways();
		} else {
			$payment_gateways = array();
		}
		ob_start();
		$payment_method = ! empty( $order->payment_method ) ? $order->payment_method : '';
		if ( $payment_method ) {
			printf( __( 'Payment via %s', 'woocommerce' ), ( isset( $payment_gateways[ $payment_method ] ) ? esc_html( $payment_gateways[ $payment_method ]->get_title() ) : esc_html( $payment_method ) ) );
			if ( $transaction_id = $order->get_transaction_id() ) {
				echo ' (' . esc_html( $transaction_id ) . ')';
			}
			if ( $order->paid_date ) {
				printf( ' ' . _x( 'on %s @ %s', 'on date at time', 'woocommerce' ), date_i18n( get_option( 'date_format' ), strtotime( $order->paid_date ) ), date_i18n( get_option( 'time_format' ), strtotime( $order->paid_date ) ) );
			}
			echo '. ';
		}
		if ( $ip_address = get_post_meta( $post->ID, '_customer_ip_address', true ) ) {
			echo ' Customer IP: ' . esc_html( $ip_address );
		}
		$transaction = ob_get_clean();
	
		//print_r($customer);
		//print_r($order);
		//print_r( $payment_gateway);
		//exit();
		$args = array(
		        'post_id' => $order_id,
		        'status'  => 'approve',
		        'type'    => 'order_note'
		    );
		$comments = $order->get_customer_order_notes();
		$notes = get_comments( $args );
	
		$xOrder = $xml->addChild('SubmitPO');
			$xOrder->addChild('SubmitRefID',$order->id ); 
			$xCustomer = $xOrder->addChild('Customer');
				$xCustomer->addChild('Name', $customer->name);
				$xCustomerAddress = $xCustomer->addChild('Address');
					$xCustomerAddress->addChild('StreetAddress', $customer->address_1);
					if(isset($customer->suburb)){
						$xCustomerAddress->addChild('Suburb', $customer->suburb);
					}else if(isset($customer->address_2)){
						$xCustomerAddress->addChild('Suburb', $customer->address_2);
					}else if(isset($customer->city)){
						$xCustomerAddress->addChild('Suburb', $customer->city);
					}else{
						$xCustomerAddress->addChild('Suburb', "");
					}
					$xCustomerAddress->addChild('State', $customer->state);
					$xCustomerAddress->addChild('PostCode', $customer->postcode);
					$xCustomerAddress->addChild('Country', $customer->country);
				$xCustomerDeliveryAddress = $xCustomer->addChild('DeliveryAddress');
				$xCustomerDeliveryAddress = $xCustomer->addChild('DeliveryAddress');
					$xCustomerDeliveryAddress->addChild('StreetAddress', $customer->shipping_address_1);
					if(isset($customer->shipping_suburb)){
						$xCustomerDeliveryAddress->addChild('Suburb', $customer->shipping_suburb);
					}else if(isset($customer->shipping_address_2)){
						$xCustomerDeliveryAddress->addChild('Suburb', $customer->shipping_address_2);
					}else if(isset($customer->shipping_city)){
						$xCustomerDeliveryAddress->addChild('Suburb', $customer->shipping_city);
					}else{
						$xCustomerAddress->addChild('Suburb', "");
					}
					$xCustomerDeliveryAddress->addChild('State', $customer->shipping_state);
					$xCustomerDeliveryAddress->addChild('PostCode', $customer->shipping_postcode);
					$xCustomerDeliveryAddress->addChild('Country', $customer->shipping_country);
				$xCustomerContact = $xCustomer->addChild('Contact');
					$xCustomerContact->addChild('FirstName', $order->billing_first_name);
					$xCustomerContact->addChild('LastName', $order->billing_last_name);
					
					$xCustomerContactPhone = $xCustomerContact->addChild('attribute', $order->billing_phone);
					$xCustomerContactPhone->addAttribute('name','Phone');
					
					$xCustomerContactEmail = $xCustomerContact->addChild('attribute', $order->billing_email);
					$xCustomerContactEmail->addAttribute('name','Email');
			$xOrder->addChild('ItemCode', 'WEB.ORDER');
			$xOrder->addChild('ItemDescription', 'wizid.com.au website');
			$xOrder->addChild('CustomerRef',  $order->id);
			$xOrder->addChild('Status', $order->get_status());
				
				$xComments = $xOrder->addChild('Comments');
					$xComments->addChild('Comment',$order->customer_note );
					/*foreach( $order->customer_note as $note ) {
			            $xComments->addChild('Comment',  $note );
			        }*/
		    	$xStockList = $xOrder->addChild('StockList');
		    	foreach( $order->get_items() as $order_item ) {
		    		$xStockItem = $xStockList->addChild('StockItem');
						$product_qty = $order_item['qty'];
						$product_variation_id = $order_item['variation_id'];
						$product_price = $order_item['line_total'] / $order_item['qty'];
						if(isset($order_item['pack-count']) && !empty($order_item['pack-count'])){
							$product_price = ($product_price / $order_item['pack-count']);
							$product_qty = ($product_qty * $order_item['pack-count']);
						}
		    			if ($product_variation_id) { 
						    $product = new WC_Product($order_item['variation_id']);
						} else {
						    $product = new WC_Product($order_item['product_id']);
						}
						$sku = $product->get_sku();
			    		$xStockItem->addChild('StockCode', $sku);
			    		$xStockItem->addChild('UnitPrice', $product_price);
			    		$xStockItem->addChild('Quantity', $product_qty);
			    		$xStockItem->addChild('Unit', 'EACH');
		    	}
			$payment_gateway = wc_get_payment_gateway_by_order( $order );	    	
			$xPayments = $xOrder->addChild('Payments');
				$xPayment = $xPayments->addChild('Payment');
					$xPayment->addChild('PaymentType', 'Prepayment');
					$xPayment->addChild('PaymentBy', $payment_gateway->method_title);
					$xPayment->addChild('Date', $order->order_date);
					if(isset($order->GLAccount))
						$xPayment->addChild('GLAccount', $order->GLAccount);
					$xPayment->addChild('Amount', $order->get_total()); //$order->total
					//$comments = "Payment Tokens: ".$order->get_payment_tokens();
					$xPayment->addChild('Comment', $transaction);
		
		//Header('Content-type: text/xml');
		
		print($xml->asXML());
		exit;
	}
	function before_order_itemmeta($item_id, $item, $_product ){
		$item['customize_data'] = maybe_unserialize( $item['customize_data'] );
		if(isset($item['customize_data']) && !empty($item['customize_data']) && ($item['main_product'] == true || !empty($item['parent_cart_id']))){
			echo $link = ' <a class="cart-product-view-proof btn btn-tiny" target="_blank" href="'.$item['customize_data']['customize_image'].'">View Proof</a>';
		}
	}
}
return new WC_PD_Admin_Customizer();