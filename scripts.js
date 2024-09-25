const WIDTH = 400;
const HEIGHT = 300;

class Pos {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    copy() {
        return new Pos(this.x, this.y);
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    diff(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    multiply(a) {
        this.x *= a;
        this.y *= a;
        return this;
    }
    newMultiply(a) {
        return new Pos(this.x * a, this.y * a);
    }
    newAdd(other) {
        return new Pos(this.x + other.x, this.y + other.y);
    }
    newDiff(other) {
        return new Pos(this.x - other.x, this.y - other.y);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    distance(other) {
        return this.newDiff(other).length();
    }
}

class Game {
    constructor() {
        this.lost = false;
        this.paddle = new Paddle(new Pos(WIDTH / 2, HEIGHT - 20), 40, 10);
        this.bricks = [];
        for (let x = 0; x < 10; ++x) {
            for (let y = 0; y < 6; ++y) {
                this.bricks.push(
                    new Brick(new Pos(x * WIDTH / 10, y * 10), WIDTH / 10, 10)
                );
            }
        }
        this.ball = new Ball(new Pos(WIDTH / 2, HEIGHT - 20 - 6), 6);
    }
    setPaddleX(x) {
        this.paddle.setXY(x);
        if (!this.ball.state) {
            this.ball.setXY(this.paddle.pos.x);
            this.ball.lastPos = this.ball.pos.copy();
        }
    }
    asd(x) {
        this.paddle.setXY(x);
        if (!this.ball.state) {
            this.ball.setXY(this.paddle.pos.x);
            this.ball.lastPos = this.ball.pos.copy();
        }
    }
    start() {
        this.ball.start();
        this.paddle.start();
    }
    step() {
        this.ball.step();

        let bx = this.ball.pos.x;
        let by = this.ball.pos.y;
        let br = this.ball.r;

        // check if the ball hits the paddle
        if (bx >= this.paddle.pos.x - this.paddle.width / 2 - br &&
            bx <= this.paddle.pos.x + this.paddle.width / 2 + br &&
            by >= this.paddle.pos.y - br && by <= this.paddle.pos.y + this.paddle.height + br) {
            console.log('paddle hit');

            let v = this.ball.pos.newDiff(this.ball.lastPos);
            console.log(v);
            v.y = -v.y;
            if (v.y == 0) {
                v.y = -2;
            }

            v.x = (bx - this.paddle.pos.x) / this.paddle.width * 2
                + this.paddle.pos.newDiff(this.paddle.lastPos).x;
            console.log(`---- ${this.paddle.pos.newDiff(this.paddle.lastPos).x}`);

            this.ball.lastPos = this.ball.pos.newDiff(v);
        }

        this.paddle.step();

        // check if the ball hits any of the bricks
        let hit = false;
        for (let brick of this.bricks) {
            if (!brick.state) continue;
            if (bx >= brick.pos.x - br && bx <= brick.pos.x + brick.width + br &&
                by >= brick.pos.y - br && by <= brick.pos.y + brick.height + br) {
                brick.state = 0;
                hit = true;
            }
        }
        if (hit) {
            //  optimally should check the direction, but whatev
            let v = this.ball.pos.newDiff(this.ball.lastPos);
            v.y = -v.y;
            this.ball.lastPos = this.ball.pos.newDiff(v);
        }

        // keep the ball inside the ... field or whatever is it called
        // so basically: bounce back from the walls
        this.lost = !this.ball.keepInside(0, 0, WIDTH, this.paddle.pos.y);
    }
}

class Ball {
    constructor(pos, r) {
        this.pos = pos;
        this.r = r;
        this.state = 0;
        this.lastPos = pos;
    }
    setPos(pos) {
        this.pos = pos;
    }
    setXY(x, y) {
        if (x != null && y != null) {
            this.pos = new Pos(x, y);
        } else if (x != null) {
            this.pos = new Pos(x, this.pos.y);
        }
    }
    start() {
        this.state = 1;
    }
    keepInside(x1, y1, x2, y2) {
        if (this.pos.y + this.r > y2) {
            // the ball fell down
            //  this.state = 0;
            return false;
        }
        if (this.pos.x < x1 + this.r) {
            let v = this.pos.newDiff(this.lastPos);
            v.x = -v.x;
            this.lastPos = this.pos.newDiff(v);
        }
        if (this.pos.x > x2 - this.r) {
            let v = this.pos.newDiff(this.lastPos);
            v.x = -v.x;
            this.lastPos = this.pos.newDiff(v);
        }
        if (this.pos.y < y1 + this.r) {
            let v = this.pos.newDiff(this.lastPos);
            v.y = -v.y;
            this.lastPos = this.pos.newDiff(v);
        }
        return true;
    }
    step() {
        let diff = this.pos.newDiff(this.lastPos);
        this.lastPos = this.pos.copy();
        this.pos.add(diff);
    }
}

class Brick {
    constructor(pos, width, height) {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.state = 1;
    }
}

class Paddle {
    constructor(pos, width, height) {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.lastPos = pos;
        this.state = 0;
    }
    start() {
        this.state = 1;
    }
    setPos(pos) {
        this.pos = pos;
        if (!this.state) {
            this.lastPos = this.pos.copy();
        }
    }
    setXY(x, y) {
        if (x != null && y != null) {
            this.pos = new Pos(x, y);
        } else if (x != null) {
            this.pos = new Pos(
                x,
                this.pos.y
            );
        }

        if (this.pos.x < this.width / 2) {
            this.pos.x = this.width / 2;
        }
        if (this.pos.x > WIDTH - this.width / 2) {
            this.pos.x = WIDTH - this.width / 2;
        }
        if (!this.state) {
            this.lastPos = this.pos.copy();
        }
    }

    step() {
        this.lastPos = this.pos.copy();
    }
}


var game;
var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var timer;

function onLoad() {
    canvas = document.getElementById('cv');
    ctx = canvas.getContext('2d');
    reset();
    // document.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("pointermove", mouseMoveHandler, false);
}

function onCanvasClick() {
    if (!timer) {
        game.start();
        start();
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;
    if (relativeX > 0 && relativeX < canvas.width &&
        relativeY > 0 && relativeY < canvas.height) {
        // e.movementX  

        game.setPaddleX(relativeX);
        redrawGame();
    }
}

function start() {
    clearInterval(timer);
    timer = setInterval(() => {
        game.step();
        game.lost && stop();
        requestAnimationFrame(redrawGame);
    }, 10);
}
function stop() {
    clearInterval(timer);
    timer = null;
}
function reset() {
    game = new Game();
    redrawGame();
}

function redrawGame() {
    clear();
    //
    drawPaddle(game.paddle);
    !game.lost && drawBall(game.ball);
    for (let brick of game.bricks) {
        if (!brick.state) continue;
        drawBrick(brick);
    }
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.fillStyle = '#fafafa66';
    ctx.strokeStyle = '#fafafa88';
    ctx.arc(ball.pos.x, ball.pos.y, ball.r,
        0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawBrick(brick) {
    ctx.beginPath();
    ctx.fillStyle = '#fafafa66';
    ctx.strokeStyle = '#fafafa88';
    ctx.rect(brick.pos.x, brick.pos.y,
        brick.width, brick.height);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawPaddle(paddle) {
    ctx.beginPath();
    ctx.fillStyle = '#fafafa66';
    ctx.strokeStyle = '#fafafa88';
    ctx.rect(paddle.pos.x - paddle.width / 2, paddle.pos.y,
        paddle.width, 10);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function clear() {
    ctx.beginPath();
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#fafafa66';
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}
