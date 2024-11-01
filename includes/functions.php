<?php
function wp_pd_array_to_where_str($ary){ 
	if(is_array($ary) && isset($ary['key'])){ 
		$compare = isset($ary['compare']) ? $ary['compare'] : '='; 

		if(!isset($ary['datatype'])){
			if(is_string($ary['value'])){
				$ary['datatype'] = "string";
			}else{
				$ary['datatype'] = "";
			}
		}

		switch ($ary['datatype']) {
			case 'date':

				$ary['key'] = "STR_TO_DATE({$ary['key']}, '%Y-%m-%d')"; 

				if(is_string($ary['value'])) 
				   	$ary['value'] = "STR_TO_DATE('{$ary['value']}', '%Y-%m-%d')"; 
				else if(is_array($ary['value'])){ 
					$compare = isset($ary['compare']) ? $ary['compare'] : 'IN'; 
					foreach ($ary[$key] as $key => $value) {
						$ary['value'][$key] = "STR_TO_DATE('{$value}', '%Y-%m-%d')";
					}
					$ary['value'] = "('".implode("','", $ary['value'])."')";
				}
				break;

			case 'datetime':

				$ary['key'] = "STR_TO_DATE({$ary['key']}, '%Y-%m-%d %H:%i:%s')"; 

				if(is_string($ary['value'])) 
				   	$ary['value'] = "STR_TO_DATE('{$ary['value']}', '%Y-%m-%d %H:%i:%s')"; 
				else if(is_array($ary['value'])){ 
					$compare = isset($ary['compare']) ? $ary['compare'] : 'IN'; 
					foreach ($ary[$key] as $key => $value) {
						$ary['value'][$key] = "STR_TO_DATE('{$value}', '%Y-%m-%d %H:%i:%s')";
					}
					$ary['value'] = "('".implode("','", $ary['value'])."')";
				}
				break;

			case 'time':
				$ary['key'] = "STR_TO_DATE({$ary['key']},'%H:%i:%s')"; 

				if(is_string($ary['value'])) 
				   	$ary['value'] = "STR_TO_DATE('{$ary['value']}', '%H:%i:%s')"; 
				else if(is_array($ary['value'])){ 
					$compare = isset($ary['compare']) ? $ary['compare'] : 'IN'; 
					foreach ($ary[$key] as $key => $value) {
						$ary['value'][$key] = "STR_TO_DATE('{$value}', '%H:%i:%s')";
					}
					$ary['value'] = "('".implode("','", $ary['value'])."')";
				}
				break;

			case 'number':
				$ary['key'] = "CAST({$ary['key']}, decimal)";
				if(is_string($ary['value'])) 
				   	$ary['value'] = "CAST('{$ary['value']}', decimal)"; 
				else if(is_array($ary['value'])){ 
					$compare = isset($ary['compare']) ? $ary['compare'] : 'IN'; 
					foreach ($ary[$key] as $key => $value) {
						$ary['value'][$key] = "CAST('{$value}', decimal)";
					}
					$ary['value'] = "('".implode("','", $ary['value'])."')";
				}
				break;

			case 'string':
				$ary['value'] = "'".$ary['value']."'";
				break;
			
			default:
				$ary['value'] = $ary['value'];
				break;
		}

		return $ary['key']." ".$compare." ".$ary['value']; 
	}else{ 
	  	$condition = isset($ary['where']) ? $ary['where'] : 'AND'; 
	  	if(isset($ary['where']))
	  		unset($ary['where']); 
	  	$where_ary=array(); 
	  	foreach ($ary as $key => $value) { 
	       	if(is_array($value)){ 
	            $where_ary[] = wp_pd_array_to_where_str($value);           
	       	}
	  	} 
	  	return "(".implode(" ".$condition." ", $where_ary).")"; 
	} 
}


function wp_pd_customize_link($product =""){
	if(empty($product))
		$product = get_the_id();

    if ( $link = get_post_permalink($product) ) {
        $link = str_replace( home_url( '/' ), '', $link );
        $link = "customize/".$link;
       	return home_url( $link );
    }
    return false;
}



