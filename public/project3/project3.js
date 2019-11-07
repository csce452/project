lights = []
vehicles = []

class Vehicle {

  constructor(pos, id_) {
    this.id = id_;
    this.x = pos[0];
    this.y = pos[1];
    this.desired_distance = 0;
    this.current_distance = 0;
    this.desired_angle = 0;
    this.current_angle = 0;
  }

  /*
    This was just my touch. Don't have to worry about this function.
  */
  drawVehicleInControlPanel() {
    var newVehicle = document.createElement("div");
    newVehicle.classList.add("vehicle", "text-center");
    
    var color = this.getRandomColor();
    newVehicle.style.backgroundColor = color;
    
    var column = document.getElementById(`vehicle-col-${vehicles.length-1}`);
    column.appendChild(newVehicle);

    var leftSensor = document.createElement("div");
    leftSensor.className = "lsensor"
    var rightSensor = document.createElement("div");
    rightSensor.className = "rsensor"

    newVehicle.append(leftSensor);
    newVehicle.append(rightSensor);

    this.drawVehicleInWindow(color);
  }

  /*
    - Creates a container for the starting point of the vehicle
    - This is the element that rotates rather than the vehicle
      - If the vehicle rotates itself, we have to keep recalculating
        for x and y
      - Rather, just have the parent element rotate and just increase
        x accordingly
    - Also attached some sensors on the vehicle drawing
  */
  drawVehicleInWindow(color) {

    var newVehicleContainer = document.createElement('div');
    newVehicleContainer.id = `vehicle-container-${this.id}`;
    newVehicleContainer.style.position = "fixed";
    newVehicleContainer.style.left = this.x + "px";
    newVehicleContainer.style.top = this.y + "px";
    newVehicleContainer.style.width = 100 + "px";
    newVehicleContainer.style.height = 100 + "px";

    var newVehicle = document.createElement('div');
    newVehicle.className = 'vehicle';
    newVehicle.id = this.id;
    newVehicle.style.backgroundColor = color;

    var leftSensor = document.createElement("div");
    leftSensor.className = "lsensor"
    var rightSensor = document.createElement("div");
    rightSensor.className = "rsensor"

    newVehicle.append(leftSensor);
    newVehicle.append(rightSensor);

    newVehicleContainer.append(newVehicle);
    document.getElementById('window').appendChild(newVehicleContainer);
  }

  /*
    - Desired angle and desired distance is calculated
      - Desired distance is distance from the vehicle to the closest light
      - Desired angle is the angle pointing the vehicle to the light
      - The current distance gets incremented each interation starting from 0
      - The current andle gets incremented each iteration starting from 0
    - The vehicle will only move until it reaches its desired distance
    - The vehicle will only turn until it reaches its desired angle
  */
  run() {
    var vehicle = document.getElementById(this.id);

    this.getDistanceFromLightSource();
    
    var self = this;
    var counter = 0;

    setInterval(function() {

      /******************************** TO DO ************************************/

      // "counter" rate and "self.current_angle" rate must be proportional
      // Play around by changing these values
      // So far I have it at .2 and 1.1 respectively
        // These values only work for some cases
      // For "self.current_angle" it must be exponential (faster as it gets closer to the light)
        // right now it's just constant

      // I subtracted 150 from the desired distance travelled because
      // if not, it always passes the light
      // if(self.current_distance < self.desired_distance-50) {
      //   console.log("hello1");
      //   counter += .8;
      // } else if(self.current_distance > self.desired_distance-50 && self.current_distance < self.desired_distance-100) {
      //   counter += .4;
      //   console.log("hello2");
      // } else if(self.current_distance < self.desired_distance-150) {
      //   counter += .2;
      //   console.log("hello3");
      // } else if(self.current_distance < self.desired_distance-200) {
      //   counter += .1;
      //   console.log("hello4");
      // }

      if(self.current_distance < (self.desired_distance-self.desired_distance) + 50) {
        counter += .2;
      } else if(self.current_distance < (self.desired_distance-self.desired_distance) + 100) {
        counter += .4;
      } else if(self.current_distance < (self.desired_distance-self.desired_distance) + 150) {
        counter += .8;
      } else if(self.current_distance < (self.desired_distance-self.desired_distance) + 200) {
        counter += 1.6;
      } 
      
      vehicle.style.left = `${parseInt(self.current_distance) + counter}px`;
      self.current_distance = parseInt(self.current_distance) + counter;

      if(self.current_angle < self.desired_angle) {
        var vehicleContainer = document.getElementById(`vehicle-container-${self.id}`);
        vehicleContainer.style.transform = `rotate(${self.current_angle}deg)`;
        self.current_angle += 1.2;
      }


      /***************************** END TO DO ************************************/

    }, 80);
  }

