/**
 * Vanilla JS Breakout
 * 
 * @author Andrew Miller
 * @author Elijah Seymour
 */
class CanvasManager{
  /*
   * @class CanvasManager
   * @param {Object} canvas - our canvas element
   *
   * Manages the Canvas and handles resizing
   * Creates a reference to our canvas and context
   */  
   constructor(canvas){
     this.canvas = canvas;
     this.ctx = this.canvas.getContext('2d');
     this.safeWidth = canvas.width;
     this.safeHeight = canvas.height;
     window.addEventListener('resize', resizeGame.bind(this)); /* global resizeGame */
     resizeGame.apply(this);
   }
}
class GameObject{
  /**
   * @class GameObject
   * @param {Number} x - position x
   * @param {Number} y - position y
   * @param {Number} w - width
   * @param {Number} h - height
   * @param {Object} sprite - sprite object
   * 
   * Creates a new GameObject and gives generic access to inherited helper functions
   */  
  constructor(x, y, w, h, sprite = {}){
    this.size = { w: w, h: h };
    this.pos = { x: x, y: y };
    this.prev = {x: x, y: y, w: w, h: h };
    this.sprite = sprite;
  }
  get top(){
    return this.pos.y;
  }
  get right(){
    return this.pos.x + this.size.w;
  }
  get bottom(){
    return this.pos.y + this.size.h;
  }
  get left(){
    return this.pos.x;
  }
  /**
   * draw()
   * @param {Object} ctx - canvas context
   *
   * Render a GameObject on the canvas
   */
  draw(ctx){
    if ( this.pos.x != this.prev.x ||
          this.pos.y != this.prev.y ||
          this.size.w != this.prev.w ||
          this.size.h != this.prev.h ) {
      this.clear(ctx);
    }
    ctx.drawImage(
      SpriteMap.sheet,
      this.sprite.x,
      this.sprite.y,
      this.sprite.w,
      this.sprite.h,
      this.pos.x,
      this.pos.y,
      this.size.w,
      this.size.h
    );
  }
  /**
   * clear()
   * @param {Object} ctx - canvas context
   *
   * remove a GameObject from the canvas
   */
  clear(ctx){
    ctx.fillStyle = "pink";
    ctx.fillRect(this.prev.x, this.prev.y, this.prev.w, this.prev.h);
    ctx.clearRect(this.prev.x, this.prev.y, this.prev.w, this.prev.h);
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
    this.prev.w = this.size.w;
    this.prev.h = this.size.h;
  }
  /**
   * checkCollision
   * @param {Object} gameObject - any game object
   * 
   * check if GameObject collides with another GameObject
   * also inception
   * also i put inception in your inception so you could inception
   * ...while you inception
   */
  checkCollision(gameObject){
    if ( this.top < gameObject.bottom &&
          this.right > gameObject.left &&
          this.bottom > gameObject.top &&
          this.left < gameObject.right ) {
      return true;
    }
    return false;
  }
}
class Brick extends GameObject{
  /**
   * @class   Brick
   * @extends GameObject
   * @param {Object} sprite - sprite object
   * @param {Number} x - position x
   * @param {Number} y - position y
   * @param {Number} type - type of brick
   * @param {Number} power - power up
   * @param {Bool} breakable - is brick breakable? true/fase
   * @param {Number} bp - hitpoints
   * 
   * Create a new Brick that extends the GameObject class
   */
  constructor(sprite, x, y, type, power, breakable, hp){
    super(x, y, sprite.w, sprite.h, sprite);
    this.breakable = breakable;
    this.power = power;
    this.type = type;
    this._hp = hp;
  }
  /**
   * hit()
   * 
   * Do hit stuff
   */
   hit(){
     if(this.type == 'normal' || this.type == 'star'){
       // These types only ever have 0HP, break block
     }else{
       let typeMap = ['normal', 'shield1', 'shield2', 'shield3'];
       this.hp -= 1;
       this.type = typeMap[this.hp];
     }
   }

