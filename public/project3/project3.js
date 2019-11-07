lights = []
vehicles = []
running = false;

function getDistance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0],2 ) + Math.pow(pos1[1] - pos2[1], 2));
}

class Vehicle {

  constructor(pos, k_) {
    this.x = parseInt(pos[0]);
    this.y = parseInt(pos[1]);
    this.k = k_;
    this.heading = 0;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

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

  drawVehicleInWindow(color) {
    var newVehicle = document.createElement('div');
    newVehicle.className = 'vehicle';
    newVehicle.style.left = this.x + "px";
    newVehicle.style.top = this.y + "px";
    newVehicle.style.backgroundColor = color;

    var leftSensor = document.createElement("div");
    leftSensor.className = "lsensor"
    var rightSensor = document.createElement("div");
    rightSensor.className = "rsensor"

    newVehicle.append(leftSensor);
    newVehicle.append(rightSensor);

    this.element = newVehicle;
    document.getElementById('window').appendChild(newVehicle);
  }

  move (time) {
    let s = this.getSensors();
    console.log(s);
    let v1 = parseInt(this.k[0]) * s[0] + parseInt(this.k[1]) * s[1];
    let v2 = parseInt(this.k[2]) * s[0] + parseInt(this.k[3]) * s[1];

    if (Math.abs(v1 - v2) < .00001) {
      // Going straight
      console.log("Straight");
    } else {
      // Circular movement
      let R = 40 / 2 * ((v1 + v2) / (v2 - v1));

      let center_x = this.x - R * Math.sin(this.heading);
      let center_y = this.y + R * Math.cos(this.heading);
      let w = (v2 - v1) / 40;

      let dHeading = w * time;

      this.x = Math.cos(dHeading) * (this.x - center_x) - Math.sin(dHeading) * (this.y - center_y) + center_x;
      this.y = Math.sin(dHeading) * (this.x - center_x) + Math.cos(dHeading) * (this.y - center_y) + center_y;
      this.heading += dHeading;
      console.log("New pos: ", this.x, this.y);
      console.log("New heading: ", this.heading);

      this.element.style.left = `${parseInt(this.x)}px`;
      this.element.style.top = `${parseInt(this.y)}px`;
      this.element.style.transform = `rotate(${this.heading}rad)`;
    }
  }

  getSensors () {
    let d1 = 9999999;
    let d2 = 9999999;
    let s2_location = [this.x + 50 * Math.cos(this.heading) + 10 * Math.sin(this.heading), this.y + 50 * Math.sin(this.heading) + 10 * Math.cos(this.heading)];
    let s1_location = [this.x + 50 * Math.cos(this.heading) + 30 * Math.sin(this.heading), this.y + 50 * Math.sin(this.heading) + 30 * Math.cos(this.heading)];
    lights.forEach(light => {
      let lightPosition = [light.element.offsetLeft, light.element.offsetTop];
      // TODO:  Use direction and heading to simulate the sensors being pointed forward
      let direction = Math.atan2(lightPosition[1] - this.y, lightPosition[0] - this.x);

      let d = getDistance(s1_location, lightPosition);
      if (d < d1) {
        d1 = d;
      }
      d = getDistance(s2_location, lightPosition);
      if (d < d2) {
        d2 = d;
      }
    });
    return [100 / d1, 100 / d2];
  }


}

class Light {

  constructor (pos) {
    this.x = pos[0];
    this.y = pos[1];

    this.createLight();
  }

  createLight() {
    this.element = document.createElement('div');
    this.element.className = 'light';
    this.element.style.left = this.x - 15 + "px";
    this.element.style.top = this.y - 150 + "px";
    document.getElementById('window').appendChild(this.element);
  }
}

function letThereBeLight(event) {
  var x = event.screenX;
  var y = event.screenY;

  var light = new Light([x, y]);
  lights.push(light);
}

function letThereBeVehicle(event) {
  
  var x = document.getElementById('x-input').value;
  var y = document.getElementById('y-input').value;
  let k = [];
  k.push(document.getElementById('k1').value);
  k.push(document.getElementById('k2').value);
  k.push(document.getElementById('k3').value);
  k.push(document.getElementById('k4').value);

  var vehicle = new Vehicle([x, y], k);

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
}

function toggleRun () {
  let runDiv = document.getElementById("toggleRun");
  let time = 10;
  if (running) {
    clearInterval(running);
    running = null;
    runDiv.innerHTML = "Run";
  } else {
    runDiv.innerHTML = "Stop";
    running = setInterval(() => {
      console.log("Running");
      vehicles.forEach(v => {
        v.move(time);
      });
    }, time);
  }
}

// let vehicles = [];
// let lights = [];
// let running;

// class Vehicle {
//   x = 0;
//   y = 0;
//   k = [0,0,0,0];
//   wheelSpeeds = [0,0];
//   constructor(initialPos, ks) {
//     this.x = initialPos[0];
//     this.y = initialPos[1];
//     this.k = ks;
//     this.element = document.createElement('div');
//     this.element.className = 'vehicle';
//     this.element.id = 'vehicle' + vehicles.length;
//     // TODO: this isn't seeming to set x and y correctly
//     this.element.style.left = this.x;
//     this.element.style.top = this.y;
//     document.getElementById('window').appendChild(this.element);
//     this.setupSensors();
//   }

//   setupSensors () {
//     this.s1 = document.createElement('div');
//     this.s1.className = "sensor";
//     this.s1.id = "s1";
//     this.s2 = document.createElement('div');
//     this.s2.className = "sensor";
//     this.s2.id = "s2";
//     this.element.appendChild(this.s1);
//     this.element.appendChild(this.s2);
//   }

//   updateWheelSpeed () {
//     // For each light in lights do calcluations based on p3 equation
//   }
// }

// class Light {
//   x = 0;
//   y = 0;
//   intesity = 0;
//   constructor (pos, intensity_) {
//     this.x = pos[0];
//     this.y = pos[1];
//     this.intensity = intensity_;

//     this.element = document.createElement('div');
//     this.element.className = 'light';
//     this.element.id = 'light' + lights.length;
//     // TODO: this isn't seeming to set x and y correctly
//     this.element.style.left = this.x;
//     this.element.style.top = this.y;
//     document.getElementById('window').appendChild(this.element);
//   }
// }

// function createVehicle (pos, ks) {

//   console.log(pos)
//   let vehicle = new Vehicle(pos, ks);
//   vehicles.push(vehicle);
// }

// function createLight (pos, intensity) {
//   let light = new Light(pos, intensity);
//   lights.push(light);
// }


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
