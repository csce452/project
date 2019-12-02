let blocks = []
let start = null;
let dest = null;

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
