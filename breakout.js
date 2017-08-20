/**
 * GameDev Practice
 *
 * @author: Andrew Miller 
 * @author: Elijah Seymour
 * assetLoader from: https://github.com/straker/endless-runner-html5-game/tree/master/part3
 * resizeGame from: someone else (forgot who at the moment)
 **/
// Select our canvas element and set the context to 2dimensional
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let width = 1250;
let height = 720;
let safeWidth = 1250;
let safeHeight = 720;
// this object will store all the directional keys pressed and set
// their value to true so that we know where the player is moving
let keysDown = {};
// control game state
let gameState = 0;
// store game objects
let gameObjects = [];
let timestep = 1000 / 60;
let maxfps = 60;
// this is used later to control the speed the character's sprite moves at
let then = Date.now();
window.addEventListener("resize", function(){
  var viewport, newGameWidth, newGameHeight, newGameX, newGameY;
  // Get the dimensions of the viewport
  viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  // Determine game size
  if ( height / width > viewport.height / viewport.width ) {
    if ( safeHeight / width > viewport.height / viewport.width ) {
      // A
      newGameHeight = viewport.height * height / safeHeight;
      newGameWidth = newGameHeight * width / height;
    } else {
      // B
      newGameWidth = viewport.width;
      newGameHeight = newGameWidth * height / width;
    }
  } else {
    if ( height / safeWidth > viewport.height / viewport.width ) {
      // C
      newGameHeight = viewport.height;
      newGameWidth = newGameHeight * width / height;
    } else {
      // D
      newGameWidth = viewport.width * width / safeWidth;
      newGameHeight = newGameWidth * height / width;
    }
  }
  canvas.style.width = newGameWidth + "px";
  canvas.style.height = newGameHeight + "px";
  newGameX = (viewport.width - newGameWidth) / 2;
  newGameY = (viewport.height - newGameHeight) / 2;
  // Set the new padding of the game so it will be centered
  canvas.style.margin = newGameY + "px " + newGameX + "px";    
});
// wait for keypresses to populate our keysDown object
window.addEventListener("keydown", function(e){
  if ( e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 40 ) {
    keysDown[e.keyCode] = true;
  }
});
window.addEventListener("keyup", function(e){
  if ( keysDown[e.keyCode] === true ) {
    delete keysDown[e.keyCode];
  }
});
// this thing was taken from this dude i mentioned at the top
// it will take all assets and give them an identifier and
// the game won't load until they are all loaded
// eventually we need to make it modular so that it
// can only load the ones for the first 4 maps or whatever
// and then it wont load the new ones until it needs them
// because it would suck to have to load every existing asset all at once
const assetLoader = function(){
  this.imgs        = {
    "ts"            : "http://i.imgur.com/iLJVnkS.png",
    "bg"            : "https://s-media-cache-ak0.pinimg.com/originals/c8/11/84/c8118443a391456955a7b33b7ee19191.png",
    "ts2"           : "http://i.imgur.com/i2Fiug3.png"
  };
  let assetsLoaded = 0;
  let numImgs      = Object.keys(this.imgs).length;
  this.totalAssest = numImgs;
  function assetLoaded(dic, name){
    if ( this[dic][name].status !== "loading" ) {
      return;
    }
    this[dic][name].status = "loaded";
    assetsLoaded++;
    if ( assetsLoaded === this.totalAssest && typeof this.finished === "function" ) {
      this.finished();
    }
  };
  this.downloadAll = function(){
    let self = this;
    let src;
    for ( let img in this.imgs ) {
      if ( this.imgs.hasOwnProperty(img) ) {
        src = this.imgs[img];
        (function(self, img) {
          self.imgs[img] = new Image();
          self.imgs[img].status = "loading";
          self.imgs[img].name = img;
          self.imgs[img].onload = function(){
            assetLoaded.call(self, "imgs", img)
          };
          self.imgs[img].src = src;
        })(self, img);
      }
    }
  };
  return {
    imgs: this.imgs,
    totalAssest: this.totalAssest,
    downloadAll: this.downloadAll
  };
}();
assetLoader.finished = startGame;
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
    normal: {x: 1, y: 191, w: 100, h: 16}
  },
  ball: {
    normal: {x: 0, y: 120, w: 24, h: 24}
  }
};
class GameObject{
  constructor ( x, y, w, h, sprite = {} ) {
    this.size = { w: w, h: h };
    this.pos = { x: x, y: y};
    this.prev = {x: x, y: y, w: w, h: h};
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
  draw(){
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
  clear(ctx){
    ctx.clearRect(this.prev.x, this.prev.y, this.prev.w, this.prev.h);
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
    this.prev.w = this.size.w;
    this.prev.h = this.size.h;
  }
}
class Brick extends GameObject{
  constructor ( sprite, x, y, health = 1, breakable = true, powerup = 0 ) {
    super(x, y, SpriteMap.bricks._size.w, SpriteMap.bricks._size.h, sprite);
    this.health = health;
    this.breakable = breakable;
    this.powerup = powerup;
  }
}
class Ball extends GameObject{
  constructor ( sprite, x, y ) {
    super(x, y, 20, 20, sprite);
    this.velocity = {x: 50, y: -50};
  }
}
class Paddle extends GameObject{
  constructor ( sprite, x, y ) {
    super(x, y, 100, 16, sprite);
    this.velocity = {x: 100, y: 0};
  }
}
function isObjectInstanceOf(gameObjects, gameObject){
  for ( let i = 0; i < gameObjects.length; i++ ) {
    if ( gameObjects[i] instanceof gameObject ) {
      return gameObjects[i];
    }
  }
}
function generateObjects(){
  if ( gameState !== 0 ) return;
  let levelOne = [
    [4,0,0,0,0,0,3,0,0,0,0,10,10,10,0,0,0,0,3,0,0,0,0,0,4],
    [0,4,0,0,0,10,0,3,0,0,0,10,10,10,0,0,0,3,0,10,0,0,0,4,0],
    [0,0,4,0,10,0,0,13,3,0,0,10,10,10,0,0,3,13,0,0,10,0,4,0,0],
    [0,0,0,10,0,0,0,13,0,6,6,6,6,6,6,6,0,13,0,0,0,10,0,0,0],
    [0,0,0,0,0,0,0,13,0,6,6,0,0,0,6,6,0,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,13,0,6,6,0,1,0,6,6,0,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,13,0,6,6,0,0,0,6,6,0,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,13,0,6,6,6,6,6,6,6,0,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,13,13,13,13,13,13,13,13,13,13,13,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];
  gameObjects.push(new Paddle(
    SpriteMap.paddle.normal, 
    (canvas.width / 2) - 35, 
    (canvas.height - 160)
  ));
  gameObjects.push(new Ball(
    SpriteMap.ball.normal, 
    canvas.width / 2, 
    canvas.height - 190
  ));
  buildLevel(levelOne);
}
function drawObjects(){
  for ( let i in gameObjects ) {
    gameObjects[i].draw(ctx);
  }
}
function buildLevel(level){
  let x = 0, y = 0;
  for ( let i = 0; i < level.length; i++ ) {
    for( let j = 0; j < level[i].length; j++ ) {
      let tlevel = level[i][j];
      if ( tlevel !== 0 ) {
        let brickColor = SpriteMap.bricks._map[tlevel - 1];
        let sprite = SpriteMap.bricks[brickColor];
        gameObjects.push(
          new Brick(
            sprite, 
            (sprite.w * (j + 1)) - sprite.w, 
            (sprite.h * (i + 1)) - sprite.h
          )
        );
      }
    }
  }
}
function checkCollision(gameObject){
  for ( let i = 0; i < gameObjects.length; i++ ) {
    if ( gameObjects[i] instanceof Brick ) {
      if ( gameObject.top < gameObjects[i].bottom &&
            gameObject.right > gameObjects[i].left &&
            gameObject.bottom > gameObjects[i].top &&
            gameObject.left < gameObjects[i].right ) {
          if ( gameObject.pos.y < gameObjects[i].pos.y - (gameObjects[i].size.h / 2) ||
                gameObject.pos.y > gameObjects[i].pos.y + (gameObjects[i].size.h / 2) ) {
            gameObject.velocity.y =  -1 * gameObject.velocity.y;
          } else {
            gameObject.velocity.x = -1 * gameObject.velocity.x;
          }      
        gameObjects[i].clear(ctx);
        gameObjects.splice(i, 1);
      }
    } else if ( gameObjects[i] instanceof Paddle ) {
      if ( gameObject.top <= gameObjects[i].bottom &&
            gameObject.left >= gameObjects[i].left &&
            gameObject.bottom >= gameObjects[i].top &&
            gameObject.right <= gameObjects[i].right ) {
        if ( gameObject.pos.x <= gameObjects[i].pos.x + gameObjects[i].size.w &&
            gameObject.pos.x >= gameObjects[i].pos.x ) {
          gameObject.pos.y = gameObjects[i].pos.y - gameObject.size.h;
          gameObject.velocity.y = -1 * gameObject.velocity.y;
        }
      }      
    }
  }
}
// define bounds that the player's sprite cannot cross
// right, left, bottom, top
function setBounds(gameObject){
  if ( gameObject.pos.x >= canvas.width - gameObject.size.w ) {
    gameObject.pos.x = canvas.width - gameObject.size.w;
  }
  if ( gameObject.pos.x <= 0 ) {
    gameObject.pos.x = 1;
  }
}
// update player's position
function movePosition(gameObject, modifier){
  if ( 37 in keysDown ) { // player going left
    gameObject.pos.x -= Math.round(gameObject.velocity.x * modifier);
  }
  if ( 39 in keysDown ) { // player going right
    gameObject.pos.x += Math.round(gameObject.velocity.x * modifier);
  }
  if ( 40 in keysDown ) { // launch ball
    if ( gameObject instanceof Ball ) {
      gameState++;
      ctx.clearRect(
        (canvas.width / 2) - 175,
        (canvas.height / 2) - 75,
        350, 150
      );
    }
  }
};
function setDirection(gameObject, modifier){
  gameObject.pos.x += Math.round(gameObject.velocity.x * modifier);
  gameObject.pos.y += Math.round(gameObject.velocity.y * modifier);
  if ( gameObject.left < 0 ) {
    gameObject.pos.x = 0;
    gameObject.velocity.x = -1 * gameObject.velocity.x;
  } else if ( gameObject.right > canvas.width){
    gameObject.pos.x = canvas.width - gameObject.size.h;
    gameObject.velocity.x = -1 * gameObject.velocity.x;
  }
  if ( gameObject.top < 0 ) {
    gameObject.pos.y = 0;
    gameObject.velocity.y = -1 * gameObject.velocity.y;
  } else if ( gameObject.bottom > canvas.height ) {
    gameObject.pos.y = canvas.height - gameObject.size.h;
  }
  checkCollision(gameObject);  
}
function startGame(){
  SpriteMap.sheet = assetLoader.imgs.ts2;
  ctx.drawImage(SpriteMap.sheet, 0, 240, 350, 150, (canvas.width / 2) - 175,(canvas.height / 2) - 75, 350, 150);
  generateObjects();
  gameState++;
  gameLoop();    
}
function gameLoop(){
  let now = Date.now();
  if ( now < then + (1000 / maxfps) ) {
    requestAnimationFrame(gameLoop);
    return;
  }
  let delta = now - then;
  then = now;
  delta += timestep;
  while ( delta >= timestep ) {
    update(delta);
    delta -= timestep;
  }
  drawObjects(); // render
  requestAnimationFrame(gameLoop);
}
function update(modifier){
  modifier /= 500;
  let ball = isObjectInstanceOf(gameObjects, Ball);
  let paddle = isObjectInstanceOf(gameObjects, Paddle);
  if ( gameObjects.length < 3 || ball.pos.y > ( paddle.bottom + (paddle.size.h * 2)  ) ) {
    gameObjects = [];
    gameState = 0;
    ball.clear(ctx);
    paddle.clear(ctx);
    return startGame();
  }    
  setBounds(paddle);
  switch ( gameState ) {
    case 1:
      ball.pos.x = paddle.pos.x + paddle.size.w / 2.5;
      ball.pos.y = paddle.pos.y - ball.size.h;
      movePosition(ball, modifier);
      movePosition(paddle, modifier);      
      break;
    case 2:
      setDirection(ball, modifier);
      movePosition(paddle, modifier);      
      break;
  }
}
assetLoader.downloadAll();
