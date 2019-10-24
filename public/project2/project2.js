var links;
var buttons;
var turn;
var move;
var paint;
var currentlyPainting;
var instructions;

var offsetVert = 0;
var offsetHor = 0;

var totalLength = 0;

window.onload = function(){
    links = document.getElementsByClassName("link");
    buttons = document.getElementsByClassName("b");
    instructions = document.getElementsByClassName("instructions");
    instructions[0].style.display = "block";
    instructions[1].style.display = "none";
    this.currentlyPainting = false;
	
    totalLength += document.getElementById("link1").clientWidth;
    totalLength += document.getElementById("link2").clientWidth;
    totalLength += document.getElementById("link3").clientWidth;
}

function getCurrentAngle(link) {
    // Getting the the css style set of a specific link from the html document
    var styleSet = window.getComputedStyle(link);

    // Getting the the css value of "transform" from the styleSet
    var matrix = styleSet.getPropertyValue('transform');

    /*
        - Generating an array of values from matrix
            - matrix holds the value "matrix(i, j, k, l)"
            - We want it in the form of [i, j, k, l]
        - To do this, we treat the value of matrix as a string and split accordingly
            - split() creates an array that splits given a delimeter
        - The first split results in ["matrix", "i,j,l)"]
            - We only want to further split the values in the second index
        - The second split results in ["i,j,k,l"]
            - In this case, it will only be one index b/c there are no strings after ")"
        - The last split has the char "," as the delimeter
            - Resulting array is [i, j, k, l]
    */
    var splitting = matrix.split("(")[1];
        splitting = splitting.split(")")[0];
        splitting = splitting.split(",")

    /*
        To get the angle of the link, we need to calculate the value of arcsin(j)
        and multiply it with (180/Pi) to get the resulting answer in degrees
        instead of radians
    */  
    // var angle = Math.round(Math.atan2(splitting[1],splitting[0]) * (180/Math.PI));
    var angle = Math.atan2(splitting[1],splitting[0]) * (180/Math.PI);

    return angle;

}

function incrementCurrentAngle(link, currentAngle, increment) {
    var deg = currentAngle + increment;
    var newCSS = "\
    -webkit-transform: rotate("+deg+"deg); \
    -moz-transform: rotate("+deg+"deg); \
    -ms-transform: rotate("+deg+"deg); \
    -o-transform: rotate("+deg+"deg); \
    transform: rotate("+deg+"deg); \
    ";

    link.style.cssText = newCSS;
	
	moveTip();
}

function counterClockwise(n) {
    turn=setInterval(function() {
        var link = links[n];
        var angle = getCurrentAngle(link);
        incrementCurrentAngle(link, angle, -1);
    }, 20);
}

function clockwise(n) {
    turn=setInterval(function() {
        var link = links[n];
        var angle = getCurrentAngle(link);
        incrementCurrentAngle(link, angle, 1);
    }, 20);
}

function stopTurn() {
    if (turn) clearInterval(turn);
}

function bloop() {
    if(!currentlyPainting) {
        currentlyPainting = true;
        instructions[0].style.display = "none";
        instructions[1].style.display = "block";
        paint=setInterval(function() {
            var dot = document.createElement("div");
            dot.className = "circle";
            dot.style.position = "absolute";
        
            var position = $(document.getElementById('tip')).offset();
            var new_pos = $(dot).css(position)
        
            var x = new_pos.left;
            var y = new_pos.top;
        
            dot.style.top = y;
            dot.style.left = x;
        
            document.getElementById("window").appendChild(dot);
        }, 10);
    } else {
        currentlyPainting = false;
        instructions[0].style.display = "block";
        instructions[1].style.display = "none";
        clearInterval(paint);
    }
}

function validate(vertical, horizontal) {
	// This needs to be the SQUARE of the radius of the arm when fully extended
	// (cause square roots are computationally annoying)
	return vertical*vertical + horizontal*horizontal <= totalLength*totalLength;
}

// Gets the x and y of the base point (the relative origin).
function getBasePoint() {
	var base = document.getElementById('base-pos').getBoundingClientRect();
	var x_coord = (base.left + 0.5*base.width);
	var y_coord = (base.top + 0.5*base.height);
	return { x: x_coord, y: y_coord }
}

// Gets the location of the tip relative to the base point.
function getTipOffsetFromBasePoint() {
	var tip = document.getElementById('tip').getBoundingClientRect();
	var base = document.getElementById('base-pos').getBoundingClientRect();

	var x_coord = (tip.left + 0.5*tip.width) - (base.left + 0.5*base.width);
	var y_coord = (tip.top + 0.5*tip.height) - (base.top + 0.5*base.height);
	return { x: x_coord, y: y_coord }
}

// Translates vertically with inverse kinematics.
function verticalTranslation(n) {
    var tip = document.getElementById('link3');
	var base = document.getElementById('link1');
	
	// Get the current co-ords from the origin
	var currentLength = getTipOffsetFromBasePoint();
	var newLength = getTipOffsetFromBasePoint();

	move = setInterval(function() {
		// We're moving n
		newLength.y += n;

		// Check to see if the new co-ordinates are attainable.
		if (validate(newLength.y, newLength.x)) {
			// If valid, we're now targetting (x, new_y).
			inverseKinematics(newLength.x, newLength.y);
		} else {
			console.log("Failed");
		}
	}, 20)
}

// Translates horizontally with inverse kinematics.
function horizontalTranslation(n) {
    var tip = document.getElementById('link3');
	var base = document.getElementById('link1');
	
	// Get the current co-ords from the origin
	var currentLength = getTipOffsetFromBasePoint();
	var newLength = getTipOffsetFromBasePoint();

	move = setInterval(function() {
		// We're moving n
		newLength.x += n;

		// Check to see if the new co-ordinates are attainable.
		if (validate(newLength.y, newLength.x)) {
			// If valid, we're now targetting (new_x, y).
			inverseKinematics(newLength.x, newLength.y);
		} else {
			console.log("Failed");
		}
  	}, 20);
}

