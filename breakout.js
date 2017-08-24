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
    let offset = { x : 0, y : 0 };
    let overlap = false;
    if ( ( this.pos.x + this.size.w > gameObject.pos.x && gameObject.pos.x + gameObject.size.w > this.pos.x ) &&
          ( this.pos.y + this.size.h > gameObject.pos.y + gameObject.size.h && gameObject.pos.y + gameObject.size.h > this.pos.y) ) {
    	overlap = true;
    	if ( ( this.pos.x + this.size.w / 2 ) < ( gameObject.pos.x + gameObject.size.w / 2 ) ) {
    		offset.x = ( this.pos.x + this.size.w ) - gameObject.pos.x;
    	} else {
    		offset.x = this.pos.x - ( gameObject.pos.x + gameObject.size.w );
    	}
    	if( ( this.pos.y + this.size.h / 2 ) < ( gameObject.pos.y + gameObject.size.h / 2 ) ) {
    		offset.y = ( this.pos.y + this.size.h ) - gameObject.pos.y;
    	} else {
    		offset.y = this.pos.y - ( gameObject.pos.y + gameObject.size.h );
    	}
    }
    return {overlap, offset};
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
     if ( this.type != 'normal' && this.type != 'star' ) {
       let typeMap = ['normal', 'shield1', 'shield2', 'shield3'];
       this.hp -= 1;
       this.type = typeMap[this.hp];
       this.sprite = SpriteMap.bricks[this.sprite.w == 50 ? 'full' : 'half'][this.type];
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
  /**
   * checkCollision()
   * @param {Object} gameObject - any game object
   * @param {Number} modifier - speed modifier
   * 
   * Check collision with bricks
   */
  checkCollision(gameObject, modifier){
    if ( gameObject instanceof Ball ) {
      if ( gameObject.launched ) {
        let data;
        data = super.checkCollision(gameObject);
        if ( data.overlap ) {
          gameObject.rebound(data.offset);
          return true;
        } else {
          return false;
        }
      }
    }
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
    this.lives = 3;
    this.launched = false;
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
   * rebound()
   * @param {Object} offset - offset position data
   *
   * rebound!
   */
  rebound(offset){
  	let minShift = Math.min( Math.abs(offset.x),
  				                    Math.abs(offset.y) );
  	if ( Math.abs(offset.x) == minShift ) {
  		offset.y = 0;
  	} else {
  		offset.x = 0;	
  	}
  	this.pos.x = this.pos.x + offset.x;
  	this.pos.y = this.pos.y + offset.y;
  	if ( offset.x !== 0 ) {
  		this.velocity.x = -1 * this.velocity.x;
  	}
  	if ( offset.y !== 0 ) {
  		this.velocity.y = -1 * this.velocity.y;
  	}
  }   
  /**
   * bindsTo()
   * @param {Object} gameObject - any game object
   * 
   * Binds ball to any GameObject
   */
  bindsTo(gameObject){
    this.pos.x = gameObject.pos.x + gameObject.size.w / 2.5;
    this.pos.y = gameObject.pos.y - this.size.h;    
  }
  /**
   * checkCollision()
   * @param {Object} canvas - reference to canvas
   *
   * Check collision with walls
   */
  checkCollision(canvas){
    if ( this.left < 0 ) {
      this.pos.x = 0;
      this.velocity.x = -1 * this.velocity.x;
    } else if ( this.right > canvas.width ) {
      this.pos.x = canvas.width - this.size.h;
      this.velocity.x = -1 * this.velocity.x;
    }
    if ( this.top < 0 ) {
      this.pos.y = 0;
      this.velocity.y = -1 * this.velocity.y;
    } else if ( this.bottom > canvas.height ) {
      this.pos.y = canvas.height - this.size.h;
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
  /**
   * checkCollision()
   * @param {Object} gameObject - any GameObject
   * @param {Number} modifier - speed modifier
   * 
   * Check if the Ball collides with another GameObject
   */
  checkCollision(gameObject, modifier){
      if ( gameObject instanceof Ball ) {
        if ( gameObject.launched ) {
          let data;
          data = super.checkCollision(gameObject);
          if ( data.overlap ) {
            gameObject.rebound(data.offset);
          }
        }
      }      
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
    for ( let brick of level ) {
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
    this.meter = new FPSMeter({position:'absolute', right:0, bottom: 0, top: 'auto', left: 'auto'}); /*global FPSMeter*/
    this.timestep = 1000 / 60;
    this.maxfps = 60;
    this.then = performance.now() || Date.now(); /* global performance */
    this.window = { w: 1250, h: 720 };
    this.playArea = { x: 0, y: 0, w: 0, h: 0 };
    this.ball = undefined;
    this.paddle = undefined;
    this.frame = undefined;
    this.gameState = 0;
  }
  /**
   * init()
   *
   * Initialize our game to a default state so that we can start a new game
   */
  init(){
    switch ( this.gameState ) {
      // splash
      case 0:
        console.log("splash");
        this.gameState++;
        this.init();
      break;
      // menu
      case 1:
        console.log("menu");
        this.gameState++;
        this.init();
      break;
      // game
      case 2:
        console.log("in game");
        this.then = performance.now() || Date.now();
        // reset our LevelManager
        this.lm.reset();
        // add some levels
        this.lm.add([{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":75,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":125,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":175,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":225,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":275,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":325,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":375,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":425,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":475,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":525,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":575,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":625,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":675,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":725,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":775,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":825,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":875,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":925,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":975,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":1025,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":1075,"y":0},{"c":"#00ff00","t":0,"b":0,"p":0,"s":1,"x":1125,"y":0},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":500,"y":75},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":525,"y":75},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":550,"y":75},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":625,"y":75},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":675,"y":75},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":500,"y":100},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":525,"y":100},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":550,"y":100},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":625,"y":100},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":675,"y":100},{"c":"#ff0000","t":1,"b":1,"p":0,"s":1,"x":75,"y":125},{"c":"#ff0000","t":1,"b":1,"p":0,"s":1,"x":125,"y":125},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":225,"y":125},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":275,"y":125},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":375,"y":125},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":400,"y":125},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":425,"y":125},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":500,"y":125},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":525,"y":125},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":550,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":625,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":675,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":775,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":825,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":925,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":975,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1075,"y":125},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1125,"y":125},{"c":"#ff0000","t":2,"b":1,"p":0,"s":1,"x":75,"y":150},{"c":"#ff0000","t":2,"b":1,"p":0,"s":1,"x":125,"y":150},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":225,"y":150},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":275,"y":150},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":375,"y":150},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":400,"y":150},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":425,"y":150},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":500,"y":150},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":525,"y":150},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":550,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":625,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":675,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":775,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":825,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":925,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":975,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1075,"y":150},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1125,"y":150},{"c":"#ff0000","t":3,"b":1,"p":0,"s":1,"x":75,"y":175},{"c":"#ff0000","t":3,"b":1,"p":0,"s":1,"x":125,"y":175},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":225,"y":175},{"c":"#0080ff","t":4,"b":1,"p":0,"s":1,"x":275,"y":175},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":375,"y":175},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":400,"y":175},{"c":"#0080ff","t":4,"b":1,"p":0,"s":0,"x":425,"y":175},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":500,"y":175},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":525,"y":175},{"c":"#ff0000","t":4,"b":1,"p":0,"s":0,"x":550,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":625,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":675,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":775,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":825,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":925,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":975,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1075,"y":175},{"c":"#ffffff","t":4,"b":1,"p":0,"s":1,"x":1125,"y":175}]);        
        this.lm.add([{"c":"#997377","t":0,"b":1,"p":0,"s":1,"x":1200,"y":50},{"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1200,"y":70}]);
        this.start();        
      break;
      // gameover
      case 3:
        console.log("gameover");
        this.gameState = 2;
        this.init();
      break;
    }
  }
  /**
   * start()
   *
   * Start the level
   */
  start(){
    if ( this.frame !== undefined ) window.cancelAnimationFrame(this.frame);
    let bricks = 0;
    for ( let brick of this.lm.level ) {
      if ( brick.breakable ) bricks++;
    }
    this.cm.ctx.clearRect(0, 0, this.cm.canvas.width, this.cm.canvas.height);
    this.ball = new Ball(SpriteMap.ball.fast, this.cm.canvas.width / 2, this.cm.canvas.height - 190);
    this.paddle = new Paddle(SpriteMap.paddle.normal,(this.cm.canvas.width / 2) - 35,(this.cm.canvas.height - 160));
    this.cm.ctx.drawImage(SpriteMap.sheet, 0, 240, 350, 150, (this.cm.canvas.width / 2) - 175,(this.cm.canvas.height / 2) - 75, 350, 150);
    this.updateStats();
    this.loop();
  }
  /**
   * isGameOver()
   * @param {Number} lives - number of lives before ball was lost
   *
   * Checks if the game is over, if its not it removes a ball
   */
  isGameOver(lives){
    if ( this.frame !== undefined ) window.cancelAnimationFrame(this.frame);
    lives--;
    if ( lives === 0 ) {
      this.gameState++;
      return this.init();
    }
    this.ball.clear(this.cm.ctx);
    this.paddle.clear(this.cm.ctx);
    this.ball = new Ball(SpriteMap.ball.fast, this.cm.canvas.width / 2, this.cm.canvas.height - 190);
    this.paddle = new Paddle(SpriteMap.paddle.normal,(this.cm.canvas.width / 2) - 35,(this.cm.canvas.height - 160));
    this.ball.lives = lives;
    this.updateStats()
    this.loop();
  }
  /**
   * loop()
   * 
   * Main game loop
   */
  loop(){
    this.meter.tickStart();
    let now = performance.now() || Date.now();
    // if ( now < this.then + (1000 / this.maxfps) ){
    //   this.frame = window.requestAnimationFrame(this.loop.bind(this));
    //   return this.frame;
    // }
    let delta = now - this.then;
    this.then = now;
    delta += this.timestep;
    while ( delta >= this.timestep ) {
      this.update(delta);
      delta -= this.timestep;
    }
    this.render();
    this.meter.tick();
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
    let bricks = 0;
    for ( let brick of this.lm.level ) {
      if ( brick.breakable ) bricks++;
    }
    this.updateStats();
    if ( bricks === 0 ) {
      // if player won
      this.lm.next();
      if ( this.lm.level === false ) {
        // no levels left start game over
        return this.init();
      } else {
        // next level!!
        return this.start();
      }
    } 
    if ( this.ball.pos.y > this.paddle.bottom + (this.paddle.size.h * 2) ) {
      // player lost, start game over
      return this.isGameOver(this.ball.lives);
    }
    this.setBounds(this.paddle);
    if ( !this.ball.launched ) {
      this.ball.bindsTo(this.paddle);
      // launch ball
      if ( 40 in keysDown ) {
        this.cm.ctx.clearRect(
          (this.cm.canvas.width / 2) - 175,
          (this.cm.canvas.height / 2) - 75,
          350, 150
        );
        this.ball.launched = true;
      }
      this.paddle.move(modifier);
    } else {
      this.ball.update(modifier);
      this.ball.checkCollision(this.cm.canvas);
      this.paddle.checkCollision(this.ball, modifier);
      for ( let i = 0; i < this.lm.level.length; i++ ) {
        if ( this.lm.level[i].checkCollision(this.ball, modifier) ) {
          if ( this.lm.level[i].breakable ) {
            if ( this.lm.level[i].hp > 0 ) {
              this.lm.level[i].hit();
            } else {
              this.lm.level[i].clear(this.cm.ctx);
              this.lm.level.splice(i, 1);
            }
          }
        }
      }                
      this.paddle.move(modifier);
    }
  }
  /**
   * updateStats()
   *
   * Draw data on screen
   */
  updateStats(){
    let bricks = this.lm.level.filter(function(brick){
      return brick.breakable;
    });
    this.cm.ctx.clearRect(10, this.cm.canvas.height - 40, 200, 40);
    this.cm.ctx.fillStyle = '#fff';
    this.cm.ctx.font = "15px Open Sans";
    this.cm.ctx.textBaseline = "top";
    this.cm.ctx.fillText(`Lives: ${this.ball.lives}, Bricks: ${bricks.length}`, 10, this.cm.canvas.height - 40);
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
    normal: {x: 24, y: 0, w: 24, h: 24, r: 24},
    slow: {x: 48, y: 0, w: 24, h: 24, r: 24},
    fast: {x: 0, y: 0, w: 24, h: 24, r: 24}
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
/***************************************************************************************************************************/
