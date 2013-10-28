/*
    cube.js - Drawable WebGL cube object definition

    IMPORTANT NOTE:
    This scripts assumes that the initGL.js script has already been loaded,
    and that consequently a variety of global variables are already defined,
    such as: gl, drawables, X_AXIS, Y_AXIS, Z_AXIS
*/

/*
    Constructor for ColorCube objects
    TODO add additional parameter(s) so we can specify colors for each face
        and we probably should pass these through to init()
 */
var Cube = function (program, faceColors) { this.init(program, faceColors); }

/* Initialize properties of this color cube object. 
 */

// use this along with the drawables array.
// this array holds the index position for each cubie
var cubePositions = [];
for (var i = 0; i < 27; i++)
    cubePositions[i] = i;

// indexes for each color in the positions array
var yellow = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var white = [18, 19, 20, 21, 22, 23, 24, 25, 26];
var orange = [1, 7, 8, 10, 16, 17, 19, 25, 26];
var green = [3, 6, 8, 12, 15, 17, 21, 24, 26];
var blue = [4, 5, 7, 13, 14, 16, 22, 23, 25];
var red = [2, 5, 6, 11, 14, 15, 20, 23, 24];


Cube.prototype.init = function(program, faceColors)
{
    this.points = []; // this array will hold raw vertex positions
    this.colors = []; // this array will hold per-vertex color data
    this.transform = mat4(); // initialize object transform as identity matrix

    // TODO make sure we pass the face colors into this call
    this.mkcube(faceColors); // delegate to auxiliary function

    this.program = program; // Load shaders and initialize attribute buffers

    this.cBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferId ); // set active array buffer
    /* send vert colors to the buffer, must repeat this
       wherever we change the vert colors for this cube */
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );

    this.vBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    /* send vert positions to the buffer, must repeat this
       wherever we change the vert positions for this cube */
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);

    // keep a variable that determines which way to rotate the cube
    this.ROTATION_AXIS = 0;
}

Cube.prototype.draw = function(){
    gl.useProgram( this.program ); // set the current shader programs

    var projId = gl.getUniformLocation(this.program, "projection"); 
    gl.uniformMatrix4fv(projId, false, flatten(projection));

    var xformId = gl.getUniformLocation(this.program, "modeltransform");
    gl.uniformMatrix4fv(xformId, false, flatten(this.transform));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferId ); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vColorId = gl.getAttribLocation( this.program, "vColor" );
    gl.vertexAttribPointer( vColorId, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColorId );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferId ); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vPosId = gl.getAttribLocation( this.program, "vPosition" );
    gl.vertexAttribPointer( vPosId, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosId );

    /* Check if the cube needs to be turned. Enable buttons on last turn. */
    if (this.turns > 0) {
        this.turn(-1, this.ROTATION_AXIS);
        this.turns--;
        if (this.turns === 0)
            enableBtns();
    }

    // now push buffer data through the pipeline to render this object
    gl.drawArrays( gl.TRIANGLES, 0, this.numverts() );
}

/* Returns the total count of vertices to be sent into the pipeline. */
Cube.prototype.numverts = function() {return this.points.length;};

/* Default vertex positions for unit cube centered at the origin. */
Cube.prototype.vertices = [
    [ -0.5, -0.5,  0.5, 1.0 ],
    [ -0.5,  0.5,  0.5, 1.0 ],
    [  0.5,  0.5,  0.5, 1.0 ],
    [  0.5, -0.5,  0.5, 1.0 ],
    [ -0.5, -0.5, -0.5, 1.0 ],
    [ -0.5,  0.5, -0.5, 1.0 ],
    [  0.5,  0.5, -0.5, 1.0 ],
    [  0.5, -0.5, -0.5, 1.0 ]
];