function wp_pd_content_dir($return = 'path') {
    $upload = wp_upload_dir();
    if($return == 'path'){
	    $upload_dir = $upload['basedir'];
	    $upload_dir = $upload_dir . '/wcpc/';
	    _wcpc_createPath($upload_dir);
	    return $upload_dir;
	}else{
		$upload_url = $upload['baseurl'];
	    $upload_url = $upload_url . '/wcpc/';
	    return $upload_url;
	}
}

function wcpd_content_url() {
    $upload = wp_upload_dir();
    
}

function _wcpc_createPath($path) {
  if (is_dir($path)) return true;
  $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
  $return = _wcpc_createPath($prev_path);
  if(!is_writable($prev_path)){
    chmod($prev_path, 0777);
  }
  return ($return && is_writable($prev_path)) ? mkdir($path, 0777, true) : false;


}

add_action('wp_ajax_pc_added_uploaded_image','pc_added_uploaded_image'); 
add_action('wp_ajax_nopriv_pc_added_uploaded_image','pc_added_uploaded_image'); 

add_action('wp_ajax_pc_remove_uploaded_image','pc_remove_uploaded_image'); 
add_action('wp_ajax_nopriv_pc_remove_uploaded_image','pc_remove_uploaded_image'); 

add_action('wp_ajax_pc_upload_image','pc_upload_image'); 
add_action('wp_ajax_nopriv_pc_upload_image','pc_upload_image'); 

add_action('wp_ajax_ajax_upload_image_base64','wp_pd_upload_image_base64'); 
add_action('wp_ajax_nopriv_ajax_upload_image_base64','wp_pd_upload_image_base64'); 

function pc_added_uploaded_image(){
	$dir = wp_pd_content_dir();
	$targetPath = $dir."images/temp_images/";
	$copyPath = $dir."images/uploaded_images/";
	
	_wcpc_createPath($targetPath);
	_wcpc_createPath($copyPath);

	$url = wp_pd_content_dir('url');
	$targetUrl = $url."images/temp_images/";
	$copyUrl = $url."images/uploaded_images/";
	
	$post = $_POST;


	if(isset($post['action']) && $post['action'] == 'pc_added_uploaded_image'){
		if(file_exists($post["file"]['path'])){
			$filename = pathinfo($post["file"]['path']);
			$filename = $filename['basename'];
			if(copy($post["file"]['path'], $copyPath.$filename)){
				unlink($post["file"]['path']);

				$success['message'] = "Image Uploaded Successfully";
				$success['url'] = $copyUrl.$filename;
				$success['path'] = $copyPath.$filename;
				$success['status'] = 'success';
				echo json_encode($success);
				exit();
			}else{
				$erorr = "File is not moved. Please try again.";
			}
		}else{
			$erorr = "File not found.";
		}
		
		if($error){
			echo json_encode(array('status'=>'error','message' => $error));
			exit();
		}
	}
	exit();
}

function pc_remove_uploaded_image(){
	$post = $_POST;
	if(isset($post['action']) && $post['action'] == 'pc_remove_uploaded_image'){
		if (isset($post["file"])) {
			if(file_exists($post["file"]['path'])){
				unlink($post["file"]['path']);
			}
			$success['status'] = 'success';
			echo json_encode($success);
			exit();
		}else{
			echo json_encode(array('status'=>'error','message' => "File not found."));
			exit();
		}
	}
}

