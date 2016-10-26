 var pointsArray = document.getElementsByClassName('point');
 
 var animatePoints = function(points) {
	var revealPoint = function(index) {	
		 points[index].style.opacity = 1;
		 points[index].style.transform = "scaleX(1) translateY(0)";
		 points[index].style.msTransform = "scaleX(1) translateY(0)";
		 points[index].style.WebkitTransform = "scaleX(1) translateY(0)";
	} //end function 

	for (var i = 0; i< points.length; i++) {
		 revealPoint(i);		 
	} //end for loop	 
	
}; /* end animatePoints function */

window.onload = function() {
	window.addEventListener('scroll', function(event) {
		if (window.innerHeight > 950) {  // automatically animates if tall screen
         animatePoints(pointsArray);
     	}
    	var sellingPoints = document.getElementsByClassName('selling-points')[0];
    	var scrollDistance = sellingPoints.getBoundingClientRect().top - 
		window.innerHeight + 200; 
        if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
             animatePoints(pointsArray);   
         }
     });
 }
   

 	
