var GLOBAL_PORSCHE;
var ALPHA_MIDDLE;

class Porsche {
    constructor(pos_, wheel_speeds_, wheel_angles_, G_, D2_, R_, heading_, velocity_) {
        this.pos = pos_; // x,y location of the vehicle on the window
        this.wheel_speeds = wheel_speeds_; // Each wheel speeds
        this.wheel_angles = wheel_angles_; // Each wheel angle
        this.G = G_; // The distance from front wheels to back wheels
        this.D2 = D2_; // The distance from left back wheel to right back wheel
        this.R = R_; // Distance from the wheel to the ICC
        this.heading = heading_; // Angle of the vehicle (not the individual wheels)
        this.velocity = velocity_; // Speed of the vehicle
    }

    /* letThereBeVehicle() calls this function iteratively (forever loop) every .10s */
    run() {
        this.drawMap();
        this.displayWheelInfo();
        this.updateRedDotPosition();
		var pos = this.getPorschePosition("This arg doesn't matter");
		writeToLog(this.velocity, this.heading, pos.x, pos.y); // Write this data to the "log"
    }

    /* Draws the zoomed-in image on the top right corner of the screen */
    drawMap() {
        var img, lens, map, cx, cy;
        img = document.getElementById("track"); // The large image on the left side
        map = document.getElementById("map"); // The zoomed in image on the right side
    
        lens = document.createElement("div"); // The box that borders the red dot
        lens.setAttribute("class", "img-zoom-lens");
    
        img.parentElement.insertBefore(lens, img);
    
        /* Calculates the ratio of the map over the lens */
        cx = map.offsetWidth / lens.offsetWidth;
        cy = map.offsetHeight / lens.offsetHeight;
    
        map.style.backgroundImage = "url(../assets/img/Lowesmotorspeedway.jpg)";
        map.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    
        this.moveLens(img, lens, map, cx, cy);
    }
    
    /* 
        Updates the location of the lens based on the position of the red dot 
        (red dot should be centered)
    */
    moveLens(img, lens, result, cx, cy) {
        var pos, x, y;
    
        /* Get Porsche x and y positions */
        pos = this.getPorschePosition();
    
        /* 
        
            Calculate the position of the lens: 
                (lens.offsetWidth / 2) and (lens.offsetHeight / 2) because
                the lens must have the red dot at its center as oppose
                to its upper left corner
        */
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        
        /* Prevent the lens from being positioned outside the image: */
        if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
        if (x < 0) {x = 0;}
        if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
        if (y < 0) {y = 0;}
        
        /* Set the position of the lens: */
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        
        /* Display what the lens "sees" on the map: */
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    
        // Do not delete these comments. They are for future references
        // console.log("-" + (x * cx) + "px -" + (y * cy) + "px");
        // console.log("-" + (x * cx-50) + "px -" + (y * cy) + "px");
        // console.log("-" + (x * cx)-50 + "px -" + (y * cy) + "px");
        // console.log("-" + ((x * cx)-50) + "px -" + (y * cy) + "px");
    }
    
