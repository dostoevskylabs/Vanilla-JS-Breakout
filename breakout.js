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
   * @param {String} color - RGB Hex value
   * 
   * Create a new Brick that extends the GameObject class
   */
  constructor(sprite, x, y, type, power, breakable, color){
    super(x, y, sprite.w, sprite.h, sprite);
    let baseHp = {normal: 0, star: 0, shield1: 1, shield2: 2, shield3: 3};
    this.color = color;
    this.breakable = breakable;
    this.power = power;
    this.type = type;
    this.hp = baseHp[this.type];
  }
  /**
   * hit()
   * 
   * Do hit stuff
   */
   hit(){
     if ( this.type == 'normal' || this.type == 'star' ) {
       // These types only ever have 0HP, break block
       // Something should go here, not sure what yet.. lol
     } else {
       let typeMap = ['normal', 'shield1', 'shield2', 'shield3'];
       this.hp -= 1;
       this.type = typeMap[this.hp];
       this.sprite = SpriteMap.bricks[this.sprite.w][this.type];
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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x + 1, this.pos.y + 1, this.size.w - 2, this.size.h -2);
    // Call super.draw() to draw overlay
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
    let typeMap = ["normal", "shield1", "shield2", "shield3", "star"];
    let powerMap = ["none", "slow", "fast", "expand", "contract", "star"];
    let size = brickObj.s == 0 ? 'half' : 'full';
    let hp = brickObj.t > 3 ? 0 : brickObj.t;
    let type = typeMap[brickObj.t];
    let power = powerMap[brickObj.p];
    let breakable = brickObj.b == 1 ? true : false;
    let sprite = SpriteMap.bricks[size][type];
    return new Brick(sprite, brickObj.x, brickObj.y, type, power, breakable, brickObj.c);
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
    this.frame = undefined;
    //this.bricks = [];
    this.gameState = 0;
  }
  /**
   * init()
   *
   * Initialize our game to a default state so that we can start a new game
   */
  init(){
    // reset our LevelManager
    this.lm.reset();
    // add some levels
    this.lm.add([{"c":"#997377","t":0,"b":1,"p":0,"s":1,"x":1200,"y":50}]);
    this.lm.add([
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":50,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":100,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":150,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":200,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":250,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":300,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":350,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":400,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":450,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":500,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":550,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":600,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":650,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":700,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":750,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":800,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":850,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":900,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":950,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1000,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1050,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1100,"y":50},
      {"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1150,"y":50},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":50,"y":175},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":100,"y":175},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":175,"y":175},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":225,"y":175},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":300,"y":175},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":350,"y":175},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":425,"y":175},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":475,"y":175},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":550,"y":175},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":600,"y":175},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":675,"y":175},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":700,"y":175},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":750,"y":175},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":775,"y":175},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":825,"y":175},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":850,"y":175},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":900,"y":175},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":925,"y":175},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":975,"y":175},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":1000,"y":175},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":50,"y":200},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":100,"y":200},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":175,"y":200},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":225,"y":200},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":300,"y":200},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":350,"y":200},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":425,"y":200},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":475,"y":200},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":550,"y":200},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":600,"y":200},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":675,"y":200},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":700,"y":200},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":750,"y":200},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":775,"y":200},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":825,"y":200},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":850,"y":200},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":900,"y":200},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":925,"y":200},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":975,"y":200},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":1000,"y":200},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":50,"y":225},
      {"c":"#d93333","t":0,"b":1,"p":0,"s":1,"x":100,"y":225},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":175,"y":225},
      {"c":"#d9337d","t":1,"b":1,"p":0,"s":1,"x":225,"y":225},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":300,"y":225},
      {"c":"#d933c0","t":2,"b":1,"p":0,"s":1,"x":350,"y":225},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":425,"y":225},
      {"c":"#a033d9","t":3,"b":1,"p":0,"s":1,"x":475,"y":225},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":550,"y":225},
      {"c":"#3b33d9","t":4,"b":1,"p":0,"s":1,"x":600,"y":225},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":675,"y":225},
      {"c":"#3362d9","t":0,"b":1,"p":0,"s":0,"x":700,"y":225},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":750,"y":225},
      {"c":"#339cd9","t":1,"b":1,"p":0,"s":0,"x":775,"y":225},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":825,"y":225},
      {"c":"#33cfd9","t":2,"b":1,"p":0,"s":0,"x":850,"y":225},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":900,"y":225},
      {"c":"#33d98d","t":3,"b":1,"p":0,"s":0,"x":925,"y":225},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":975,"y":225},
      {"c":"#33d93f","t":4,"b":1,"p":0,"s":0,"x":1000,"y":225}
    ]);
    this.start();
  }
  /**
   * start()
   *
   * Start the level
   */
  start(){
    if ( this.frame !== undefined ) window.cancelAnimationFrame(this.frame);
    this.gameState = 0;
    this.cm.ctx.clearRect(0, 0, this.cm.canvas.width, this.cm.canvas.height);
    this.ball = new Ball(SpriteMap.ball.fast, this.cm.canvas.width / 2, this.cm.canvas.height - 190);
    this.paddle = new Paddle(SpriteMap.paddle.normal,(this.cm.canvas.width / 2) - 35,(this.cm.canvas.height - 160));
    this.cm.ctx.drawImage(SpriteMap.sheet, 0, 240, 350, 150, (this.cm.canvas.width / 2) - 175,(this.cm.canvas.height / 2) - 75, 350, 150);
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
    if ( now < this.then + (1000 / this.maxfps) ){
      this.frame = window.requestAnimationFrame(this.loop.bind(this));
      return this.frame;
    }
    let delta = now - this.then;
    this.then = now;
    delta += this.timestep;
    while ( delta >= this.timestep ) {
      this.update(delta);
      delta -= this.timestep;
    }
    this.render();
    this.frame = window.requestAnimationFrame(this.loop.bind(this));
    return this.frame;
  }
  /**
   * update()
   * @param {Number} modifier - a speed modifier
   * 
   * Handles all the changing pieces of the game
   */
  update(modifier){
    modifier /= 500;
    if ( this.lm.level.length === 0 ) {
      // if player won
      if ( this.lm.level === false ) {
        // no levels left start game over
        this.init();
      } else {
        // next level!!
        this.lm.next();
        this.start();
      }
    } 
    if ( this.ball.pos.y > this.paddle.bottom + (this.paddle.size.h * 2) ) {
      // player lost, start game over
      this.init();
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
        for ( let i = 0; i < this.lm.level.length; i++ ) {
          if ( this.ball.checkCollision(this.lm.level[i]) instanceof Brick) {
            if(this.lm.level[i].breakable){
              this.lm.level[i].clear(this.cm.ctx);
              this.lm.level.splice(i, 1);
            }
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
    for ( let brick of this.lm.level )
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
      normal: {x: 100, y: 25, w: 25, h: 25},
      shield1: {x: 272, y: 0, w: 25, h: 25},
      shield2: {x: 50, y: 25, w: 25, h: 25},
      shield3: {x: 75, y: 25, w: 25, h: 25},
      star: {x: 125, y: 25, w: 25, h: 25}
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
  breakout.init();
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