/* Default vertex colors for the color cube. */
Cube.prototype.vcolors = [
    [ 0.0, 0.0, 0.0, 1.0 ], // black
    [ 1.0, 0.0, 0.0, 1.0 ], // red
    [ 1.0, 1.0, 0.0, 1.0 ], // yellow
    [ 0.0, 1.0, 0.0, 1.0 ], // green
    [ 0.0, 0.0, 1.0, 1.0 ], // blue
    [ 1.0, 0.0, 1.0, 1.0 ], // magenta
    [ 1.0, 1.0, 1.0, 1.0 ], // white
    [0.0, 1.0, 1.0, 1.0]  // cyan
    [1.0, 1.0, 1.0, 1.0]    // orange
];

/*
    Build one of the faces for this cube object.

    TODO change this so that we specify a single color (via a
        parameter) for the quad face instead of using vcolors
*/
Cube.prototype.mkquad = function(a, b, c, d, color)
{
    this.points.push( vec4(this.vertices[a]) );

    this.points.push( vec4(this.vertices[b]) );

    this.points.push( vec4(this.vertices[c]) );

    this.points.push( vec4(this.vertices[a]) );

    this.points.push( vec4(this.vertices[c]) );

    this.points.push( vec4(this.vertices[d]) );
    
    // push all colors at once since same now
    for (var i = 0; i < 6; i++)
        this.colors.push(color);
}

/*
    Build all faces of this cube object.
    TODO change this so that we specify the colors (via parameter)
        for the different faces and pass them into mkquad 
*/
Cube.prototype.mkcube = function(colors)
{
    this.mkquad( 1, 0, 3, 2, colors[0] );
    this.mkquad( 2, 3, 7, 6, colors[1] );
    this.mkquad( 3, 0, 4, 7, colors[2] );
    this.mkquad( 6, 5, 1, 2, colors[3] );
    this.mkquad( 4, 5, 6, 7, colors[4] );
    this.mkquad( 5, 4, 0, 1, colors[5] );
}

/* Translate this cube along the specified canonical axis. */
Cube.prototype.move = function(dist, axis){
    var delta = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    delta[axis] = dist;
    // flipped order of multiplication
    this.transform = mult(translate(delta), this.transform);
}

/* Rotate this cube around the specified canonical axis. */
Cube.prototype.turn = function(angle, axis){
    var avec = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;

    this.transform = mult(rotate(angle, avec), this.transform);
}

/* Init the member var so it will be read in the draw function */
Cube.prototype.startTurn = function (axis) {
    this.turns = 90;
    this.ROTATION_AXIS = axis;
}

// Rotate a subset of cubies along an axis around the origin
Cube.prototype.orbit = function (cubes, axis) {
    for (cube in cubes) {
        cubes[cube].startTurn(axis);
    }
};

// side is the global array of index positions for that side
Cube.prototype.rotateSide = function (sideIndexes, axis) {
    for (var i = 0; i < cubePositions.length; i++) {
        // we want to rotate any cubes in these positions
        if (sideIndexes.indexOf(cubePositions[i]) > -1) {
            drawables[cubePositions[i]].startTurn(axis);
        }
    }
    // now swap positions
    var newPositions = cubePositions.splice(0);
    for (var i = 0; i < sideIndexes.length / 2; i++) {
        switch (sideIndexes[i]) {
            case 1:
                newPositions[i] = sideIndexes[3];
                break;
            case 2:
                newPositions[i] = sideIndexes[4];
                break;
            case 3:
                newPositions[i] = sideIndexes[2];
                break;
            case 4:
                newPositions[i] = sideIndexes[1];
                break;
            case 5:
                newPositions[i] = sideIndexes[7];
                break;
            case 6:
                newPositions[i] = sideIndexes[5];
                break;
            case 7:
                newPositions[i] = sideIndexes[8];
                break;
            default:
                newPositions[i] = sideIndexes[6];
        }
    }
    cubePositions = newPositions;

}
// NOTE: These won't actually be used since it is initialized from a random state, 
//    but this is good for testing
function rotateYellow() {
    Cube.prototype.rotateSide(yellow, Y_AXIS);
}

