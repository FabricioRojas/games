const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
game.canvas.canvas.addEventListener('click', handlemouseClick);
game.canvas.setBackgroundImage(game.addElement(game.ELEMENT.IMAGE, `${imgDir}background.png`, game.canvas.width, game.canvas.height, 0, 0));
setInterval(() => game.draw(drawing), 1000 / 60);



const INITIAL_MONEY = 45;
const INITIAL_LIVES = 15;

var shots = [];
var coins = [];
var towers = [];
var enemies = [];
var loseState = false;
var currentMoney = INITIAL_MONEY;
var currentLives = INITIAL_LIVES;


var livesCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, currentLives, game.canvas.width - 80, 55);
var heart = game.addElement(game.ELEMENT.IMAGE, `${imgDir}heart.png`, 30, 30, game.canvas.width - 50 , 27);

var moneyCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, currentMoney, 115, 55);
var coin = game.addElement(game.ELEMENT.IMAGE, `${imgDir}coin.png`, 508, 64, 10, 10);
coin.addAnimation('iddle', { rows: 1, cols: 8, update: 0.1 });
coin.setCurrentAnimation('iddle');

setInterval(() => { spanwEnemy(0.5, 20, 5, 'enemy_1.png',572, 256); }, 1000*5);
setInterval(() => { spanwEnemy(1, 100, 15, 'enemy_2.png',576, 256); }, 1000*23);

game.play();

var drawing = function () {
    coin.print();
    moneyCounter.print();
    heart.print();
    livesCounter.print();

    for (var e in enemies) enemyRoutine(enemies[e]);
    for (var s in shots) {
        shots[s].move({ x: true, y: true });
        shots[s].print();

        for (var e in enemies)
        if (shots[s] && enemies[e] && shots[s].collide(enemies[e])) {
            var aux = enemies[e].hitPoints;
            enemies[e].hitPoints -= shots[s].damage;
            var percentage = (enemies[e].hitPoints*enemies[e].lifeBar.width)/aux;
            enemies[e].lifeBar.width = percentage;
            
            game.removeElement(shots[s]);
            shots.shift();
            if(enemies[e].hitPoints < 1){
                currentMoney += enemies[e].drop;
                moneyCounter.setText(currentMoney);
                game.removeElement(enemies[e]);
                enemies.splice(e,1);
            }
        }
        if (shots[s] && shots[s].outOfBounds()) {
            game.removeElement(shots[s]);            
            shots.splice(s,1);
        }
        // game.pause();
    }

    for (var t in towers){
        towers[t].print();
        towers[t].pointer.print();
        for (var e in enemies) if (enemies[e] && enemies[e].whitinOfBounds(towers[t], towers[t].towerRadius)) shoot(enemies[e], towers[t]);
    }
};



