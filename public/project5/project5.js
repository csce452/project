let blocks = []
let start = null;
let dest = null;
const CELL_DIVISION = 5;

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

class Node {
	constructor (key_, x_range_, y_range_) {
		this.key = key_;
		this.x_range = x_range_;
		this.y_range = y_range_;
		this.neighbors = [];
		this.center_y = Math.abs(this.y_range[0] - this.y_range[1]);
	}

	addNeighbor(neighbor) {
		this.neighbors.push(neighbor);
	}
}

class Graph {
	nodes = {};
	constructor () {
		for (let i = 0; i < 500/CELL_DIVISION; i++) {
			let ranges = [];
			let range_start = undefined;
			
			let j = 0;
			for(; j < 500/CELL_DIVISION; j++) {
				if (!inABox(i*CELL_DIVISION,j*CELL_DIVISION) && range_start === undefined) {
					// start of range
					range_start = j;
				}
				if (inABox(i*CELL_DIVISION,j*CELL_DIVISION) && range_start !== undefined) {
					// end of range
					ranges.push([range_start, j]);
					range_start = undefined;
				}
			}
			if (range_start !== undefined) {
				ranges.push([range_start, j]);
			}
			ranges.forEach(range => {
				let key = (i*100) + range[0];
				let node = new Node(key, [i, i+1], range);
				Object.values(this.nodes).forEach(n => {
					if (Math.floor(n.key/100) === i-1) {
						// Is in row above
						if ((n.y_range[0] <= range[0] && n.y_range[1] > range[0]) || (n.y_range[1] >= range[1] && n.y_range[0] < range[1]) ){
							n.neighbors.push(key);
							node.neighbors.push(n.key);
						}
					}
				});
				this.nodes[key] = node;
			})
		}
		console.log(this.nodes);
	}

	getDist(pos1, pos2) {
		let d = Math.floor(Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)));
		// console.log("Dist between ",pos1, pos2, d)
		return d;
	}

	getCell (x, y) {
		// Get the graph placement given an x and y
		let i = Math.floor(x/CELL_DIVISION);
		let j = Math.floor(y/CELL_DIVISION);
		console.log(i, j);
		let key = null;
		Object.values(this.nodes).forEach(n => {
			// console.log(n.x_range, n.y_range)
			if (n.x_range[0] <= i && n.x_range[1] >= i && n.y_range[0] <= j && n.y_range[1] >= j) {
				key = n.key;
			}
		});
		return key;
	}	

	minIndex (distances, set) {
		let min = 9999;
		let min_key;

		Object.keys(this.nodes).forEach(n => {
			if (distances[n] < min && set[n] === false) {
				min_key = n;
				min = distances[n];
			}
		});

		return min_key;
	}

	navigate () {
		let s = this.getCell(start.offsetLeft, start.offsetTop);
		let d = this.getCell(dest.offsetLeft, dest.offsetTop);
		let keys = Object.keys(this.nodes);
		
		// Djikstras from s to d
		// this.nodes is the graph
		let set = {};
		let distances = {};
		let path = {};

		keys.forEach(key => {
			set[key] = false;
			distances[key] = 9999;
			path[key] = [];
		});

		distances[s] = 0;

		for (let count = 0; count < keys.length - 1; count++) {
			let u = this.minIndex(distances, set);
			set[u] = true;

			keys.forEach(v => {
				if (set[v] === false && this.nodes[v].neighbors.includes(parseInt(u)) && distances[u] !== 9999) {
					let d = Math.abs(this.nodes[v].center_y - this.nodes[u].center_y);
					if (d + distances[u] < distances[v]) {
						distances[v] = distances[u] + d;
						path[v] = JSON.parse(JSON.stringify(path[u]));
						path[v].push(u);
					}
				}
			})
		}

		console.log("Path: ", path[d]);
		this.showPath(path[d])
	}

	showPath (path) {
		path.forEach(key => {
			let n = this.nodes[key];
			let p = document.createElement("div");
			p.classList.add('path');
			p.style.position = "absolute";
			p.style.left = (n.x_range[0] * CELL_DIVISION) + 'px';
			p.style.top = (n.y_range[0] * CELL_DIVISION) + 'px';
			p.style.height = ((n.y_range[1] - n.y_range[0]) * CELL_DIVISION) + 'px';
			p.style.width = ((n.x_range[1] - n.x_range[0]) * CELL_DIVISION) + 'px';

			var window = document.getElementById(`pathPlacement`);
			window.appendChild(p);
		})
	}

}