function rotateWhite() {
    Cube.prototype.rotateSide(white, Y_AXIS);
}

function rotateOrange() {
    Cube.prototype.rotateSide(orange, X_AXIS);
}

function rotateBlue() {
    Cube.prototype.rotateSide(blue, Z_AXIS);
}

function rotateGreen() {
    Cube.prototype.rotateSide(green, Z_AXIS);
}

function rotateRed() {
    Cube.prototype.rotateSide(red, X_AXIS);
}

/* Set up event callback to start the application */
window.onload = function () {
    initGL(); // basic WebGL setup for the scene 

    // load and compile our shaders into a program object
    var shaders = initShaders(gl, "vertex-shader", "fragment-shader");

    // define custom colors
    var colors = [
        vec4(0.0, 0.7, 0.0, 1.0),   // green - front
        vec4(1.0, 0.5, 0.0, 1.0),   // orange - right
        vec4(1.0, 1.0, 1.0, 1.0),   // white - bottom
        vec4(1.0, 1.0, 0.0, 1.0),   // yellow - top
        vec4(0.0, 0.0, 1.0, 1.0),   // blue - back
        vec4(1.0, 0.0, 0.0, 1.0)    // red - left
    ];


    // top row of cubes (yellow)
    var topCubes = makeSide(shaders, colors, Y_AXIS);
    for (var i in topCubes) {
        topCubes[i].move(1.01, Y_AXIS);
        drawables.push(topCubes[i]);
    }

    var middleCubes = makeSide(shaders, colors, Y_AXIS);
    for (var i in middleCubes) {
        drawables.push(middleCubes[i]);
    }

    // white (bottom) is next in array (9-17)
    var bottomCubes = makeSide(shaders, colors, Y_AXIS);
    for (var i in bottomCubes) {
        bottomCubes[i].move(-1.01, Y_AXIS);
        drawables.push(bottomCubes[i]);
    }

    renderScene(); // begin render loop
};

// a helper function that makes 9 cubes at a time along a specified axis
function makeSide(shaders, colors, axis) {
    var AXIS_1, AXIS_2;

    if (axis == X_AXIS) {
        AXIS_1 = Y_AXIS;
        AXIS_2 = Z_AXIS;
    }
    else if (axis == Y_AXIS) {
        AXIS_1 = X_AXIS;
        AXIS_2 = Z_AXIS;
    }
    else {
        AXIS_1 = X_AXIS;
        AXIS_2 = Y_AXIS;
    }

    var side = [];
  
  for(var i = 0; i < 9; i++) {
    side.push(new Cube(shaders, colors));
  }
                                  
  side[1].move(1.01, AXIS_1);   // right-center
  
  side[2].move(-1.01, AXIS_1);  // left-center
  
  side[3].move(1.01, AXIS_2);   // top-center
  
  side[4].move(-1.01, AXIS_2);  // bottom-center
 
  side[5].move(-1.01, AXIS_2);  // bottom-left
  side[5].move(-1.01, AXIS_1);
  
  side[6].move(1.01, AXIS_2);   // top-left
  side[6].move(-1.01, AXIS_1);
  
  side[7].move(-1.01, AXIS_2);  // bottom-right
  side[7].move(1.01, AXIS_1);
  
  side[8].move(1.01, AXIS_2);   // top-right
  side[8].move(1.01, AXIS_1);
  
  return side;
  
} 

// value on a single face (0-8) after a quarter clockwise turn
// I don't know if this makes sense anymore...only specific to top
function getNewIndex(index) {
    switch (index) {
        case 1:
            return 4;
        case 2:
            return 3;
        case 3:
            return 1;
        case 4:
            return 2;
        case 5:
            return 6;
        case 6:
            return 8;
        case 7:
            return 5;
        default:
            return 7;
    }
}

