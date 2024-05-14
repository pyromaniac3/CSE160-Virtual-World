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
uniform sampler2D u_Sampler;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform sampler2D u_Sampler5;
uniform int u_WhichTexture;
void main() {
    if (u_WhichTexture == -2) {
        gl_FragColor = u_FragColor; // use color
      } else if (u_WhichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0); // use UV debug color
      } else if (u_WhichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler, v_UV);
      } else if (u_WhichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else if (u_WhichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } else if (u_WhichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
      } else if (u_WhichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV);
      } else if (u_WhichTexture == 5) {
        gl_FragColor = texture2D(u_Sampler5, v_UV);
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
let wood = 5;
let roof = 5;

// [[ TEXTURE THINGS ]]
let u_WhichTexture = 0;
let u_Sampler;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;

var map1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

var roof1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

var roof2 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

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
    u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

        // Get the storage location of u_Sampler
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
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
    let oak = document.getElementById('Oak')
    oak.addEventListener("click", function() {
        wood = 5;
    });

    let darkOak = document.getElementById('DarkOak')
    darkOak.addEventListener("click", function() {
        wood = 4;
    }); 

    let arcadia = document.getElementById('Arcadia')
    arcadia.addEventListener("click", function() {
        wood = 3;
    });   
    let oakRoof = document.getElementById('OakRoof')
    oakRoof.addEventListener("click", function() {
        roof = 5;
    });

    let darkOakRoof = document.getElementById('DarkOakRoof')
    darkOakRoof.addEventListener("click", function() {
        roof = 4;
    }); 

    let arcadiaRoof = document.getElementById('ArcadiaRoof')
    arcadiaRoof.addEventListener("click", function() {
        roof = 3;
    });  
    
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
    }else if(ev.keyCode == 69){ //E
        g_globalAngle += 0.5;
    }else if(ev.keyCode == 81){ //Q
        g_globalAngle -= 0.5;
    }else{
        console.log("invalid key");
    }
    
    renderScene();
    console.log(ev.keyCode);

}
var g_eye = [0,2,0];
var g_at = [0,0,-100];
var g_up = [0,1,0];

 function renderScene(){
    var startTime = performance.now();

    // making the projection  matrix 
    var projMat = new Matrix4()
    projMat.setPerspective(50, 1*canvas.width/canvas.height,.1,300);
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

    drawMap(map1,wood,1);
    drawMap(map1,wood,2);
    drawMap(roof1,roof,3);
    drawMap(roof2,roof,4);

    // ground floor
    var ground = new Cube();
    ground.textureNum = 1; // THESE NEEDS TO CHANGE WHEN IT WORKS
    ground.matrix.translate(0,-1,0);
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

function drawMap(map, texture, level){
    for(x=0;x<32;x++){
        for(y=0;y<32;y++){
            if(map[x][y] == 1){
                var body = new Cube();
                body.textureNum = texture;
                body.matrix.translate(x-15,1*level,y-30);
                body.render();
            }
        }
    }
}

function initTextures() {
      let image0 = new Image();
      let image1 = new Image();
      let image2 = new Image();
      let image3 = new Image();
      let image4 = new Image();
      let image5 = new Image();


      image0.src = './resources/sky.png';
      image0.onload = () => {
        loadTexture0(image0);
      }
      image1.src = './resources/ground.png';
      image1.onload = () => {
        loadTexture1(image1);
      }
      image2.src = './resources/door.png';
      image2.onload = () => {
        loadTexture2(image2);
      }
      image3.src = './resources/wood_arcadia.png';
      image3.onload = () => {
        loadTexture3(image3);
      }
      image4.src = './resources/wood_dark_oak.png';
      image4.onload = () => {
        loadTexture4(image4);
      }
      image5.src = './resources/wood_oak.png';
      image5.onload = () => {
        loadTexture5(image5);
      }
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
    gl.uniform1i(u_Sampler, 0);
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
  }

  function loadTexture2(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
  }

  function loadTexture3(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
  }

  function loadTexture4(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE4);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler4, 4);
  }

  function loadTexture5(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE5);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler5, 5);
  }
