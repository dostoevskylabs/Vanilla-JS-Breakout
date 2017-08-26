/**
 * Vanilla JS Breakout
 * 
 * @author Andrew Miller
 * @author Elijah Seymour
 */
class CanvasManager {
  /*
   * @class CanvasManager
   * @param {Object} canvas - our canvas element
   *
   * Manages the Canvas and handles resizing
   * Creates a reference to our canvas and context
   */  
   constructor( canvas ) {
     this.canvas = canvas;
     this.ctx = this.canvas.getContext('2d');
     this.safeWidth = canvas.width;
     this.safeHeight = canvas.height;
     //window.addEventListener('resize', resizeGame.bind(this)); /* global resizeGame */
     //resizeGame.apply(this);
   }
}
class GameObject {
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
  constructor( x, y, w, h, sprite = {} ) {
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
  get centerX(){
    return this.pos.x + (this.size.w / 2)
  }
  get centerY(){
    return this.pos.y + (this.size.h / 2);
  }
  get centerW(){
    return this.size.w / 2;
  }
  get cetnerH(){
    return this.size.h / 2;
  }
  /**
   * updateSprite()
   * @param {Object} sprite - sprite object
   * 
   * update the sprite data to draw it on canvas
   */
  updateSprite( sprite ) {
    this.sprite = sprite;
    this.size.w = sprite.w;
    this.size.h = sprite.h;
  }
  /**
   * draw()
   * @param {Object} ctx - canvas context
   *
   * Render a GameObject on the canvas
   */
  draw( ctx ) {
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
  clear( ctx ) {
    ctx.fillStyle = "pink";
    ctx.fillRect(this.prev.x, this.prev.y, this.prev.w, this.prev.h);
    ctx.clearRect(this.prev.x, this.prev.y, this.prev.w, this.prev.h);
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
    this.prev.w = this.size.w;
    this.prev.h = this.size.h;
  }
  /**
   * checkCollision()
   * @param {Object} gameObject - any game object
   * 
   * check if points are overlapping a GameObject
   */
  checkCollision( gameObject ) {
    let offset = { x : 0, y : 0 };
    let overlap = false;
    if ( ( this.pos.x + this.size.w >= gameObject.pos.x && gameObject.pos.x + gameObject.size.w >= this.pos.x ) &&
          ( this.pos.y + this.size.h >= gameObject.pos.y && gameObject.pos.y + gameObject.size.h >= this.pos.y) ) {
    	overlap = true;
    	if ( ( this.pos.x + this.size.w / 6 ) < ( gameObject.pos.x + gameObject.size.w / 6 ) ) {
    		offset.x = ( this.pos.x + this.size.w ) - gameObject.pos.x;
    	} else {
    		offset.x = this.pos.x - ( gameObject.pos.x + gameObject.size.w );
    	}
    	if( ( this.pos.y + this.size.h / 6 ) < ( gameObject.pos.y + gameObject.size.h /  6 ) ) {
    		offset.y = ( this.pos.y + this.size.h ) - gameObject.pos.y;
    	} else {
    		offset.y = this.pos.y - ( gameObject.pos.y + gameObject.size.h );
    	}
    }
    return {overlap, offset};
  }
}
class Brick extends GameObject {
  /**
   * @class Brick
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
  constructor( sprite, x, y, type, power, breakable, color ) {
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
   * for blocks that get hit more than once to break
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
  draw( ctx ) {
    // Draw Background Color
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x + 1, this.pos.y + 1, this.size.w - 2, this.size.h -2);
    // Call super.draw() to draw overlay
    super.draw(ctx);
  }
  /**
   * checkCollision()
   * @param {Object} gameObject - any game object
   * 
   * Check collision with bricks
   */
  checkCollision( gameObject ) {
    if ( gameObject instanceof Ball ) {
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
class Ball extends GameObject {
  /**
   * @class   Ball
   * @extends GameObject
   * @param {Object} sprite - sprite object
   * @param {Number} x - position x
   * @param {Number} y - position y
   * @param {Number} speed - speed modifier
   * 
   * Create a new Ball that extends the GameObject class
   */  
  constructor( sprite, x, y, speed ) {
    super(x, y, sprite.w, sprite.h, sprite);
    this.velocity = {x: 50, y: -50};
    this.lives = 3;
    this.launched = false;
    this.speed = speed;
    this.modifier = 0;
    this.state = "normal";
  }
  /**
   * update()
   *
   * Update the position of the ball
   */
  update(){
    this.pos.x += Math.round(this.velocity.x * this.speed);
    this.pos.y += Math.round(this.velocity.y * this.speed);
  }
  /**
   * rebound()
   * @param {Object} offset - offset position data
   *
   * rebound!
   */
  rebound( offset, paddle = undefined ) {
  	let minShift = Math.min( Math.abs(offset.x),
  				                    Math.abs(offset.y) );
  	if ( Math.abs(offset.x) === minShift ) {
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
  	if ( paddle ) {
      let normal = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
      let ballCenter = this.pos.x + (this.size.w / 2);
      let paddleCenter = paddle.pos.x + (paddle.size.w / 3);
      //let posX = (this.centerX - paddle.centerX) / paddle.centerW;
      let posX = (ballCenter - paddleCenter) / (paddle.size.w / 2);
      this.velocity.x = normal * posX * paddle.variance;
    } 
  }   
  /**
   * bindsTo()
   * @param {Object} gameObject - any game object
   * 
   * Binds ball to any GameObject
   */
  bindsTo( gameObject ) {
    this.pos.x = gameObject.pos.x + gameObject.size.w / 2.5;
    this.pos.y = gameObject.pos.y - this.size.h;    
  }
  /**
   * setBounds()   
   * @param {Object} canvas - reference to canvas
   *
   * Set bounds for a gameObject the object cannot cross
   */
  setBounds( canvas ) {
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
class Paddle extends GameObject {
  /**
   * @class   Paddle
   * @extends GameObject
   * @param {Object} sprite - sprite object
   * @param {Number} x - position x
   * @param {Number} y - position y
   * @param {Number} speed  - speed modifier
   *
   * Create a new Paddle that extends the GameObject class
   */  
  constructor( sprite, x, y, speed ) {
    super(x, y, sprite.w, sprite.h, sprite);
    this.velocity = {x: 100, y: 0};
    this.speed = speed;
    this.state = "normal";
    this.variance = 0.8;
    this.mouseSpeed = 30;
    this.mouseX = 0;
    this.movingTo = 0;
    this.moving = false;
  }
  /**
   * update()
   * 
   * updates the paddles position on the canvas
   */
  update(){
    if ( 37 in keysDown ) // player going left
      this.pos.x -= Math.round(this.velocity.x * this.speed);
    if ( 39 in keysDown ) // player going right
      this.pos.x += Math.round(this.velocity.x * this.speed);
      
    
  }
  /**
   * checkCollision()
   * @param {Object} gameObject - any GameObject
   * 
   * Check if GameObject (Namely the Ball) - collides with the paddle
   */
  checkCollision( gameObject ) {
    if ( gameObject instanceof Ball ) {
      let data;
      data = super.checkCollision(gameObject);
      if ( data.overlap ) {
        gameObject.rebound(data.offset, this);
      }
    }      
  }
  /**
   * setBounds()   
   * @param {Object} canvas - reference to canvas
   *
   * Set bounds for a gameObject the object cannot cross
   */
  setBounds( canvas ) {
    if ( this.pos.x >= canvas.width - this.size.w )
      this.pos.x = canvas.width - this.size.w;
    if ( this.pos.x <= 0 )
      this.pos.x = 1;
      
    if(mouseMove.x != this.mouseX){
      this.movingTo = this.mouseX = mouseMove.x;
      this.moving = true;
    }
    
    if(this.moving){
      if(this.movingTo > (this.centerX + 10)){
        this.pos.x += this.mouseSpeed;
        this.mouseX = mouseMove.x;
      }else if(this.movingTo < (this.centerX - 10)){
        this.pos.x -= this.mouseSpeed;
        this.mouseX = mouseMove.x;
      }else{
        this.moving = false;
      }
    }
    
    
  }    
}
class LevelManager {
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
  parseBrick( brickObj ) {
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
  add( level ) {
    let tLevel = [];
    level.map((brick) => tLevel.push(this.parseBrick(brick)));
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
class Game {
  /**
   * @class Game
   * @param {Object} canvasManager - Our CanvasManager Class
   * @param {Object} levelManager - Our LevelManager Class
   * 
   * Creates an instance of our game
   */  
  constructor( canvasManager, levelManager ) {
    this.lm = levelManager;
    this.cm = canvasManager;
    this.meter = new FPSMeter({position:'absolute', right:0, bottom: 0, top: 'auto', left: 'auto'}); /*global FPSMeter*/
    this.timestep = 1000 / 60;
    this.then = performance.now() || Date.now(); /* global performance */
    this.playArea = { x: 0, y: 0, w: 0, h: 0 };
    this.bricks = 0;
    this.ball = undefined;
    this.paddle = undefined;
    this.frame = undefined;
    this.gameState = 0;
    this.statsLocation = { x : 0, y : 0, w : 0, h : 0};
  }
  /**
   * init()
   *
   * Initialize our game to a default state so that we can start a new game
   */
  init(){
    /**
     * Handle GameState
     *
     * May refactor this
     */
    switch ( this.gameState ) {
      // splash screen
      case 0:
        this.lm.add([{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":150,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":250,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":300,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":400,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":475,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":500,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":600,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":650,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":150,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":250,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":300,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":500,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":600,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":650,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":150,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":250,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":475,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":500,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":650,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":150,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":250,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":500,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":600,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":150,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":250,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":400,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":500,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":600,"y":150},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":650,"y":150}]);
        this.cm.ctx.clearRect(0, 0, this.cm.canvas.width, this.cm.canvas.height);
        this.ball = new Ball(SpriteMap.ball.normal, (this.cm.canvas.width / 2), (this.cm.canvas.height - 190), 0.085);
        this.paddle = new Paddle(SpriteMap.paddle.normal, (this.cm.canvas.width / 2) - 35, (this.cm.canvas.height - 160), 0.085);        
        this.render();
        setTimeout(function(self){
          self.gameState++;
          self.init(); 
        }, 1000, this);
      break;
      // game menu
      case 1:
        this.lm.reset();
        this.gameState++;
        this.init();
      break;
      // in-game
      case 2:
        this.bricks = 0;
        this.then = performance.now() || Date.now();
        // reset our LevelManager
        this.lm.reset();
        // add some levels
        this.lm.add([{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":0,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":50,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":100,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":150,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":200,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":250,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":300,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":350,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":400,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":450,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":500,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":550,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":600,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":650,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":700,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":750,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":800,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":850,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":900,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":950,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":1000,"y":0},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":0,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":50,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":100,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":150,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":200,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":250,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":300,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":350,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":400,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":450,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":500,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":550,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":600,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":650,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":700,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":750,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":800,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":850,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":900,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":950,"y":25},{"c":"#339cd9","t":4,"b":1,"p":0,"s":1,"x":1000,"y":25},{"c":"#d98533","t":4,"b":0,"p":0,"s":1,"x":0,"y":175},{"c":"#d98533","t":4,"b":0,"p":0,"s":1,"x":1000,"y":175},{"c":"#d93333","t":4,"b":1,"p":1,"s":1,"x":300,"y":250},{"c":"#7dd933","t":4,"b":1,"p":2,"s":1,"x":450,"y":250},{"c":"#3b33d9","t":4,"b":1,"p":3,"s":1,"x":600,"y":250},{"c":"#d3d933","t":4,"b":1,"p":4,"s":1,"x":750,"y":250}]);
        this.lm.add([{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":50,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":100,"y":25},{"c":"#d3d933","t":4,"b":0,"p":1,"s":1,"x":150,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":200,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":225,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":250,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":275,"y":25},{"c":"#33d93f","t":4,"b":0,"p":2,"s":1,"x":300,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":350,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":375,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":400,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":425,"y":25},{"c":"#d933c0","t":4,"b":0,"p":3,"s":1,"x":450,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":500,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":550,"y":25},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":50,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":100,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":200,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":225,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":250,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":275,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":350,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":375,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":400,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":425,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":500,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":550,"y":50},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":50,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":100,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":200,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":225,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":250,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":275,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":350,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":375,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":400,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":425,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":500,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":550,"y":75},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":50,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":100,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":200,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":225,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":250,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":275,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":350,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":375,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":400,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":0,"x":425,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":500,"y":100},{"c":"#339cd9","t":0,"b":1,"p":0,"s":1,"x":550,"y":100},{"c":"#d93333","t":0,"b":0,"p":0,"s":1,"x":150,"y":200},{"c":"#d93333","t":0,"b":0,"p":0,"s":1,"x":300,"y":200},{"c":"#d93333","t":0,"b":0,"p":0,"s":1,"x":450,"y":200}]);
        this.lm.add([{"c":"#997377","t":0,"b":1,"p":0,"s":1,"x":1200,"y":50},{"c":"#997377","t":0,"b":0,"p":0,"s":1,"x":1200,"y":70}]);
        this.start();        
      break;
      // gameover
      case 3:
        this.lm.reset();
        this.lm.add([{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":75,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":100,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":125,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":225,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":300,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":325,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":350,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":425,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":475,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":525,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":625,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":675,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":725,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":750,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":775,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":825,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":850,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":875,"y":25},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":75,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":225,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":325,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":425,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":525,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":625,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":675,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":725,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":825,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":875,"y":50},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":75,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":200,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":225,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":325,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":425,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":475,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":525,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":625,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":675,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":725,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":750,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":775,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":825,"y":75},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":75,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":125,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":225,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":325,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":425,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":525,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":625,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":675,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":725,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":825,"y":100},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":75,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":100,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":125,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":175,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":225,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":275,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":325,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":375,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":425,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":450,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":475,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":525,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":550,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":575,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":650,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":725,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":750,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":775,"y":125},{"c":"#d93333","t":0,"b":1,"p":0,"s":0,"x":825,"y":125}]);
        this.cm.ctx.clearRect(0, 0, this.cm.canvas.width, this.cm.canvas.height);
        this.ball = new Ball(SpriteMap.ball.normal, this.cm.canvas.width / 2, (this.cm.canvas.height - 190), 0.085);
        this.paddle = new Paddle(SpriteMap.paddle.normal, (this.cm.canvas.width / 2) - 35, (this.cm.canvas.height - 160), 0.085);        
        this.render();
        setTimeout(function(self){
          self.gameState = 2;
          self.init(); 
        }, 7000, this);
      break;
    }
  }
  /**
   * start()
   *
   * Start the level
   */
  start(){
    this.cm.ctx.font = "15px Open Sans";
    this.cm.ctx.textBaseline = "top";
    this.cm.ctx.clearRect(0, 0, this.cm.canvas.width, this.cm.canvas.height);
    // ball/paddle = new Sprite, x, y, speed
    this.ball = new Ball(SpriteMap.ball.normal, (this.cm.canvas.width / 2), (this.cm.canvas.height - 190), 0.085);
    this.paddle = new Paddle(SpriteMap.paddle.normal, (this.cm.canvas.width / 2) - 35, (this.cm.canvas.height - 160), 0.085);
    this.cm.ctx.drawImage(SpriteMap.sheet, 0, 240, 350, 150, (this.cm.canvas.width / 2) - 175,(this.cm.canvas.height / 2) - 75, 350, 150);
    this.loop();
  }
  /**
   * isGameOver()
   * @param {Number} lives - number of lives before ball was lost
   *
   * Checks if the game is over, if its not it removes a ball
   */
  isGameOver( lives ) {
    lives--;
    if ( lives === 0 ) {
      this.gameState++;
      this.init();
    }
    this.ball.clear(this.cm.ctx);
    this.paddle.clear(this.cm.ctx);
    // ball/paddle = new Sprite, x, y, speed
    this.ball = new Ball(SpriteMap.ball.normal, (this.cm.canvas.width / 2), (this.cm.canvas.height - 190), 0.085);
    this.paddle = new Paddle(SpriteMap.paddle.normal, (this.cm.canvas.width / 2) - 35, (this.cm.canvas.height - 160), 0.085);
    this.ball.lives = lives; // set the lives to localized lives because it reinitalizes with the new operator to 3
    this.updateStats();
    this.loop();
  }
  /**
   * loop()
   * 
   * Main game loop
   */
  loop(){
    // if our frame is already set, cancel it so we can call this.loop() again
    // which sets a frame, this prevents double-triple-quadro-etc loops.
    if ( this.frame !== undefined ) window.cancelAnimationFrame(this.frame);
    this.meter.tickStart();
    let now = performance.now() || Date.now();
    let delta = now - this.then;
    this.then = now;
    delta += this.timestep;
    this.frame = window.requestAnimationFrame(this.loop.bind(this));
    for ( ; delta >= this.timestep; delta -= this.timestep ) this.update();
    this.render();
    this.meter.tick();
  }
  /**
   * update()
   * 
   * Handles all the changing pieces of the game
   */
  update(){
    this.lm.level.map((brick) => { if ( brick.breakable ) this.bricks++; }); // only keep count of breakable bricks
    this.updateStats(); // Updates the current level/lives/etc
    if ( this.bricks === 0 ) { // Player won the current level
      this.lm.next(); // Call next level
      if ( this.lm.level === false ) { // Player won the game
        // no levels left start game over
        this.init();
      } else {
        this.start(); // Start the next level
      }
    } else if ( this.ball.pos.y > this.paddle.bottom + (this.paddle.size.h * 2) ) { // Ball below paddle
      // player lost a life, check if it's a gameOver or if it's just a lost life, do leg work in the function
      this.isGameOver(this.ball.lives);
    }
    // set bounds for paddle object
    this.paddle.setBounds(this.cm.canvas);
    if ( !this.ball.launched ) { // Ball not launched
      // binds the ball to the paddle, technically you can bind
      // the ball to any GameObject
      this.ball.bindsTo(this.paddle);
      // launch ball
      if ( 40 in keysDown ) { // Down arrow
        this.cm.ctx.clearRect(
          (this.cm.canvas.width / 2) - 175,
          (this.cm.canvas.height / 2) - 75,
          350, 150
        );
        this.ball.launched = true;
      }
      this.paddle.update();
    } else {
      // set ball bounds
      this.ball.setBounds(this.cm.canvas);
      // does ball collide with paddle?
      this.paddle.checkCollision(this.ball);
      this.ball.update();
      this.paddle.update();      
      for ( let i = 0; i < this.lm.level.length; i++ ) {
        if ( this.lm.level[i].checkCollision(this.ball) ) { // check if ball collides with brick object
          /**
           * Handle Powerups
           *
           * May refactor this
           */
          switch ( this.lm.level[i].power ) {
              case "slow":
                this.ball.speed = 0.02;
                //this.paddle.speed = 0.02;
                this.ball.updateSprite(SpriteMap.ball.slow);
                // timeout powerup after ten seconds
                setTimeout(function(self){
                  self.ball.speed = 0.085;
                  //self.paddle.speed = 0.085;
                  self.ball.updateSprite(SpriteMap.ball.normal);
                }, 10000, this);
              break;
              case "fast":
                this.ball.speed = 0.09;
                //this.paddle.speed = 0.09;
                this.ball.updateSprite(SpriteMap.ball.fast);
                // timeout powerup after ten seconds
                setTimeout(function(self){
                  self.ball.speed = 0.085;
                  //self.paddle.speed = 0.085;
                  self.ball.updateSprite(SpriteMap.ball.normal);
                }, 10000, this);                
              break;
              case "expand":
                this.paddle.updateSprite(SpriteMap.paddle.large);
                // timeout powerup after ten seconds
                setTimeout(function(self){
                  self.paddle.updateSprite(SpriteMap.paddle.normal);
                }, 10000, this);
              break;
              case "contract":
                this.paddle.updateSprite(SpriteMap.paddle.small);
                // timeout powerup after ten seconds
                setTimeout(function(self){
                  self.paddle.updateSprite(SpriteMap.paddle.normal);
                }, 10000, this);                
              break;
              case "start":
              break;
          }                      
          if ( this.lm.level[i].breakable ) { // if block breakable
            if ( this.lm.level[i].hp > 0 ) { // if brick has 'shield'
              this.lm.level[i].hit(); // smack it!
            } else {
              this.lm.level[i].clear(this.cm.ctx); // clear brick from canvas
              this.lm.level.splice(i, 1); // remove brick from current level
            }
          }
        }
      }
    }
  }
  /**
   * updateStats()
   *
   * Draw data on screen
   */
  updateStats(){
    let newStatsLocation = { x: this.paddle.pos.x, y: this.paddle.pos.y + this.paddle.size.h + 5, w: this.paddle.size.w, h:18 };
    if ( this.statsLocation.x != newStatsLocation.x || this.statsLocation.w != newStatsLocation.w ) {
      this.cm.ctx.clearRect(this.statsLocation.x, this.statsLocation.y, this.statsLocation.w, this.statsLocation.h);
      this.cm.ctx.fillStyle = '#fff';
      this.cm.ctx.drawImage(assetLoader.imgs.heart, this.paddle.pos.x + (this.paddle.size.w / 2) - 10, this.paddle.pos.y + 25);
      this.cm.ctx.fillText(this.ball.lives, this.paddle.pos.x + (this.paddle.size.w / 2) + 10, this.paddle.pos.y + 21);
      this.statsLocation = newStatsLocation;
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
    this.lm.level.map((brick) => brick.draw(this.cm.ctx));
  }
}
/***************************************************************************************************************************/
/* Setup
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
    small: {x: 250, y: 25, w: 50, h: 16},
    normal: {x: 150, y: 25, w: 100, h: 16},
    large: {x: 0, y: 180, w: 150, h: 16}
  },
  ball: {
    normal: {x: 24, y: 0, w: 24, h: 24, r: 24},
    slow: {x: 48, y: 0, w: 24, h: 24, r: 24},
    fast: {x: 0, y: 0, w: 24, h: 24, r: 24}
  }
};
let canvasManager = new CanvasManager(document.querySelector("#canvas"));
let levelManager = new LevelManager();
let breakout = new Game(canvasManager, levelManager);
let keysDown = {};
let mouseMove = {x:0, y:0, px: 0, py: 0};
assetLoader.finished = function(){ /* global assetLoader */
  SpriteMap.sheet = assetLoader.imgs.ts;
  breakout.init();
};
assetLoader.downloadAll();
/***************************************************************************************************************************/
/* Controls
/***************************************************************************************************************************/
window.addEventListener("keydown", function(e){ if ( e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 40 ) keysDown[e.keyCode] = true; });
window.addEventListener("keyup", function(e){ if ( keysDown[e.keyCode] === true ) delete keysDown[e.keyCode]; });
canvasManager.canvas.addEventListener("mousemove", function(e){
  let canvasRect = canvasManager.canvas.getBoundingClientRect();
  mouseMove.px = mouseMove.x;
  mouseMove.py = mouseMove.y;
  mouseMove.x = e.clientX - canvasRect.left;
  mouseMove.y = e.clientY - canvasRect.top;
});
/***************************************************************************************************************************/
