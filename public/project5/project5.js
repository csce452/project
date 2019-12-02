let blocks = []
let start = null;
let dest = null;
const CELL_DIVISION = 50;

function handleClick(e) {
	let x = e.pageX;
	let y = e.pageY;
	console.log("Handling click at ", x, y);
	if (blocks.length < 3) {
		addBlock(x,y);
	}
	else if (start === null) {
		placeStart(x,y);
	}
	else if (dest === null) {
		placeDest(x,y);
	} else {
		console.log("Everything already placed")
		// Testing to check the inside a div function
		let g = new Graph();
		g.navigate();
	}
}

function addBlock (x, y) {
	console.log("Adding block at ", x, y);
	let newBlock = document.createElement("div");
	let className = "block" + blocks.length;
	console.log("Class name: ", className);
	newBlock.classList.add(className);
	newBlock.style.position = "absolute";
	newBlock.style.left = x + 'px';
	newBlock.style.top = y + 'px';

	var window = document.getElementById(`window`);
	window.appendChild(newBlock);
	blocks.push(newBlock);
}

function placeStart (x, y) {
	console.log("Placing start at ", x, y);
	start = document.createElement("div");
	start.classList.add("start");
	start.style.position = "absolute";
	start.style.left = x + 'px';
	start.style.top = y + 'px';

	var window = document.getElementById(`window`);
	window.appendChild(start);
}

function placeDest (x, y) {
	console.log("Placing dest at ", x, y);
	dest = document.createElement("div");
	dest.classList.add("dest");
	dest.style.position = "absolute";
	dest.style.left = x + 'px';
	dest.style.top = y + 'px';

	var window = document.getElementById(`window`);
	window.appendChild(dest);
}

function inABox (x, y) {
	let inBox = false;
	blocks.forEach(block => {
		let rect = block.getBoundingClientRect();
		if (y > rect.top && y < rect.bottom && x > rect.left && x < rect.right) {
			inBox = true;
			return;
		}
	})
	return inBox;
}

class Graph {
	available = [];
	constructor () {
		let d = this.getCell(dest.offsetLeft, dest.offsetTop);
		for (let i = 0; i < 500; i+= CELL_DIVISION) {
			let row = [];
			for(let j = 0; j < 500; j+= CELL_DIVISION) {
				if (inABox(i, j)) {
					row.push(999);
				} else {
					row.push(this.getDist(this.getCell(i,j),d));
				}
			}
			this.available.push(row);
		}
		//this.available[d[0]][d[1]] = 2;
		console.log(this.available);
	}

	getDist(pos1, pos2) {
		let d = Math.floor(Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)));
		// console.log("Dist between ",pos1, pos2, d)
		return d;
	}

	getCell (x, y) {
		// Get the graph placement given an x and y
		return [Math.floor(x/CELL_DIVISION), Math.floor(y/CELL_DIVISION)];
	}	

	navigate () {
		let s = this.getCell(start.offsetLeft, start.offsetTop);
		let d = this.getCell(dest.offsetLeft, dest.offsetTop);
		console.log(s);
		console.log(d);

		let path = [];
		let shortest_path = [];

		let toVisit = [s]
		this.available[s[0]][s[1]] = 999;
		while (toVisit.length !== 0) {
			// for neighbors
			
			this.getNeighbors.forEach(n => {
				if (this.available[n[0]][n[1]] !== 999) {
					this.available[n[0]][n[1]] = 999;
					toVisit.push(n);
				}
				this.available
			});
			// set to 999
			// put into toVisit
			// order?? 
		}
	}

	getNeighbors (x, y) {
		let neighbors = [];
		let max = 500 / CELL_DIVISION;
		if (x+1 < max && y+1 < max) 
			neighbors.push([x+1, y+1]);
		if (x-1 > 0 && y+1 < max) 
			neighbors.push([x-1, y+1]);
		if (x+1 < max && y-1 > 0) 
			neighbors.push([x+1, y-1]);
		if (x-1 > 0 && y-1 > 0) 
			neighbors.push([x-1, y-1]);
		return neighbors;
	}
}