 // Draw a shape when mouse is clicked
 // ColoredPoints.js
 // Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec4 a_Color;
varying vec2 v_UV;
varying vec4 v_Color;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Color = a_Color;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec4 v_Color;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_WhichTexture;
void main() {
    if (u_WhichTexture == -2) {
        gl_FragColor = u_FragColor; // use color
      } else if (u_WhichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0); // use UV debug color
      } else if (u_WhichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } else if (u_WhichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else {
        gl_FragColor = vec4(1, .2, .2, 1); // Error, reddish
      }
}`

//#region [[Global Variables]]
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

// [[ TEXTURE THINGS ]]
let u_WhichTexture = 0;
let u_Sampler0;
let u_Sampler1;

let g_globalAngle = 0; 

//#endregion

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext('webgl' , {preserveDrawingBuffer:true});
    // a fun little trick to help with lag
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
    return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

     // Get the storage location of attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(a_Position <0){
        console.log("failed to get the storage location locqtion of u_FragColor");
        return;
    }

    // Get the storage location of u_FragColor variable
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if(u_WhichTexture <0){
        console.log("failed to get the storage location locqtion of u_WhichTexture");
        return;
    }
    
    // Get the storage location of attribute variable
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }


    // Get storage location for Model Matrix from our Vertex Shader
    u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    // Get storage location for our Rotate Matrix from our Vertex Shader
    // This dictates the camera angle
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program,'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    // Get storage location for our Projection  Matrix from our Vertex Shader
    u_ProjectionMatrix = gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
    if(!u_ProjectionMatrix){
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    // Get storage location for our View  Matrix from our Vertex Shader
    u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    // Set an initial value for this matrix to identity
    var indentityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, indentityM.elements);
}

function addActionsForHtmlUI(){
    let angleSlider = document.getElementById('angleSlider');
    angleSlider.addEventListener('mousemove', function(){g_globalAngle = this.value; renderScene();});
}

function main() {

    // [[ SET UP FUNCTIONS ]]
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    
    document.onkeydown = keydown;

    initTextures();

    // Set Canvas Color
    gl.clearColor(75/255, 97/255, 84/255, 1.0);
    
    // call anim fram
    requestAnimationFrame(tick);
   // console.log(g_globalAngle);
 }

 var g_startTime = performance.now()/1000;
 var g_seconds = performance.now/1000-g_startTime;
 
 function tick(){
    g_seconds = performance.now()/1000-g_startTime;

    // Update Animation Angles;
    updateAnimationAngle();

    // Draw Everything
    renderScene();
    
    // Call this function back to keep updating the anims
    requestAnimationFrame(tick);
 }

 function updateAnimationAngle(){

 }

function keydown(ev){
    if(ev.keyCode==68){ // D
        g_eye[0] += 0.5;
    }else if(ev.keyCode ==65){ // A
        g_eye[0] -= 0.5;
    }else if(ev.keyCode == 87){ // W
        g_eye[2] -= 0.5;
    }else if(ev.keyCode == 83){ //S
        g_eye[2] += 0.5;
    }else{
        console.log("invalid key");
    }
    
    renderScene();
    console.log(ev.keyCode);

}
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

 function renderScene(){
    var startTime = performance.now();

    // making the projection  matrix 
    var projMat = new Matrix4()
    projMat.setPerspective(50, 1*canvas.width/canvas.height,.1,100);
    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements); // roate it based off that global rotate matrix

    // making the view matrix 
    var viewMat = new Matrix4()
    viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2] , g_up[0],g_up[1],g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements); // roate it based off that global rotate matrix

    // making the rotational matrix 
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // Clear Canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ground floor
    var ground = new Cube();
    ground.textureNum = 1; // THESE NEEDS TO CHANGE WHEN IT WORKS
    ground.matrix.translate(0,-0.75,0);
    ground.matrix.scale(100,0,100);
    ground.matrix.translate(-0.5,0,0.2);
    ground.render();

    // sky 
    var sky = new Cube();
    sky.color = [1,0,0,1];
    sky.textureNum = 0;
    sky.matrix.scale(100,100,100);
    sky.matrix.translate(-0.5,-0.5,0.2);
    sky.render();
    
    var cube2 = new Cube();
    cube2.color = [50/255,50/255,50/255,1];
    cube2.matrix.translate(0,-0.75,0);
    cube2.textureNum = -2;
    cube2.matrix.translate(-0.5,0,-0.5);
    cube2.render();

    var cube3 = new Cube();
    cube3.color = [50/255,50/255,50/255,1];
    cube3.matrix.translate(0,1,0);
    cube3.textureNum = 1;
    cube3.matrix.translate(-0.5,0,-0.5);
    cube3.render();
    

    // Check trhe time at the end of the function, and show on webpage
    var duration = performance.now() - startTime;
    sendTextToHTML('ms: '+ Math.floor(duration) + ' fps: ' + Math.floor(10000/duration)/10, 'fps');
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}

function initTextures() {
    var image =  new Image();  // Create the image object
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    var image1 =  new Image();  // Create the image object
    if (!image1) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture0(image); };
    // Tell the browser to load an image
    image.src = '../resources/sky.jpg';

    image1.onload = function(){ loadTexture1(image1); };
    image1.src = '../resources/numbers.png';
    // add more img files here

    return true;
  }
  
function loadTexture0(image) {

    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
    console.log("finished loading first texture")
  }
  function loadTexture1(image) {

    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
    console.log("finished loading first texture")
  }