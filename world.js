 // Draw a shape when mouse is clicked
 // ColoredPoints.js
 // Vertex shader program
 var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 u_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix; 
    uniform mat4 u_ViewMatrix; 
    uniform mat4 u_ProjectionMatrix; 
    void main(){
        gl_Position = u_Projectionmatrix * u_View matrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

 // Fragment shader program -- chaning the colors?
 var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UC;
    uniform vec4 u_FragColor; 
    void main(){
        gl_FragColor = u_FragColor;
        //gl_FragColor - vec4(v_UC, 1,1);
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

// drawing
var berryList = [];
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
    
    // Get the storage location of attribute variable
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_UV');
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
   
}

 function main() {

    // [[ SET UP FUNCTIONS ]]
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Set Canvas Color
    gl.clearColor(75/255, 97/255, 84/255, 1.0);
    
    // call anim fram
    requestAnimationFrame(tick);
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

 function renderScene(){
    var startTime = performance.now();
    // making the rotational matrix 
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    // Clear Canvas
   // gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);


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