  /**
   * draw()
   * @param {Object} ctx - canvas context
   * 
   * Draw Brick to canvas
   */
  draw(ctx){
    // Draw Background Color
    ctx.fillStyle = this.sprite.color;
    ctx.fillRect(this.pos.x + 1, this.pos.y + 1, this.size.w - 2, this.size.h -2);
    // Call Super.Draw() to draw overlay
    super.draw(ctx);
  }

}
class Ball extends GameObject{
  /**
   * @class   Ball
   * @extends GameObject
   * @param {Object} sprite - sprite object
   * @param {Number} x - position x
   * @param {Number} y - position y
   * 
   * Create a new Ball that extends the GameObject class
   */  
  constructor(sprite, x, y ){
    super(x, y, 20, 20, sprite);
    this.velocity = {x: 50, y: -50};
  }
  /**
   * update()
   * @param {Number} modifier - a speed modifier
   *
   * Update the position of the ball
   */
  update(modifier){
    this.pos.x += Math.round(this.velocity.x * modifier);
    this.pos.y += Math.round(this.velocity.y * modifier);
  }
  /**
   * checkCollision()
   * @param {Object} gameObject - any GameObject
   *
   * Check if the Ball collides with another GameObject
   */
  checkCollision(gameObject){
    if ( super.checkCollision(gameObject) ) {
      if(gameObject instanceof Brick){
        if ( this.pos.y < gameObject.pos.y - (gameObject.size.h / 2) ||
              this.pos.y > gameObject.pos.y + (gameObject.size.h / 2) ) {
          this.velocity.y =  -1 * this.velocity.y;
        } else {
          this.velocity.x = -1 * this.velocity.x;
        }
      }
      return gameObject;
    }
  }
}
class Paddle extends GameObject{
  /**
   * @class   Paddle
   * @extends GameObject
   * @param {Object} sprite - sprite object
   * @param {Number} x - position x
   * @param {Number} y - position y
   *
   * Create a new Paddle that extends the GameObject class
   */  
  constructor(sprite, x, y){
    super(x, y, sprite.w, sprite.h, sprite);
    this.velocity = {x: 100, y: 0};
  }
  /**
   * move()
   * @param {Number} modifier - speed modifier
   * 
   * Moves the paddles position on the canvas
   */
  move(modifier){
    if ( 37 in keysDown ) // player going left
      this.pos.x -= Math.round(this.velocity.x * modifier);
    if ( 39 in keysDown ) // player going right
      this.pos.x += Math.round(this.velocity.x * modifier);
  }  
}
class LevelManager{
  /**
   * @class LevelManager
   *
   * Manages state for which level we are currently on
   */  
  constructor(){
    this.levels = [];  
  }
  /**
   * level()
   *
   * Get the current level
   */
  get level(){
    if ( this.levels.length === 0 ) {
      return false;
    } else {
      return this.levels[0];  
    }
  }
  /**
   * reset()
   *
   * Reset the LevelManager
   */
  reset(){
    this.levels = [];
  }
  /**
   * parseBrick()
   * @param {Object} brickObj - bricks are objects too
   * 
   * Bricks are for parsing
   */
  parseBrick(brickObj){
    //[{"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":50,"y":100},
    //sprite, x, y, health = 1, breakable = true, powerup = 0
    
    let typeMap = ["normal", "shield1", "shield2", "shield3", "star"];
    let powerMap = ["none", "slow", "fast", "expand", "contract", "star"];
    
    let size = brickObj.s == 0 ? 'half' : 'full';
    let hp = brickObj.t > 3 ? 0 : brickObj.t;
    let type = typeMap[brickObj.t];
    let power = powerMap[brickObj.p];
    let breakable = brickObj.b == 1 ? true : false;
    let sprite = SpriteMap.bricks[size][type];
    sprite.color = brickObj.color;
    
    return new tBrick(sprite, brickObj.x, brickObj.y, type, power, breakable, hp);
    
  }
  /**
   * add()
   * @param {Array} level - add a multidimensional array to our levels array.
   *
   * Add a new level to the LevelManager
   */
  add(level){
    let tLevel = [];
    for(let brick of level){
      tLevel.push(this.parseBrick(brick));
    }
    this.levels.push(tLevel);
  }
  /**
   * next()
   *
   * Remove the current level so that the next one can be called
   */
  next(){
    this.levels.shift();
  }
}
class Game{
  /**
   * @class Game
   * @param {Object} canvasManager - Our CanvasManager Class
   * @param {Object} levelManager - Our LevelManager Class
   * 
   * Creates an instance of our game
   */  
  constructor(canvasManager, levelManager){
    this.lm = levelManager;
    this.cm = canvasManager;
    this.timestep = 1000 / 60;
    this.maxfps = 60;
    this.then = performance.now() || Date.now(); /* global performance */
    this.window = { w: 1250, h: 720 };
    this.playArea = { x: 0, y: 0, w: 0, h: 0 };
    this.ball = undefined;
    this.paddle = undefined;
    this.bricks = [];
    this.gameState = 0;
  }
  /**
   * reset()
   *
   * Reset our game to a default state so that we can start a new game
   */
  reset(){
    // reset our LevelManager
    this.lm.reset();
    // add some levels
    this.lm.add([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]]);
    this.lm.add([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]]);
    this.lm.add([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3]]);
    this.lm.add([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4]]);    
    this.lm.add([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5]]);  
    // clear our ball and paddle cause we are gonna redraw
    this.ball.clear(this.cm.ctx);
    this.paddle.clear(this.cm.ctx);
    // set to undefined
    this.ball = undefined;
    this.paddle = undefined;
    // reset our bricks array
    this.bricks = [];
    // reset gameState as we will be stepping through start
    this.gameState = 0;
    this.start();
  }
  /**
   * nextLevel()
   *
   * Cleanly iterate through levels using LevelManager class
   */
  nextLevel(){
    // clear the ball and paddle from the screen since we are going to redraw it
    this.ball.clear(this.cm.ctx);
    this.paddle.clear(this.cm.ctx);
    // set undefined, why? whynot
    this.ball = undefined;
    this.paddle = undefined;
    // reset our gameState as we are stepping back through start()
    this.gameState = 0;
    // tell the LevelManager to remove the current level and get ready for the next
    this.lm.next();
    // start-o!
    this.start();
  }
  /**
   * start()
   *
   * Start the level
   */
  start(){
    this.ball = new Ball(SpriteMap.ball.fast, this.cm.canvas.width / 2, this.cm.canvas.height - 190);
    this.paddle = new Paddle(SpriteMap.paddle.normal,(this.cm.canvas.width / 2) - 35,(this.cm.canvas.height - 160));
    this.cm.ctx.drawImage(SpriteMap.sheet, 0, 240, 350, 150, (this.cm.canvas.width / 2) - 175,(this.cm.canvas.height / 2) - 75, 350, 150);
    // this.lm.level will always point to index 0 of
    // our levels array from our LevelManager
    // unless there is no level left then it will return false
    this.buildLevel(this.lm.level);
    this.gameState++;
    this.loop();
  }
  /**
   * loop()
   * 
   * Main game loop
   */
  loop(){
    let now = performance.now() || Date.now();
    if ( now < this.then + (1000 / this.maxfps) )
      return window.requestAnimationFrame(this.loop.bind(this));
    let delta = now - this.then;
    this.then = now;
    delta += this.timestep;
    while ( delta >= this.timestep ) {
      this.update(delta);
      delta -= this.timestep;
    }
    this.render();
    return window.requestAnimationFrame(this.loop.bind(this));
  }
  /**
   * update()
   * @param {Number} modifier - a speed modifier
   * 
   * Handles all the changing pieces of the game
   */
  update(modifier){
    modifier /= 500;
    if ( this.bricks.length === 0 ) {
      // if player won
      if ( this.lm.level === false ) {
        // no levels left start game over
        this.reset();
      } else {
        // next level!!
        this.nextLevel();
      }
    } 
    if ( this.ball.pos.y > this.paddle.bottom + (this.paddle.size.h * 2) ) {
      // player lost, start game over
      this.reset();
    }
    this.setBounds(this.paddle);
    // manage game state
    switch ( this.gameState ) {
      case 1:
        this.ball.pos.x = this.paddle.pos.x + this.paddle.size.w / 2.5;
        this.ball.pos.y = this.paddle.pos.y - this.ball.size.h;
        // launch ball
        if ( this.gameState === 1 ) {
          if ( 40 in keysDown ) {
            this.cm.ctx.clearRect(
              (this.cm.canvas.width / 2) - 175,
              (this.cm.canvas.height / 2) - 75,
              350, 150
            );          
            this.gameState++;
          }        
        }
        this.paddle.move(modifier);
        break;
      case 2:
        this.ball.update(modifier);
        this.tmpWallCollision(this.ball, modifier);
        if ( this.ball.checkCollision(this.paddle) ) {
          this.ball.pos.y = this.paddle.pos.y - this.ball.size.h;
          this.ball.velocity.y = -1 *this.ball.velocity.y;
        }
        for ( let i = 0; i < this.bricks.length; i++ ) {
          if ( this.ball.checkCollision(this.bricks[i]) instanceof Brick ) {
            this.bricks[i].clear(this.cm.ctx);
            this.bricks.splice(i, 1);
          }
        }
        this.paddle.move(modifier);
        break;
    }
  }
  /**
   * render()
   *
   * Render to canvas
   */
  render(){
    this.ball.draw(this.cm.ctx);
    this.paddle.draw(this.cm.ctx);
    for ( let brick of this.bricks )
      brick.draw(this.cm.ctx);
  }
  /**
   * setBounds()   
   * @param {Object} gameObject - Any GameObject
   *
   * Set bounds for a gameObject the object cannot cross
   */
  setBounds(gameObject){
    if ( gameObject.pos.x >= this.cm.canvas.width - gameObject.size.w )
      gameObject.pos.x = this.cm.canvas.width - gameObject.size.w;
    if ( gameObject.pos.x <= 0 )
      gameObject.pos.x = 1;
  }
  /**
   * buildLevel()
   * @param {Array} level - A multi-dimension array of level data
   *
   * Builds a level from an array
   */
  buildLevel(level){
    for ( let i = 0; i < level.length; i++ ) {
      for( let j = 0; j < level[i].length; j++ ) {
        let tlevel = level[i][j];
        if ( tlevel !== 0 ) {
          let brickColor = SpriteMap.bricks._map[tlevel - 1];
          let sprite = SpriteMap.bricks[brickColor];
          this.bricks.push(new Brick(
              sprite,
              (sprite.w * (j + 1)) - sprite.w,
              (sprite.h * (i + 1)) - sprite.h
          ));
        }
      }
    }
  }
  /**
   * tmpWallCollision()
   *
   * Handle collisions to the 4 walls
   */
  tmpWallCollision(gameObject, modifier){
    if ( gameObject.left < 0 ) {
      gameObject.pos.x = 0;
      gameObject.velocity.x = -1 * gameObject.velocity.x;
    } else if ( gameObject.right > this.cm.canvas.width){
      gameObject.pos.x = this.cm.canvas.width - gameObject.size.h;
      gameObject.velocity.x = -1 * gameObject.velocity.x;
    }
    if ( gameObject.top < 0 ) {
      gameObject.pos.y = 0;
      gameObject.velocity.y = -1 * gameObject.velocity.y;
    } else if ( gameObject.bottom > this.cm.canvas.height ) {
      gameObject.pos.y = this.cm.canvas.height - gameObject.size.h;
    }
  }  
}
/***************************************************************************************************************************/
/*
const SpriteMap = {
  sheet: undefined,
  bricks: {
    _size: {w: 50, h: 30},
    _map: ["red", "rose", "pink", "purple", "berry",
           "blue", "sapphire", "sky", "arctic", "seafoam",
           "green", "olive", "yellow", "orange", "white"],
    red: {x: 0, y: 0, w: 50, h: 30},
    rose: {x: 50, y: 0, w: 50, h: 30},
    pink: {x: 100, y: 0, w: 50, h: 30},
    purple: {x: 150, y: 0, w: 50, h: 30},
    berry: {x: 200, y: 0, w: 50, h: 30},
    blue: {x: 250, y: 0, w: 50, h: 30},
    sapphire: {x: 300, y: 0, w: 50, h: 30},
    sky: {x: 0, y: 0, w: 50, h: 30},
    arctic: {x: 50, y: 30, w: 50, h: 30},
    seafoam: {x: 100, y: 30, w: 50, h: 30},
    green: {x: 150, y: 30, w: 50, h: 30},
    olive: {x: 200, y: 30, w: 50, h: 30},
    yellow: {x: 250, y: 30, w: 50, h: 30},
    orange: {x: 300, y: 30, w: 50, h: 30},
    white: {x: 350, y: 30, w: 50, h: 30},
  },
  paddle: {
    small: {x: 1, y: 175, w: 50, h: 60},
    normal: {x: 1, y: 191, w: 100, h: 16},
    large: {x: 1, y: 207, w: 200, h: 16}
  },
  ball: {
    normal: {x: 0, y: 120, w: 24, h: 24},
    slow: {x: 24, y: 120, w: 24, h: 24},
    fast: {x: 48, y: 120, w: 24, h: 24}
  }
};
*/
const SpriteMap = {
  sheet: undefined,
  logo: {x: 50, y: 0, w:320, h: 130},
  bricks: {
    full: {
      normal: {x: 222, y: 0, w: 50, h: 25},
      shield1: {x: 72, y: 0, w: 50, h: 25},
      shield2: {x: 122, y: 0, w: 50, h: 25},
      shield3: {x: 172, y: 0, w: 50, h: 25},
      star: {x: 0, y: 25, w: 50, h: 25}
    },
    half: {
      normal: {x: 100, y: 25, w: 50, h: 25},
      shield1: {x: 272, y: 0, w: 50, h: 25},
      shield2: {x: 50, y: 25, w: 50, h: 25},
      shield3: {x: 75, y: 25, w: 50, h: 25},
      star: {x: 125, y: 25, w: 50, h: 25}
    }
  },
  powers:{
    slow: {x: 198, y: 180, w: 24, h: 24},
    fast: {x: 222, y: 180, w: 24, h: 24},
    expand: {x: 174, y: 180, w: 24, h: 24},
    contract: {x: 150, y: 180, w: 24, h: 24},
    star: {x: 246, y: 180, w: 24, h: 24}
  },
  paddle: {
    small: {x: 250, y: 25, w: 50, h: 60},
    normal: {x: 150, y: 25, w: 100, h: 16},
    large: {x: 0, y: 180, w: 200, h: 16}
  },
  ball: {
    normal: {x: 24, y: 0, w: 24, h: 24},
    slow: {x: 48, y: 0, w: 24, h: 24},
    fast: {x: 0, y: 0, w: 24, h: 24}
  }
};
/***************************************************************************************************************************/
let canvasManager = new CanvasManager(document.querySelector("#canvas"));
let levelManager = new LevelManager();
let breakout = new Game(canvasManager, levelManager);
let keysDown = {};
assetLoader.finished = function(){ /* global assetLoader */
  SpriteMap.sheet = assetLoader.imgs.ts;
  breakout.start();
};
assetLoader.downloadAll();
/***************************************************************************************************************************/
window.addEventListener("keydown", function(e){
  if ( e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 40 )
    keysDown[e.keyCode] = true;
});
window.addEventListener("keyup", function(e){
  if ( keysDown[e.keyCode] === true )
    delete keysDown[e.keyCode];
});
document.getElementById("newgame").addEventListener('click', function(){
      breakout.reset();
});
/***************************************************************************************************************************/