    /* Gets the x and y position of the red dot */
    getPorschePosition(e) {
        var porsche = document.getElementById("car-window");
        var x = 0, y = 0;
        /* 
            Calculate the porsche's x and y coordinates.
            We + (porsche.offsetWidth / 2) and (porsche.offsetHeight / 2) so that
            the point of the red dot is at the center of the red dot instead of at
            its top left corner
        */
        x = porsche.getBoundingClientRect().x + (porsche.offsetWidth / 2);
        y = porsche.getBoundingClientRect().y + (porsche.offsetHeight / 2);
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x : x, y : y};
    }

    /* 
        Controls the text that appears on the bottom right corner of the screen.
        It should display wheels speed and angle.
    */
    displayWheelInfo() {
        var wheel1_info = document.getElementById("wheel1-info");
        var wheel2_info = document.getElementById("wheel2-info");
        var wheel3_info = document.getElementById("wheel3-info");
        var wheel4_info = document.getElementById("wheel4-info");

        wheel1_info.innerText = `${this.wheel_speeds[0]}mph`;
        wheel2_info.innerText = `${this.wheel_speeds[1]}mph`;
        wheel3_info.innerText = `${this.wheel_speeds[2]}mph`;
        wheel4_info.innerText = `${this.wheel_speeds[3]}mph`;

        var wheel1_angle = document.getElementById("wheel1-info-angle");
        var wheel2_angle = document.getElementById("wheel2-info-angle");

        wheel1_angle.innerText = `${Math.round(this.wheel_angles[0])}deg`;
        wheel2_angle.innerText = `${Math.round(this.wheel_angles[1])}deg`;

        var speedometer = document.getElementById("speedometer");
        speedometer.innerText = `${Math.round(this.velocity)}`;
    }

    updateRedDotPosition() {
        var porsche = document.getElementById("car-window");
        var x = 0, y = 0;

        var heading_in_radians = (this.heading) * Math.PI/180;
        var cos = Math.cos(heading_in_radians);
        var sin = Math.sin(heading_in_radians);

        x = (this.velocity/75) * cos;
        y = (this.velocity/75) * sin;


        if(this.pos[0] + x && this.pos[1] + y) {
            this.pos[0] = this.pos[0] - x;
            this.pos[1] = this.pos[1] - y;

            porsche.style.top = this.pos[1] + 'px';
            porsche.style.left = this.pos[0] + 'px';
        }   
    }
} 

function letThereBePorsche(event) {
    var x = event.pageX;
    var y = event.pageY;
    var window = document.getElementById('window');
    var car = document.createElement('div');
    car.id = "car-window";

    /* Must append to the window before getting element dimensions */
    window.append(car);

    /* 
        Subtracting (porsche.offsetWidth/2) and (porsche.offsetHeight/2) 
        ensures that the element is centered at that location of the cursor as oppose
        to its upper left corner
    */
    car.style.left = x - (car.offsetWidth / 2) + 'px';
    car.style.top = y - (car.offsetHeight / 2)  + 'px';

    var porsche = new Porsche([x - (car.offsetWidth / 2),y - (car.offsetHeight / 2)], [0,0,0,0], [0,0], 96.5, 60, 0, 0);
    GLOBAL_PORSCHE = porsche;

    setInterval(() => {
        porsche.run();
    }, 100);
}

/*
    Gets the angle of the steering wheel when it points toward the cursor.
*/
function updateAngle(e) {
    var steering_wheel = document.getElementById("steering-wheel");
    var x_center_of_steering_wheel = steering_wheel.getBoundingClientRect().x + (steering_wheel.offsetWidth / 2);
    var y_center_of_steering_wheel = steering_wheel.getBoundingClientRect().y + (steering_wheel.offsetHeight / 2);

    var angle = Math.atan2(e.pageX - x_center_of_steering_wheel, -(e.pageY - y_center_of_steering_wheel))*(180/Math.PI);
    
    calculateWheelAlphas(angle, steering_wheel);
	updateSpeed(e);
}

