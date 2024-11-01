/*(function($){

	var session = sessionStorage.getItem('bootstrapData');
	console.log(session);
	if(session === undefined || session === null || session === ""){
	session = "[]";
	}

	var data = JSON.parse(session);

	$(function(){
	    customizer = new Customizer({
	    selector: '.customizer-main',
	    bootstrapData: data.fields,
	    settings : {
	      administration : true,
	      images : {
	        
	        clipArts : [
	          {
	            options : {
	              width : 150,
	              height : 150
	            },
	            thumb : 'images/cliparts/Tag-circle-lined-berry-pink.png',
	            full : 'images/cliparts/Tag-circle-lined-berry-pink.png',
	          },
	          {
	            options : {
	              width : 150,
	              height : 150
	            },
	            thumb : 'images/cliparts/Tag-ornate-berry-pink.png',
	            full : 'images/cliparts/Tag-ornate-berry-pink.png',
	          }
	        ]
	      }
	    }
	  });

	  customizer.on('save', function(payload){
	    // $('.fb-json code').html(payload);
	    console.log(payload);
	    sessionStorage.setItem('bootstrapData', payload);
	  })
	});

})(jQuery)*/