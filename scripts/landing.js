var animatePoints = function() {
	var revealPoint = function() {
     // #7
     $(this).css({
        opacity: 1,
        transform: 'scaleX(1) translateY(0)'
      });	
}; //end function 
// #6
$.each($('.point'), revealPoint);
	
}; /* end animatePoints function */

 $(window).load(function() {
	if ($(window).height()> 950) {  // automatically animates if tall screen
         animatePoints();
   } 
	var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;
   $(window).scroll(function(event) {
	  if ($(window).scrollTop() >= scrollDistance) {
        animatePoints();
	  }
	window.innerHeight + 200; 
  });

 });
   

 	
