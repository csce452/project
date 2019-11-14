var GLOBAL_PORSCHE;

class Porsche {
    constructor(pos_, wheel_speeds_, wheel_angles_, G_, D2_, R_, heading_, velocity_) {
        this.pos = pos_;
        this.wheel_speeds = wheel_speeds_;
        this.wheel_angles = wheel_angles_;
        this.G = G_;
        this.D2 = D2_;
        this.R = R_;
        this.heading = heading_;
        this.velocity = velocity_;
    }

    run() {
        this.drawMap();
        this.displayWheelInfo();
    }

    drawMap() {
        var img, lens, result, cx, cy;
        img = document.getElementById("track");
        result = document.getElementById("map");
    
        lens = document.createElement("div");
        lens.setAttribute("class", "img-zoom-lens");
    
        img.parentElement.insertBefore(lens, img);
    
        /* Calculates the ratio of the map over the lens */
        cx = result.offsetWidth / lens.offsetWidth;
        cy = result.offsetHeight / lens.offsetHeight;
    
        result.style.backgroundImage = "url(../assets/img/Lowesmotorspeedway.jpg)";
        result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    
        this.moveLens(img, lens, result, cx, cy);
    }
    
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
    
    getPorschePosition(e) {
        var porsche = document.getElementById("car-window");
        var x = 0, y = 0;
        /* Calculate the porsche's x and y coordinates, relative to the image: */
        x = porsche.getBoundingClientRect().x + (porsche.offsetWidth / 2);
        y = porsche.getBoundingClientRect().y + (porsche.offsetHeight / 2);
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x : x, y : y};
    }

    displayWheelInfo() {
        var wheel1_info = document.getElementById("wheel1-info");
        var wheel2_info = document.getElementById("wheel2-info");
        var wheel3_info = document.getElementById("wheel3-info");
        var wheel4_info = document.getElementById("wheel4-info");

        wheel1_info.innerText = `${this.wheel_speeds[0]}mph`;
        wheel2_info.innerText = `${this.wheel_speeds[1]}mph`;
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
        ensures that the element is centered at that location as oppose
        to its upper left corner being at that position
    */
    car.style.left = x - (car.offsetWidth / 2) + 'px';
    car.style.top = y - (car.offsetHeight / 2)  + 'px';

    var porsche = new Porsche([x,y], [0,0,0,0], [0,0], 96.5, 60, 0, 0);
    GLOBAL_PORSCHE = porsche;

    setInterval(() => {
        porsche.run();
    }, 100);
}

function updateAngle(e) {
    var steering_wheel = document.getElementById("steering-wheel");
    var x_center_of_steering_wheel = steering_wheel.getBoundingClientRect().x + (steering_wheel.offsetWidth / 2);
    var y_center_of_steering_wheel = steering_wheel.getBoundingClientRect().y + (steering_wheel.offsetHeight / 2);

    var angle = Math.atan2(e.pageX - x_center_of_steering_wheel, -(e.pageY - y_center_of_steering_wheel))*(180/Math.PI);
    
    var wheel_angles = calculateWheelAlphas(angle);

    if(GLOBAL_PORSCHE && wheel_angles[0] >= -30 && wheel_angles[1] <= 30) {
        steering_wheel.style.transform = `rotate(${angle}deg)`;        
    }
}

function calculateWheelAlphas(angle) {
    if(GLOBAL_PORSCHE) {
        var G = GLOBAL_PORSCHE.G;
        var D2 = GLOBAL_PORSCHE.D2;

        var wheel1 = document.getElementById("wheel1")
        var wheel2 = document.getElementById("wheel2");

        if( angle >= 0) {
            // ICC is on the right side
            var rad = (angle * Math.PI) / 180;
            var R = ( G / Math.tan(rad)) + (D2/2);
            var alpha_middle = (G / R) * 180/Math.PI;
            var alpha_outside = (G / (R + D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;

            if(angle <= 30) {
                GLOBAL_PORSCHE.wheel_angles = [alpha_outside, alpha_inside];
                GLOBAL_PORSCHE.heading = alpha_middle;
                wheel1.style.transform = `rotate(${alpha_outside}deg)`;
                wheel2.style.transform = `rotate(${alpha_inside}deg)`;
            }

            return [alpha_outside, alpha_inside];

        } else {
            // ICC is on the left side

            /* 
                Since angle is now negative, R will result to negative.
                For instance if angle = -30, then R = -167.
                Then we - (D2/2) to it, since -167 - 30 = -197.

                On the positive angle, R = 197.
                What we're doing is reversing what we did when angle >= 0

                alpha_middle, alpha_outside, and alpha_inside should all be negative values
            */
            var rad = (angle * Math.PI) / 180;
            var R = ( G / Math.tan(rad)) - (D2/2);
            var alpha_middle = (G / R) * 180/Math.PI;
            var alpha_outside = (G / (R - D2/2) ) * 180/Math.PI;
            var alpha_inside = angle;
        
            if(angle >= -30) {

                /*
                    As mentioned above, since we are reversing what we did when angle >= 0,
                    We also need to switch alpha_inside to be the left wheel and
                    alpha_outside to be the right wheel
                */

                GLOBAL_PORSCHE.wheel_angles = [alpha_inside, alpha_outside];
                GLOBAL_PORSCHE.heading = alpha_middle;
                wheel1.style.transform = `rotate(${alpha_inside}deg)`;
                wheel2.style.transform = `rotate(${alpha_outside}deg)`;
            }

            return [alpha_inside, alpha_outside];
        }
    }
}

function updateSpeed(e) {

    var speedometer = document.getElementById("speedometer");

    if(e.key == 'e') {
        console.log("speeding up");
        if(parseInt(speedometer.innerText) <= 199) {
            speedometer.innerText = parseInt(speedometer.innerText) + 1;
        }
    } else if(e.key == 'w') {
        if(parseInt(speedometer.innerText) >= -4) {
            speedometer.innerText = parseInt(speedometer.innerText) - 1;
        }
    } else if(e.key == 'q') {
        speedometer.innerText = 0;
    }
}

  /*
    https://www.w3schools.com/howto/howto_js_image_zoom.asp
    http://jsfiddle.net/opherv/ddGHz/
    https://www.w3schools.com/jsref/event_onkeypress.asp
    https://www.w3schools.com/jsref/met_element_queryselector.asp
    https://www.xarg.org/book/kinematics/ackerman-steering/
  */