/*
    Given the angle of the steering wheel,
    calculate the individual wheel alphas (angles)
*/
function calculateWheelAlphas(angle, steering_wheel) {
    if(GLOBAL_PORSCHE) {
        var G = GLOBAL_PORSCHE.G;
        var D2 = GLOBAL_PORSCHE.D2;

        var wheel1 = document.getElementById("wheel1")
        var wheel2 = document.getElementById("wheel2");

        if( angle >= 0) {
            // ICC is on the right side
            var rad = (angle * Math.PI) / 180;
            var R = ( G / Math.tan(rad)) + (D2/2);
            var alpha_middle = (Math.atan(G / R) * 180/Math.PI);
            var alpha_outside = Math.atan(G / (R + D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;

            if(angle <= 90) {
                ALPHA_MIDDLE = alpha_middle; 
            }

            if(angle <= 30) {
                GLOBAL_PORSCHE.wheel_angles = [alpha_outside, alpha_inside];
                GLOBAL_PORSCHE.R = R;
                wheel1.style.transform = `rotate(${alpha_outside}deg)`;
                wheel2.style.transform = `rotate(${alpha_inside}deg)`;

                /* Steering wheel image on the screen is also rotated */
                steering_wheel.style.transform = `rotate(${angle}deg)`;  
            }
        } else {
            // ICC is on the left side

            /* 
                Since angle is now negative, R will result to negative.
                For instance if angle = -30, then R = -167.
                Then we - (D2/2) to it, since -167 - 30 = -197.
                On the positive angle, R = 197.
                What we're doing is mirroring what we did when angle >= 0
                This is because ICC left side is symetric to ICC right side

                alpha_middle, alpha_outside, and alpha_inside should all be negative values
            */
            var rad = (angle * Math.PI) / 180;
            var R = ( G / Math.tan(rad)) - (D2/2);
            var alpha_middle = (Math.atan(G / R) * 180/Math.PI);
            var alpha_outside = Math.atan(G / (R - D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;

            if(angle >= -90) {
                ALPHA_MIDDLE = alpha_middle; 
            }
        
            if(angle >= -30) {

                /*
                    As mentioned above, since we are reversing what we did when angle >= 0,
                    We also need to switch alpha_inside to be the left wheel and
                    alpha_outside to be the right wheel
                */
                GLOBAL_PORSCHE.wheel_angles = [alpha_inside, alpha_outside];               
                GLOBAL_PORSCHE.R = R;
                wheel1.style.transform = `rotate(${alpha_inside}deg)`;
                wheel2.style.transform = `rotate(${alpha_outside}deg)`;

                /* Steering wheel image on the screen is also rotated */
                steering_wheel.style.transform = `rotate(${angle}deg)`;  
            }
        }
    }
}

/* Handles button events to control vehicle speed */
function updateSpeed(e) {

    var wheel_fake_speed = document.getElementById("wheel-fake-speed");
    var wheel_right_speed = parseInt(wheel_fake_speed.innerText);

    if(e.key == 'e') {
        if(parseInt(wheel_fake_speed.innerText) <= 199) {
            wheel_fake_speed.innerText = parseInt(wheel_fake_speed.innerText) + 1;
        }
    } else if(e.key == 'w') {
        if(parseInt(wheel_fake_speed.innerText) >= -4) {
            wheel_fake_speed.innerText = parseInt(wheel_fake_speed.innerText) - 1;
        }
    } else if(e.key == 'q') {
        wheel_fake_speed.innerText = 0;
    }

    calculateWheelSpeeds(wheel_right_speed);
}

function calculateWheelSpeeds(speed) {
    if(GLOBAL_PORSCHE) {
        var R = GLOBAL_PORSCHE.R;
        var wheel1_angle = GLOBAL_PORSCHE.wheel_angles[0];
        var wheel2_angle = GLOBAL_PORSCHE.wheel_angles[1];
        var G = GLOBAL_PORSCHE.G;

        var omega = (speed * Math.sin(wheel2_angle * Math.PI/180)) / G;
        
		// Front wheels
		var front_left_wheel_speed = (omega * G) / Math.sin(wheel1_angle * Math.PI/180);
        var front_right_wheel_speed = (omega * G) / Math.sin(wheel2_angle * Math.PI/180);
		
		var back_right_wheel_speed = omega * (R - (GLOBAL_PORSCHE.D2/2));
        var back_left_wheel_speed = omega * (R + (GLOBAL_PORSCHE.D2/2));

        GLOBAL_PORSCHE.wheel_speeds = [Math.round(front_left_wheel_speed), Math.round(speed), 
            Math.round(back_left_wheel_speed), Math.round(back_right_wheel_speed)];

        calculateVehicleSpeed(omega, R);
    }
}

function calculateVehicleSpeed(omega, R) {
    var velocity = omega * R;
    GLOBAL_PORSCHE.velocity = velocity;
    GLOBAL_PORSCHE.heading = (velocity/GLOBAL_PORSCHE.G) * Math.tan(ALPHA_MIDDLE * Math.PI/180) * 180/Math.PI;

    //console.log(GLOBAL_PORSCHE.heading);
}
  /*
    https://www.w3schools.com/howto/howto_js_image_zoom.asp
    http://jsfiddle.net/opherv/ddGHz/
    https://www.w3schools.com/jsref/event_onkeypress.asp
    https://www.w3schools.com/jsref/met_element_queryselector.asp
    https://www.xarg.org/book/kinematics/ackerman-steering/
  */

// ********** Log Writing/Reading/Playback **********

loadedLog = [];
loadedTrajectory = [];
logPlayback = false;

// Writes the current Porsche instant data to a log.
function writeToLog(wheel_angle, car_speed, pos_x, pos_y) {
	if (car_speed == 0) return; // Don't log if the car isn't moving
	
	// Message format: "velocity,angle|x,y;"
	var logMessage = "" + car_speed + "," + wheel_angle + "|" + pos_x + "," + pos_y + ";";
	// TODO: Append this to an element somewhere
	//console.log(logMessage); // TODO
	document.getElementById("loggyloglog").value += logMessage;
}

function logPlayback() {
    // Sanity check first
    if (loadedLog.length <= 0) {
        // There's no more to play back!
        clearInterval(logPlayback);
        logPlayback = null;
        console.log("Log playback ended.");
        return;
    }

    // Get the data to compute this iteration
    var logPiece = loadedLog.pop().split(","); // This is why I reversed it!

    // logPiece[0] is the velocity, logPiece[1] is the angle
    var carVelocity = parseFloat(logPiece[0]);
    var carAngle = parseFloat(logPiece[1]);

    // Send these two data pieces to the correct areas, and
    // have the functions we already built do the calculation and "playback"
    // TODO TODO TODO
}

// Pulls text from a text input box, parses it, and starts playing it back
// on the simulator itself.
function runFromLog() {
	// TODO: Get log text from an element somehow
	var logText = "" + document.getElementById("loggyloglog").value;
	console.log(logText);

	// Thought: log text should be in the format "velocity,angle|x,y;velocity,angle|x,y;velocity,angle|x,y;..."
	// e.g. "20,0.1|800,400;21,0.2|801,401;20,0.15|802,402;..."
	
	// Step 1: Parse log text into individual pieces
	var loggedData = logText.split(";");
	
	// Step 2: Split each piece into "velocity,angle" and "x,y"
	// and put all of these into a position array
	for (var i = 0; i < loggedData.length; i++) {
		var dataPiece = loggedData[i].split("|");
		// dataPiece[0] is the vehicle velocity,heading
		// dataPiece[1] is the vehicle x,y
		
		// Put the velocity,heading into loadedLog array
		// and the x,y into the trajectory array
		loadedLog.push("" + dataPiece[0]);
		loadedTrajectory.push("" + dataPiece[1]);
	}
	
	loadedLog.reverse();
	loadedTrajectory.reverse();
	// Reversing these means we can simply use pop() on them later
	
	// Step 3: Visually load the trajectory from loadedTrajectory
	displayTrajectory();
	
	// Step 4: Start running through the log
	console.log("Starting playback from log...");
	running = function(){
        setInterval(logPlayback, 100);
    }
}

// Parses and displays every trajectory point in loadedTrajectory.
function displayTrajectory() {
	for (var i = 0; i < loadedTrajectory.length; i++) {
		var coordinates = loadedTrajectory[i].split(",");
		var x_coord = parseFloat(coordinates[0]);
		var y_coord = parseFloat(coordinates[1]);
		// Now we have (x,y) of a point along the car's trajectory.
		// Put something on the screen canvas to represent it
		
		// TODO: I am not so good with this!
		bloop(x_coord, y_coord);
	}
}

var paint;

function bloop(dot_x, dot_y) {
    var dot = document.createElement("div");
    dot.className = "circle";
    dot.style.position = "absolute";
    
    /*
    var position = $(document.getElementById('tip')).offset();
    var new_pos = $(dot).css({
        top: position.top-5,
        left: position.left
    });
      
    var x = new_pos.left;
    var y = new_pos.top;
    */
	var x = dot_x;
	var y = dot_y;
	
    dot.style.top = y;
    dot.style.left = x;
        
    document.getElementById("window").appendChild(dot);
}