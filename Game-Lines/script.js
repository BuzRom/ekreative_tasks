const Lines = (function(){
	'use strict';

	// Gets game DOM elements
	const gridElement = document.querySelector('.grid'),
		forecastElement = document.querySelector('.forecast'),
		scoreElement = document.querySelector('.score'),
		recordElement = document.querySelector('.record');

	// Sets default game values
	let grid = [],
		forecast = [],
		score = 0,
		blocked = false,
		selected = null,
		// Tries to get the record from the local storage
		record = localStorage.getItem('lines-record') || 0;

	// Ball colors
	const colors = {
		1: 'blue',
		2: 'cyan',
		3: 'red',
		4: 'brown',
		5: 'green',
		6: 'yellow',
		7: 'magenta',
		key: function(color){
			for (let key in this){
				if (this[key] === color) {
					return parseInt(key);
				}
			}
		}
	};
	
	//Initializes game
	function init(){
		// Generates forecast balls
		forecastBalls();
		// Creates grid
		createGrid();
		scoreElement.innerHTML = score;
		recordElement.innerHTML = record;
	};
	
	//Creates grid
	function createGrid() {
		// Clears grid element
		gridElement.innerHTML = '';
		for (let i=0; i<9; i++) {
			grid[i] = [];
			for (let j=0; j<9; j++) {
				grid[i][j] = 0;
				// Creates new cell
				const cell = document.createElement('div');
				// Sets cell attributes
				cell.id = `cell-${j}-${i}`;
				cell.className = 'empty';
				cell.dataset.x = j;
				cell.dataset.y = i;
				cell.style.left = (j*50)+'px';
				cell.style.top = (i*50)+'px';
				// Adds cell to the grid
				gridElement.appendChild(cell);
				// Listens for a click event
				cell.addEventListener('click', e => {
					if (blocked) {
						return;
					}
					else if (e.currentTarget.className === 'empty') {
						onEmptyCellClick(e);
					}
					else {
						onBallClick(e);
					}
				}, false);
			}
		}
		// Adds random balls on the grid
		addBalls();
	};

	//Gets cells by selector
	function getCells(selector) {
		return gridElement.querySelectorAll(selector);
	};

	//Gets specific cell by x and y coordinates
	function getCell(x, y) {
		return document.getElementById(`cell-${x}-${y}`);
	};

	//Event: ball clicked
	function onBallClick(e) {
		// Unselects previously selected cell
		each(getCells('.ball'), function(cell) {
			if (cell.classList.contains('selected')) {
				cell.classList.remove('selected');
				return;
			}
		});
		// Marks clicked cell as selected
		e.currentTarget.classList.add('selected');
		selected = e.currentTarget;
	};

	//Event: empty cell clicked
	function onEmptyCellClick(e) {
		// Checks if any cell is selected
		if (!selected) {
			return;
		}
		const to = e.currentTarget,
			from = selected;
		// Tries to find the path
		const astar = new Astar(grid);
		const path = astar.find(from.dataset.x, from.dataset.y, to.dataset.x, to.dataset.y);
		// Checks if path were found
		if (path) {
			moveBall(from, to, path, function() {
				const lines = getLines(to);
				// Checks if there are five-ball lines for destination cell
				if (lines) {
					removeLines([lines]);
				}
				else {
					// Adds balls and checks for five-ball lines
					addBalls(function(cells) {
						let lineSets = [];
						for (let i=0; i<cells.length; i++){
							const lines = getLines(cells[i]);
							if (lines) {
								lineSets.push(lines);
							}
						}
						// Checks if five-ball lines are found after adding balls				
						if (lineSets.length > 0) {
							removeLines(lineSets);
						}
						else {
							// Checks if the grid is completely filled with balls
							if (getCells('.empty').length === 0) {
								// Ends the game
								return gameOver();
							}
						}
					});
				}
			});
		}
	};

	//Adds balls on the grid
	function addBalls(callback) {
		blocked = true;
		let cells = [];
		for (let i=0; i<3; i++) {
			const emptyCells = getCells('.empty');
			if (emptyCells.length > 0) {
				// Gets random empty cell
				const cell = emptyCells[rand(0, emptyCells.length-1)];
				grid[cell.dataset.y][cell.dataset.x] = colors.key(forecast[i]);
				cells.push(cell);
				cell.className = `ball ${forecast[i]} fadein`;
			}
			else {
				break;
			}
		}
		// Sets timeout for animation
		setTimeout(function(){
			each(getCells('.fadein'), function(cell) {								
				cell.classList.remove('fadein');
			});
			blocked = false;
			if (callback) {
				return callback(cells);
			}
		}, 300);
		// Generates forecast balls
		forecastBalls();
	};

	//Removes lines
	function removeLines(lineSets) {
		blocked = true;
		let scoreAdd = 0;
		for (let k in lineSets) {
			const lines = lineSets[k];
			for (let i=0; i<lines.length; i++) {
				for (let j=0; j<lines[i].length; j++){
					const x = lines[i][j][0],
						y = lines[i][j][1],
						cell = getCell(x, y);
					cell.classList.add('fadeout');
					grid[y][x] = 0;
					scoreAdd += 2;
				}
			}
		}
		// Updates score
		updateScore(scoreAdd);
		// Sets timeout for animation 
		setTimeout(function() {
			each(getCells('.fadeout'), function(cell) {
				cell.className = 'empty';
			});
			blocked = false;
		}, 300);
	};

	//Moves ball from one cell to another
	function moveBall(from, to, path, callback) {
		blocked = true;
		grid[from.dataset.y][from.dataset.x] = 0;
		const color = from.classList.item(1);
		let previous;
		// Removes selected ball
		from.className = 'empty';
		selected = null;
		for (let i=0; i<=path.length; i++) {
			(function(i) {
				setTimeout(function(){
					if (path.length == i) {
						// Adds ball to destination cell
						grid[to.dataset.y][to.dataset.x] = colors.key(color);
						to.className = `ball ${color}`;
						blocked = false;
						return callback();
					}
					if (previous) {
						previous.className = 'empty';
					}
					const cell = previous = getCell(path[i].x, path[i].y);
					cell.className = `ball ${color}`;
				}, 50*i);
			})(i);
		}
	};

	//Gets lines of 5 or more balls
	function getLines(cell) {
		const x = parseInt(cell.dataset.x),
			y = parseInt(cell.dataset.y),
			ball = colors.key(cell.classList.item(1)),
			lines = [[[x,y]], [[x,y]], [[x,y]], [[x,y]]];
		let	l, r, d, u, lu, ru, ld, rd;
		l = r = d = u = lu = ru = ld = rd = ball;
		let i = 1;
		while ([l,r,u,d,lu,ru,ld,rd].indexOf(ball) !== -1) {
			// Horizontal lines
			if(l==grid[y][x-i]){lines[0].push([x-i,y]);} else {l = -1;}
			if(r==grid[y][x+i]){lines[0].push([x+i,y]);} else {r = -1;}
			
			// Vertical lines
			if(y-i>=0 && u==grid[y-i][x]){lines[1].push([x,y-i]);} else {u = -1;}
			if(y+i<=8 && d==grid[y+i][x]){lines[1].push([x,y+i]);} else {d = -1;}

			// Diagonal lines
			if(y-i>=0 && lu==grid[y-i][x-i]){lines[2].push([x-i,y-i]);} else {lu = -1;}
			if(y+i<=8 && rd==grid[y+i][x+i]){lines[2].push([x+i,y+i]);} else {rd = -1;}
			if(y+i<=8 && ld==grid[y+i][x-i]){lines[3].push([x-i,y+i]);} else {ld = -1;}
			if(y-i>=0 && ru==grid[y-i][x+i]){lines[3].push([x+i,y-i]);} else {ru = -1;}

			i++;
		}
		for (let i = lines.length-1; i>=0; i--) {
			if (lines[i].length < 5) {
				lines.splice(i, 1);
			}
		}
		// Returns five-ball lines or false
		return (lines.length > 0) ? lines : false;
	};

	//Generates 3 forecast balls
	function forecastBalls() {;
		forecastElement.innerHTML = '';
		for (let i=0; i<3; i++){
			const ball = document.createElement('div');
			forecast[i] = colors[rand(1, 7)];
			ball.className = `ball ${forecast[i]}`;
			forecastElement.appendChild(ball);
		}
	};

	//Updates score
	function updateScore(add) {
		score += add;
		// Checks if record is beaten
		if (score > record) {
			localStorage.setItem('lines-record', score);
			recordElement.innerHTML = record = score;
		}
		scoreElement.innerHTML = score;
	};

	//Shows game over alert
	function gameOver() {
		blocked = true;
		// Shows score and offers to play again
		if (confirm(`Game over! Your score is ${score}! Play again?`)) {
			init();
		}
	};

	//Generates random number between specified interval
	function rand(from, to) {
		return (Math.floor(Math.random() * (to-from+1)) + from);
	};

	//Goes through all objects
	function each(object, callback) {
		for (let i=0; i<object.length; i++) {
			callback(object[i], i);
		}
	};

	//Returns public methods
	return {
		init: init
	};

	//Finds path by using A* method
	function Astar(grid) {
		let nodes = [],
			openset = [];
		//Initializes all nodes
		function init(startX, startY) {
			for (let i=0; i<9; i++) {
				nodes[i] = [];
				for (let j=0; j<9; j++) {
					nodes[i][j] = {obstacle: grid[i][j], parent:0, f:0, g:0, h:0, x:j, y:i, closed: false};
				}
			}
			// Adds start node to the openset
			openset.push(nodes[startY][startX]);
		};

		//Finds the path
		function find(startX, startY, endX, endY) {
			init(startX, startY);
			// Goes through all open nodes
			while (openset.length) {
				let index = 0;
				// Finds the node index with the highest F value
				for (let i=0; i<openset.length; i++) {
					if(openset[i].f < openset[index].f) {
						index = i;
					}
				}
				const currentNode = openset[index];
				// Checks if the end node is reached
				if (currentNode.x == endX && currentNode.y == endY){
					return reconstructPath(currentNode);
				}
				// Removes current node from openlist and sets it as closed
				openset.splice(index, 1);
				currentNode.closed = true;

				// Get all adjecent nodes
				const neighbors = getNeighbors(currentNode);
				for (let i=0; i<neighbors.length; i++){
					const neighbor = neighbors[i];
					// Checks if adjecent node is closed or it's not walkable
					if (neighbor.closed || neighbor.obstacle != 0) {
						continue;
					}
					const g = currentNode.g+1;
					let gIsBest = false;
					// Checks if node isn't opened yet
					if (!isOpened(neighbor)) {
						gIsBest = true;
						neighbor.h = Math.abs(neighbor.x-endX) + Math.abs(neighbor.y-endY);
						openset.push(neighbor);
					}
					else if (g < neighbor.g) {
						gIsBest = true;
					}
					if (gIsBest) {
						neighbor.parent = currentNode;
						neighbor.g = g;
						neighbor.f = neighbor.g + neighbor.h;
					}
				}
			};
			// Path is not found
			return false;
		};

		//Reconstructs path
		function reconstructPath(node){
			let path = [];
			while (node.parent) {
				path.push(node);
				node = node.parent;
			}
			return path.reverse();
		};

		//Gets neighbor nodes
		function getNeighbors(node) {
			const x = node.x,
				y = node.y;
			let neighbors = [];
			if (y-1>=0) {neighbors.push(nodes[y-1][x]);}
			if (y+1<=8) {neighbors.push(nodes[y+1][x]);}
			if (x-1>=0) {neighbors.push(nodes[y][x-1]);}
			if (x+1<=8) {neighbors.push(nodes[y][x+1]);}

			return neighbors;
		};

		//Checks if node is opened
		function isOpened(node) {
			for (let i=0; i<openset.length; i++) {
				if (openset[i].x == node.x && openset[i].y == node.y) {
					return true;
				}
			}
			return false;
		};

		//Returns public methods
		return {
			find: find
		};
	}
}());

Lines.init();