function pc_upload_image(){
	$dir = wp_pd_content_dir();
	$targetPath = $dir."images/temp_images/";
	$copyPath = $dir."images/uploaded_images/";
	
	_wcpc_createPath($targetPath);
	_wcpc_createPath($copyPath);

	$url = wp_pd_content_dir('url');
	$targetUrl = $url."images/temp_images/";
	$copyUrl = $url."images/uploaded_images/";
	
	$post = $_POST;

	if(isset($post['action']) && $post['action'] == 'pc_upload_image'){
		$error = false;
		$file = $_FILES['image'];
		if (isset($file["type"])) {
			$validextensions = array("jpeg", "jpg", "png");
			$temporary = explode(".", $file["name"]);
			$file_extension = end($temporary);

			$file_types = array("image/png", "image/jpg", "image/jpeg");

			if ( in_array($file["type"], $file_types) && ($file["size"] < (5*1024*1024)) && in_array($file_extension, $validextensions)) {
					
				if ($file["error"] > 0) {
					$error = "Return Code: ".$file["error"];
				} else {
					if (file_exists($targetPath.$file['name'])) {
						$targetPath = $targetPath.time()."-".$file['name'];
					}else{
						$targetPath = $targetPath.$file['name'];
					}

					if(move_uploaded_file($file['tmp_name'], $targetPath)){
						$success['message'] = "Image Uploaded Successfully";
						$success['url'] = $targetUrl.$file['name'];
						$success['path'] = $targetPath;
						$success['status'] = 'success';
						echo json_encode($success);
						exit();
					}else{
						$error = "Error while uploading image.";
					}
				}
				
			} else {
				$error = "Invalid file Size or Type, File size must be grater then 1MB";
			}
		}else{
			$error = "File not found.";
		}

		if($error){
			echo json_encode(array('status'=>'error','message' => $error));
			exit();
		}
	}
}

function wp_pd_upload_image_base64(){
	$post = $_POST;
	$dir = wp_pd_content_dir();
	$targetPath = $dir."images/share/";
	_wcpc_createPath($targetPath);
	$url = wp_pd_content_dir('url');
	$targetUrl = $url."images/share/";
	
	if(isset($post["type"]) && $post["type"] == 'share_image'){
		$file_name = time().'-'.rand(0,1000);
		$new_file_name = wp_pd_save_base64_image($_POST['image'], $file_name, $targetPath);
		$success['message'] = "Image Uploaded Successfully";
		$success['url'] = $targetUrl.$new_file_name;
		$success['path'] = $targetPath.$new_file_name;
		$success['status'] = 'success';
		echo json_encode($success);
		exit();
	}else{
		$erorr = "File not found.";
	}
	if($error){
		echo json_encode(array('status'=>'error','message' => $error));
		exit();
	}
}



function wppd_get_fonts(){
	
	$data = [
		'post_type' => "wc_pd_fonts", 
		'posts_per_page' => -1,
		'post_status' => 'all'
	];
	$posts = get_posts($data);

	$fonts = array_values(array_map(function($post){
		$src = get_post_meta($post->ID, 'font_file', true); 
		$src = wp_get_attachment_url($src);

		return [
		'name' => $post->post_title,
		'url' => $src,	
		];
	}, $posts));

	$fonts = array_filter($fonts, function($font){ return (isset($font['url']) && !empty($font['url'])) || (isset($font['src']) && !empty($font['src'])); });

	return !empty($fonts) ? $fonts : array();
}

function wppd_get_cliparts(){
	
	$data = [
		'post_type' => 'wc_pd_clip_arts', 
		'posts_per_page' => -1,
		'post_status' => 'all'
	];
	$posts = get_posts($data);

	$cliparts = array_values(array_map(function($post){
		$src = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'full' );

		return [
		'name' => $post->post_title,
		'full' => $src[0],
		'options' => ['filters' => []],
		//'thumb' => $src[0]
		];
	}, $posts));

	return !empty($cliparts) ? $cliparts : array();
}

add_filter('upload_mimes', 'wp_pd_add_custom_upload_mimes');
function wp_pd_add_custom_upload_mimes($existing_mimes){
	$existing_mimes['ttf'] = 'font/ttf';
	//$existing_mimes['xml'] = 'application/atom+xml';
	return $existing_mimes;
}


function wp_pd_save_base64_image($base64_image_string, $file_name, $path="" ) {
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
    file_put_contents( $path . $output_file_with_extentnion, base64_decode($data) );
    return $output_file_with_extentnion;
}
