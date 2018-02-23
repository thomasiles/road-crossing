

const area = { width: 5 * 101, height: 6 * 83, rows: 6, cols: 5 }
const block = { width: 101, height: 83 };
const canvas = { width: 505, height: 606 };
var allEnemies = [];

const toMap = (str) => { return str.replace(/\s+/g, '') }
const map = toMap(`wwwww
                   ggggg
                   sssss
                   ggggg
                   sssss
                   ggggg`);

const rocks = toMap(`_____
                     rrr_r
                     _____
                     _____
                     _____
                     _____`);

function clamp(n, min, max) {
    //ensure a value min or greater and max or smaller
    let r = n < min ? min : n;
    r = r > max ? max : r;
    return r;
}

// Enemies our player must avoid
var Enemy = function (row, speed, dir) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.dir = dir;
    this.speed = speed * dir;
    this.row = row;
    if (dir > 0) {
        this.x = - block.width;
        // this.sprite = 'images/enemy-bug.png';
        this.sprite = 'images/enemy-bug.png';
    } else {
        this.x = block.width * 6;
        // this.sprite = 'images/enemy-bug-flipped.png';
        this.sprite = 'images/enemy-bug-flipped.png';
    }
    this.y = block.height * row;
    console.log('y:', this.y);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + (block.width * this.speed * dt);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y - (block.height / 2));
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    //this.sprite = 'images/char-boy.png';
    this.sprite = 'images/char-boy.png';
    this.x = 2 * block.width;
    this.y = 5 * block.height;
    this.xVel = 0;
    this.yVel = 0;
}

Player.prototype.update = function () {
    let x = this.x;
    let y = this.y;

    this.x = clamp(x + (this.xVel * block.width), 0, area.width - block.width);
    this.y = clamp(y + (this.yVel * block.height), 0, area.height - block.height);

    //reset the velocity
    this.xVel = 0;
    this.yVel = 0;

    this.col = Math.floor(this.x / block.width);
    this.row = Math.floor(this.y / block.height);

    const current_grid = map.charAt((this.row * area.cols) + this.col);
    const current_rocks = rocks.charAt((this.row * area.cols) + this.col)
    if (current_grid === 'w' || current_rocks === 'r') {
        this.x = x;
        this.y = y;
    }
}

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - (block.height / 2));
}

Player.prototype.handleInput = function (key) {
    if (key === 'left') {
        this.xVel = -1;
    } else if (key === 'right') {
        this.xVel = 1;
    } else if (key === 'up') {
        this.yVel = -1;
    } else if (key === 'down') {
        this.yVel = 1;
    }
}

Player.prototype.hit = function (enemy) {
    console.log("The player hit an enemy!");
    this.sprite = (this.sprite === 'images/char-boy-box.png') ? 'images/char-boy.png' : 'images/char-boy-box.png';
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var allEnemies = [new Enemy(2, 1, 1), new Enemy(0, 1.5, 1), new Enemy(5, 1.2, -1)];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


var Stage = function () {

}

Stage.prototype.render = function () {
    // Before drawing, clear existing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tile_image = {
        'g': 'images/grass-block.png',
        's': 'images/stone-block.png',
        'w': 'images/water-block.png'
    };


    for (row = 0; row < area.rows; row++) {
        for (col = 0; col < area.cols; col++) {
            const tile = map.charAt((row * area.cols) + col);
            ctx.drawImage(Resources.get(tile_image[tile]), col * 101, row * 83);
        }
    }

    for (row = 0; row < area.rows; row++) {
        for (col = 0; col < area.cols; col++) {
            if (rocks.charAt((row * area.cols) + col) === 'r') {
                ctx.drawImage(Resources.get('images/Rock.png'), col * 101, (row * 83) - (block.height/2));
            }
        }
    }
}

var stage = new Stage();

var Scene = function () {
    this.colliding = [];
}

Scene.prototype.init = function () {

}

Scene.prototype.update = function (dt) {
    allEnemies.forEach(function (enemy) {
        enemy.update(dt);
    });
    player.update();

    var that = this;
    allEnemies.forEach(function (enemy) {
        if ((Math.abs(player.x - enemy.x) < block.width) &&
            (Math.abs(player.y - enemy.y) < block.height)) {
            console.log('Collision!');
            player.hit(enemy);
        }
    });
}

Scene.prototype.render = function () {
    stage.render();

    allEnemies.forEach(function (enemy) {
        enemy.render();
    });

    player.render();
}

Scene.prototype.reset = function () {
    //no-op
}

let scene = new Scene();
let time = 0;
let menu = {
    init: function () {
        //init here
    },
    update: function (dt) {
        //update here
        time += dt;
        if (time > 5) {
            change_scene(scene);
        }
    },
    render: function () {
        //render here
        ctx.font = "48px serif";
        ctx.fillText("Hello world", 50, 100);
    },
    reset: function () {
        //reset
    }
};