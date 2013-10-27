/*
    initGL.js - Essential setup for our WebGL application
*/

var canvas; // global to hold reference to an HTML5 canvas
var gl; // global to hold reference to our WebGL context

// a few simple constants
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;

var drawables = []; // used to store any objects that need to be drawn

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
    projection = ortho(-2, 2, -1.5, 1.5, -100, 100);
//    projection = mult(projection, rotate(30, [0.5, 1, 0.12]));

//    projection = perspective(45, canvas.width / canvas.height, 1, 100);
    var camera = lookAt([3, 2, 3], [0, 0, 0], [0, 1, 0]);

    projection = mult(projection, camera);

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

    btns = [
        document.getElementById('Btn_RED'),
        document.getElementById('Btn_ORANGE'),
        document.getElementById('Btn_YELLOW'),
        document.getElementById('Btn_GREEN'),
        document.getElementById('Btn_BLUE'),
        document.getElementById('Btn_WHITE')
    ];

    console.log(btns);

    // set up an event handler for rotating all faces
    btns[0].addEventListener("click",
        function () {
            disableBtns();
            rotateRed();
        },
        false
    );

    btns[1].addEventListener("click",
        function () {
            disableBtns();
            rotateOrange();
        },
        false
    );

    btns[2].addEventListener("click",
        function () {
            disableBtns();
            rotateYellow();
        },
        false
    );

    btns[3].addEventListener("click",
        function () {
            disableBtns();
            rotateGreen();
        },
        false
    );

    btns[4].addEventListener("click",
        function () {
            disableBtns();
            rotateBlue();
        },
        false
    );

    btns[5].addEventListener("click",
        function () {
            disableBtns();
            rotateWhite();
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

function disableBtns() {
    for (var i in btns)
        btns[i].disabled = true;
}

function enableBtns() {
    for (var i in btns)
        btns[i].disabled = false;
}