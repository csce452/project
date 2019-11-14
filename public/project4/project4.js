var GLOBAL_PORSCHE;

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

        wheel1_info.innerText = `${this.wheel_speeds[0]}mph \n ${Math.round(this.wheel_angles[0])}deg`;
        wheel2_info.innerText = `${this.wheel_speeds[1]}mph \n ${Math.round(this.wheel_angles[1])}deg`;
        wheel3_info.innerText = `${this.wheel_speeds[2]}mph`;
        wheel4_info.innerText = `${this.wheel_speeds[3]}mph`;
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

    var porsche = new Porsche([x,y], [0,0,0,0], [0,0], 96.5, 60, 0, 0);
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
            var alpha_middle = Math.atan(G / R) * 180/Math.PI;
            var alpha_outside = Math.atan(G / (R + D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;

            if(angle <= 30) {
                GLOBAL_PORSCHE.wheel_angles = [alpha_outside, alpha_inside];
                GLOBAL_PORSCHE.heading = alpha_middle;
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
            var alpha_middle = Math.atan(G / R) * 180/Math.PI;
            var alpha_outside = Math.atan(G / (R - D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;
        
            if(angle >= -30) {

                /*
                    As mentioned above, since we are reversing what we did when angle >= 0,
                    We also need to switch alpha_inside to be the left wheel and
                    alpha_outside to be the right wheel
                */
                GLOBAL_PORSCHE.wheel_angles = [alpha_inside, alpha_outside];
                GLOBAL_PORSCHE.heading = alpha_middle;
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

    var speedometer = document.getElementById("speedometer");
    var front_right_wheel_speed = parseInt(speedometer.innerText);

    if(e.key == 'e') {
        if(parseInt(speedometer.innerText) <= 199) {
            front_right_wheel_speed += 1;
            speedometer.innerText = parseInt(speedometer.innerText) + 1;
        }
    } else if(e.key == 'w') {
        if(parseInt(speedometer.innerText) >= -4) {
            front_right_wheel_speed -= 1;
            speedometer.innerText = parseInt(speedometer.innerText) - 1;
        }
    } else if(e.key == 'q') {
        front_right_wheel_speed = 0;
        speedometer.innerText = 0;
    }

    calculateWheelSpeeds(front_right_wheel_speed);
}

function calculateWheelSpeeds(speed) {
    if(GLOBAL_PORSCHE) {
        //var R = GLOBAL_PORSCHE.R;
        var wheel1_angle = GLOBAL_PORSCHE.wheel_angles[0];
        var wheel2_angle = GLOBAL_PORSCHE.wheel_angles[1];
        var G = GLOBAL_PORSCHE.G;

        var omega = (speed * Math.sin(wheel2_angle * Math.PI/180)) / G;
        var front_left_wheel_speed = (omega * G) / Math.sin(wheel1_angle * Math.PI/180);

        GLOBAL_PORSCHE.wheel_speeds = [Math.round(front_left_wheel_speed), Math.round(speed), 0, 0];
    }
}
  /*
    https://www.w3schools.com/howto/howto_js_image_zoom.asp
    http://jsfiddle.net/opherv/ddGHz/
    https://www.w3schools.com/jsref/event_onkeypress.asp
    https://www.w3schools.com/jsref/met_element_queryselector.asp
    https://www.xarg.org/book/kinematics/ackerman-steering/
  */