// Stops a translation.
function stopTranslation() {
    if (move) clearInterval(move);
}

// Computes the angles for inverse kinematics.
function inverseKinematics(x_tip, y_tip) {
	console.log("========== PRESSED BUTTON ===========");

	//Length of each links
    var link1 = document.getElementById("link1").clientWidth; // 150
    var link2 = document.getElementById("link2").clientWidth; // 100
    var link3 = document.getElementById("link3").clientWidth; // 75

	// Current position
	var currentPosition = getTipOffsetFromBasePoint();
	var currentAngle = Math.atan2(currentPosition.y, currentPosition.x);

    //The X and Y location of the base
    var basePoint = getBasePoint();

    console.log("x_base:", basePoint.x, "y_base:", basePoint.y);
    console.log("x_tip: ", x_tip, "y_tip: ", y_tip);
	
	// Desired angle for the end effector:
	// Target angle for the sum of the link angles
	var phi = Math.atan2(y_tip, x_tip); // getCurrentAngle(links[2]); // Should be in degrees
	console.log("Current angle: ", currentAngle);
	console.log("Target angle:", phi);

    //Inverse kinematics calculations from this point down
    var delta_x = x_tip - (link3 * Math.cos(phi));
    var delta_y = y_tip - (link3 * Math.sin(phi));
	
    var delta = Math.pow(delta_x, 2) + Math.pow(delta_y, 2);
    
    console.log("phi:", phi, "delta_x:", delta_x, "delta_y:", delta_y, "delta:", delta);

    //Calculating theta_2 (the angle for the second link)
    var cos_2 = (delta - Math.pow(link1, 2) - Math.pow(link2, 2)) / (2 * link1 * link2);
    var sin_2 = Math.sqrt(1 - Math.pow(cos_2, 2));
    var theta_2 = Math.atan2(sin_2, cos_2);

    console.log("cos_2:", cos_2, "sin_2:", sin_2, "theta_2:", theta_2);

    //Calculating theta_1 (the angle for the first link)
    var sin_1 = ((link1+link2*cos_2)*delta_y - link2*sin_2*delta_x) / delta;
    var cos_1 = ((link1+link2*cos_2)*delta_x + link2*sin_2*delta_y) / delta;
    var theta_1 = Math.atan2(sin_1, cos_1);

    console.log("cos_1:", cos_1, "sin_1:", sin_1, "theta_1:", theta_1);
	
	var theta_3 = phi - theta_1 - theta_2; // TODO: Use this value?
	
	// We have theta_1 (angle for link1 in radians)
	// and theta_2 (angle for link2 in radians)
	// I have an idea for handling the angle of the third link, but
	// it's not necessary for now.
	
	// Set these angles to the link pieces
	
	changeAngle(3, theta_3);
	changeAngle(2, theta_2);
	changeAngle(1, theta_1);
	moveTip();

	var newPosition = getTipOffsetFromBasePoint();
	var newAngle = Math.atan2(newPosition.y, newPosition.x);

	console.log("========== TRANSLATION SUMMARY ===========");
	console.log("Target angle:", phi);
	console.log("Actual angle:", newAngle);
	console.log("Error:", Math.abs(phi-newAngle));
}

// Sets the angle of the given link to the given angle.
// "link" is the link number
// "theta" is the angle in RADIANS!
function changeAngle(link, theta) {
    var jointcss = "\
    -webkit-transform: rotate("+theta+"rad); \
    -moz-transform: rotate("+theta+"rad); \
    -ms-transform: rotate("+theta+"rad); \
    -o-transform: rotate("+theta+"rad); \
    transform: rotate("+theta+"rad); \
    ";

    links[link - 1].style.cssText = jointcss;
}

function moveTip() {
	// detemine r
	var link1 = document.getElementById("link1"); // 150
    var link2 = document.getElementById("link2"); // 100
    var link3 = document.getElementById("link3"); // 75
	var link1a = getCurrentAngle(link1) * Math.PI / 180;
	var link2a = getCurrentAngle(link2) * Math.PI / 180;
	var link3a = getCurrentAngle(link3) * Math.PI / 180;
	var link1r = link1.clientWidth;
	var link2r = link2.clientWidth;
	var link3r = link3.clientWidth;

	// Detemine the angle of base to tip
	var theta = link1a + link2a + link3a;
	var rx = link1r * Math.cos(link1a) + link2r * Math.cos(link1a + link2a) + link3r * Math.cos(link1a + link2a + link3a);
	var ry = link1r * Math.sin(link1a) + link2r * Math.sin(link1a + link2a) + link3r * Math.sin(link1a + link2a + link3a);
	// var r = Math.sqrt(rx*rx + ry*ry);
	
	var jointcss = "left: "+rx+"px ; top: " + ry + "px;";
	
	document.getElementById("tip").style.cssText = jointcss;
}

/********************************************************************* RESOURCES
    https://css-tricks.com/almanac/properties/t/transform-origin/
    https://css-tricks.com/get-value-of-css-rotation-through-javascript/
    https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
    https://stackoverflow.com/questions/15505272/javascript-while-mousedown
    https://stackoverflow.com/questions/19574171/how-to-get-css-transform-rotation-value-in-degrees-with-javascript
    https://www.useragentman.com/blog/2011/01/07/css3-matrix-transform-for-the-mathematically-challenged/
    https://www.w3schools.com/jsref/event_onkeypress.asp
	http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.65.5698&rep=rep1&type=pdf
*/
