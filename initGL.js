/*
    initGL.js - Essential setup for our WebGL application
*/

var canvas; // global to hold reference to an HTML5 canvas
var gl; // global to hold reference to our WebGL context

//string positions within the drawables array
var yellow = "17 8 6 15 21 12 26 3 24";
var white  = "16 7 5 14 22 13 25 4 23";
var green  = "8 7 5 6 0 3 1 4 2"
var blue   = "17 16 14 15 9 12 10 13 11";
var red    = "15 14 5 6 20 24 11 23 2";
var orange = "17 16 7 8 19 26 10 25 1";
//variables to assist each color, using above color variables
var curCubies = "";
var curCube = 0;

// a few simple constants
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

var drawables = []; // used to store any objects that need to be drawn

// lighting variables - add another?
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

/* Initialize global WebGL stuff - not object specific */
function initGL()
{
    // look up our canvas element
    canvas = document.getElementById( "gl-canvas" );

    // obtain a WebGL context bound to our canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height ); // use the whole canvas
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); // background color
    gl.enable(gl.DEPTH_TEST); // required for 3D hidden-surface elimination

    // set the projection matrix
    // note: added rotation just to better see the shapes of our cubes
    // projection = ortho(-2, 2, -1.5, 1.5, -100, 100);
//    projection = mult(projection, rotate(30, [0.5, 1, 0.12]));

    projection = perspective(45, canvas.width / canvas.height, 1, 100);
    var camera = lookAt([3, 2, 6], [0, 0, 0], [0, 1, 0]);

    projection = mult(projection, camera);

    // set up an event handler for this button

    // set up an event handler for projection buttons
    // Camera is set up slightly above the cube looking at a corner
    var c = document.getElementById("Btn_Ortho");
    c.addEventListener("click", function () {
        projection = ortho(-2, 2, -1.5, 1.5, -100, 100);
        camera = lookAt([-3, -2, 3], [0, 0, 0], [0, 1, 0]);
        projection = mult(projection, camera);
    }, false);

    // set up an event handler for projection buttons
    // Camera is set up to look slightly below the cube and at a corner.
    var d = document.getElementById("Btn_Perspective");
    d.addEventListener("click", function () {
        projection = perspective(45, canvas.width / canvas.height, 1, 100);
        camera = lookAt([3, 2, 3], [0, 0, 0], [0, 1, 0]);
        projection = mult(projection, camera);
    }, false);
	
	/*
	var e = document.getElementById("Btn_Orbit");
	e.addEventListener("click",function(){
		orbit(); 
	}, false);
	*/
	

	var btn_yellow = document.getElementById("Btn_TopR");      //yellow
    btn_yellow.addEventListener("click",
        function(){
            disableBtns();
            rotateYellow();
        },
        false
    );	

	var btn_white = document.getElementById("Btn_BotR");         //white
    btn_white.addEventListener("click",
        function(){
            disableBtns();
            rotateWhite();
        },
        false
    );
	
	var btn_green = document.getElementById("Btn_LeftR"); //green
    btn_green.addEventListener("click",
        function(){
            disableBtns();
            rotateGreen();
		},
        false
    );
	
	var btn_blue = document.getElementById("Btn_RightR"); //blue
    btn_blue.addEventListener("click",
        function(){
            disableBtns();
            rotateBlue();
		},
        false
    );
			
	var btn_red = document.getElementById("Btn_RedR"); //red
    btn_red.addEventListener("click",
        function(){
            disableBtns();
            rotateRed();
		},
        false
    );
		
	var btn_orange = document.getElementById("Btn_FrontR"); //orange
    btn_orange.addEventListener("click",
        function(){
            disableBtns();
            rotateOrange();
		},
        false
    );
		
	
}

/* Global render callback - would draw multiple objects if there were more than one */
var renderScene = function(){
    // start from a clean frame buffer for this frame
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // loop over all objects and draw each
    var i;
    for (i in drawables) {
        drawables[i].draw();
    }
    // queue up this same callback for the next frame
    requestAnimFrame(renderScene);
}

function disableBtns() { //TODO: list out all buttons
	document.getElementById('Btn_TopR').disabled = true;
	document.getElementById('Btn_BotR').disabled = true;
	document.getElementById('Btn_LeftR').disabled = true;
	document.getElementById('Btn_RightR').disabled = true;
	document.getElementById('Btn_RedR').disabled = true;
	document.getElementById('Btn_FrontR').disabled = true;
}

function enableBtns() {
	document.getElementById('Btn_TopR').disabled = false;
	document.getElementById('Btn_BotR').disabled = false;
	document.getElementById('Btn_LeftR').disabled = false;
	document.getElementById('Btn_RightR').disabled = false;
	document.getElementById('Btn_RedR').disabled = false;
	document.getElementById('Btn_FrontR').disabled = false;
}
