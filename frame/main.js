class Game {

    KEY = {LEFT : 37,UP : 38,RIGHT : 39,DOWN : 40}
    ELEMENT = {CIRCLE : 'circle',RECT : 'rect',TEXT : 'text',}
    STATE = {PAUSE : 'pause',PLAY : 'play',MENU : 'menu',}

    constructor(element, width, height){
        this.canvas = new GameCanvas(element, width, height);
        // this.canvas = canvas;
        this.elements = {};
        this.init();
    }

    /* Methods */
    init(){
        this.state = this.STATE.PAUSE;
        this.canvas.clear();
        this.canvas.print();
    }
    draw(drawing){
        if(this.state == this.STATE.PAUSE) return;

        this.canvas.clear();
        this.canvas.print();
        drawing();
    }
    pause(){
        this.state = this.STATE.PAUSE;
    }
    play(){
        this.state = this.STATE.PLAY;
    }


    /* Setters */
    setState(state) {
        this.state = state;
    }
    addElement(type, color, var1, var2, var3, var4) {
        var element;
        switch(type){
            case this.ELEMENT.CIRCLE:
                element = new CircleElement(this.canvas.context, color, var1, var2, var3);
                break;
            case this.ELEMENT.RECT:
                element = new RectElement(this.canvas.context, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.TEXT:
                element = new TextElement(this.canvas.context, color, var1, var2, var3, var4);
                break;
        }
        this.elements[element.id+''] = element;
        return element;
    }
}


class GameCanvas{

    constructor(element, width, height){
        this.canvas = document.getElementById(element);
        this.backgroundColor = "black";
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.fps = 1000/60;
    }

    /* Methods */
    print(){
        this.context.fillStyle=this.backgroundColor;
        this.context.fillRect(0,0,this.width,this.height);
    }
    clear(){
        this.context.clearRect(0, 0, this.width, this.height);
    }

    /* Setters */
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
    setFps(fps) {
        this.fps = fps;
    }
    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}

class CanvasElement{

    constructor(context, color, x, y){
        this.context = context;
        this.color = color;
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.xSpeed = 1;
        this.ySpeed = 1;
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.listeners = {};
    }

    /* Methods */
    move(vector){
        if(vector == 'x') this.x += this.xSpeed;
        if(vector == 'y') this.y += this.ySpeed;
    }
    addListener(event, callback){
        if(!callback){
            switch(event){
                case "keydown":
                    callback = (evt) => this.keyDown(evt);
                    break;
            }
        }
        if(!this.listeners[event+'']) this.listeners[event+''] = document.addEventListener(event,callback);
    }
    removeListener(event){
        if(this.listeners[event+'']){
            document.removeEventListener(event);
            this.listeners[event+''] = undefined;
            delete this.listeners[event+'']; 
        }
    }

    keyDown(evt){
        switch(evt.keyCode) {
            case 37:
                this.setXSpeed(-10);
                this.setYSpeed(0);
                this.move('x');
                break;
            case 38:
                this.setYSpeed(-10);
                this.move('y');
                break;
            case 39:
                this.setXSpeed(10);
                this.move('x');
                break;
            case 40:
                this.setYSpeed(10);
                this.move('y');
                break;
        }
    }


    /* Setters */
    setColor(color) {
        this.color = color;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    setXSpeed(xSpeed) {
        this.xSpeed = xSpeed;
    }
    setYSpeed(ySpeed) {
        this.ySpeed = ySpeed;
    }
}

class CircleElement extends CanvasElement{

    constructor(context, color, radius, x, y){
        super(context, color, x, y);
        this.radius = radius;
    }

    /* Methods */
    print(){
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        this.context.fill();
    }

    /* Setters */
    setRadius(radius) {
        this.radius = radius;
    }
}

class RectElement extends CanvasElement{

    constructor(context, color, width, height, x, y){
        super(context, color, x, y);
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height); 
    }

    /* Setters */
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
}

class TextElement extends CanvasElement{

    constructor(context, color, size, text, x, y){
        super(context, color, x, y);
        this.size = size;
        this.text = text;
        this.align = "center";
        this.font = "Verdana";
    }

    /* Methods */
    print(){
        this.context.font = this.size + "px "+ this.font;
        this.context.textAlign = this.align; 
        this.context.fillStyle = this.color;
        this.context.fillText(this.text, this.x, this.y);
    }

    /* Setters */
    setSize(size) {
        this.size = size;
    }    
    setText(text) {
        this.text = text;
    }    
    setAlign(align) {
        this.align = align;
    }    
    setFont(font) {
        this.font = font;
    }
}