function spanwEnemy(enemiesSpeed, hitPoints, drop, image, width, height){
    var newEnemy = game.addElement(game.ELEMENT.IMAGE, `${imgDir}${image}`, width, height, 1, 270);
    var lifeBar = game.addElement(game.ELEMENT.RECT, 'red', 20, 3, newEnemy.x+10, newEnemy.y+newEnemy.width/2);
    // var lifeBarBorder = game.addElement(game.ELEMENT.RECT, 'red', 2, 10, newTower.x-1, newTower.y+newTower.width/2);

    newEnemy.addAnimation('up', { rows: 4, cols: 9, currentRow: 0, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('left', { rows: 4, cols: 9, currentRow: 1, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('down', { rows: 4, cols: 9, currentRow: 2, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('right', { rows: 4, cols: 9, currentRow: 3, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('stop', { rows: 4, cols: 9, currentRow: 2, currentFrame: 1, fixedX: true, fixedY: true, update: 0.1 });
    newEnemy.enemiesSpeed = enemiesSpeed;
    newEnemy.hitPoints = hitPoints;
    newEnemy.lifeBar = lifeBar;
    newEnemy.drop = drop;
    
    newEnemy.setCurrentAnimation('right');
    newEnemy.setXSpeed(newEnemy.enemiesSpeed);
    newEnemy.setYSpeed(0);

    enemies.push(newEnemy);
}

function enemyRoutine(e) {
    if (e.x == 96 && e.y == 270 || e.x == 471 && e.y == 335) {
        e.setCurrentAnimation('up');
        e.setXSpeed(0);
        e.setYSpeed(-e.enemiesSpeed);
    }
    if (e.x == 96 && e.y == 96 || e.x == 260 && e.y == 335 || e.x == 471 && e.y == 217) {
        e.setCurrentAnimation('right');
        e.setXSpeed(e.enemiesSpeed);
        e.setYSpeed(0);
    }
    if (e.x == 260 && e.y == 96 ) {
        e.setCurrentAnimation('down');
        e.setXSpeed(0);
        e.setYSpeed(e.enemiesSpeed);
    }
    e.move({ x: true, y: true });
    e.print();

    e.lifeBar.setX(e.x + (e.currentAnimation.width / 3));
    e.lifeBar.setY(e.y );
    e.lifeBar.print();
}

function shoot(e, t) {
    if (t.shotTimeout) return;
    var c1 = (e.x + (e.currentAnimation.width / 2)) - t.x;
    var c2 = (e.y + (e.currentAnimation.height / 2)) - t.y;
    var shot = game.addElement(game.ELEMENT.RECT, "white", 2, 10, t.x, t.y);
    shot.damage = t.shotDamage;

    var angle = getAngle(c1, c2);
    shot.setRotate(true);
    shot.setAngle(angle);
    t.pointer.setRotate({x:t.x, y:t.y, width:5});
    t.pointer.setAngle(angle);

    var xSpeed = 0;
    var ySpeed = 0;
    var distance = 30;
    var factorY = c2 < 0 ? -1 : 1;
    var factorX = c1 < 0 ? -1 : 1;
    c1 = e.x+distance-t.x;
    // c2 = e.y+distance-t.y;

    c1 = Math.abs(c1);
    c2 = Math.abs(c2);
    if (c1 > c2) {
        xSpeed = (t.towerFireSpeed * c1) / (c1 + c2);
        ySpeed = t.towerFireSpeed - xSpeed;
    } else {
        ySpeed = (t.towerFireSpeed * c2) / (c1 + c2);
        xSpeed = t.towerFireSpeed - ySpeed;
    }
    shot.setXSpeed(xSpeed * factorX);
    shot.setYSpeed(ySpeed * factorY);

    shots.push(shot);
    t.shotTimeout = setTimeout(() => { clearTimeout(t.shotTimeout); t.shotTimeout = null; }, 1000 * t.towerFire);
}

function getAngle(c1, c2) {
    var angle = Math.atan(c1/c2) * -1;
    if(c1 < 0 && c2 < 0 || c1 > 0 && c2 < 0) angle += Math.PI;
    return angle
}

function addTower(proyectileSpeed, fireTimeout, shotDamage, radius, x,y){
    var newTower = game.addElement(game.ELEMENT.CIRCLE, 'white', 10, x , y);
    var pointer = game.addElement(game.ELEMENT.RECT, 'red', 2, 10, newTower.x-1, newTower.y+newTower.width/2);
    newTower.towerFireSpeed = proyectileSpeed;
    newTower.towerFire = fireTimeout;
    newTower.towerRadius = radius;
    newTower.pointer = pointer;
    newTower.shotTimeout = null;
    newTower.shotDamage = shotDamage;

    towers.push(newTower);
}

/* Custom Listeners */
function handlemouseClick(e) {
    if (loseState) return reset();
    if(e.clientX && e.clientY){
        let rect = game.canvas.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        if(currentMoney >= 15){
            currentMoney -= 15;
            moneyCounter.setText(currentMoney);
            addTower(7, 0.5, 2, 150, x, y);
        }
    }
}