  /*
    The remaining three functions in the Vehicle class are self-explanatory  
  */
  getDistanceFromLightSource(index) {
    var vehicle = document.getElementById(this.id);

    var minDistance = 99999;
    var minIndex = 0;
    var x_of_vehicle = this.x;
    var y_of_vehicle = this.y;

    for(var i = 0; i < lights.length; i++) {
      var x_of_light = lights[i].x;
      var y_of_light = lights[i].y;
      var x_of_vehicle = vehicle.getBoundingClientRect().x;
      var y_of_vehicle = vehicle.getBoundingClientRect().y;

      var calculated_distance = Math.sqrt(Math.pow(x_of_light - x_of_vehicle, 2) + Math.pow(y_of_light - y_of_vehicle, 2));
      if(calculated_distance < minDistance) {
        minDistance = calculated_distance;
        minIndex = i;
      }
    }

    this.desired_distance = minDistance;
    this.getAngleOfClosestLightSource(minIndex);
  }

  getAngleOfClosestLightSource(minIndex) {
    var vehicle = document.getElementById(this.id);

    var x_of_light = lights[minIndex].x;
    var y_of_light = lights[minIndex].y;

    var dx = x_of_light - vehicle.getBoundingClientRect().x;
    var dy = y_of_light - vehicle.getBoundingClientRect().y;

    var angle = Math.atan2(dy,  dx) * 180 / Math.PI;
    this.desired_angle = angle;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

class Light {

  constructor (pos) {
    this.x = pos[0];
    this.y = pos[1];

    this.createLight();
  }

  /*
    - Draws the light source at the window panel
  */
  createLight() {
    this.element = document.createElement('div');
    this.element.className = 'light';
    this.element.style.left = this.x - 15 + "px";
    this.element.style.top = this.y - 150 + "px";
    document.getElementById('window').appendChild(this.element);
  }
}

/*
  - The function that gets called when someone hovers and clicks on the Window panel
  - Instantiates light object which will draw it on the window panel
*/
function letThereBeLight(event) {
  var x = event.screenX;
  var y = event.screenY;

  var light = new Light([x, y]);
  lights.push(light);

  for(var i = 0; i < vehicles.length; i++) {
    vehicles[i].getDistanceFromLightSource();
  }
}

/*
  - The function that gets called when someone adds a new vehicle
  - Instantiates vehicle object which will draw it on the window panel and control panel
*/
function letThereBeVehicle(event) {
  
  var x = document.getElementById('x-input').value;
  var y = document.getElementById('y-input').value;

  // I decided that 30 looks like a good default value for x and y when
  // there is no input. I need there to be a value in order to calculate distance
  if (x.length == 0 && y.length == 0) {
    x = 30;
    y = 30;
  } else if (x.length == 0) {
    x = 30;
  } else if (y.length == 0) {
    y = 30;
  }

  var vehicle = new Vehicle([parseInt(x), parseInt(y)],`vehicle-${vehicles.length}`);

  // Everything below this line creates a row div and a col div (not important)
  var vehicle_rows_container = document.getElementById("vehicle-rows-container");
  var newRow = document.createElement("div");
  newRow.className = "row";
  newRow.classList.add("vehicle-row");

  vehicles.push(vehicle);

  var newCol = document.createElement("div");
  newCol.id = 'vehicle-col-' + (vehicles.length-1).toString();
  newCol.classList.add("col-lg-12", "text-center");
    
  vehicle_rows_container.append(newRow);
  newRow.appendChild(newCol);
  vehicle_rows_container.insertBefore(newRow, vehicle_rows_container.childNodes[2]);

  vehicle.drawVehicleInControlPanel(vehicles.length-1);
  vehicle.run();
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
