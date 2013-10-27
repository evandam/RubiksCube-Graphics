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
        this.turn(1, this.ROTATION_AXIS);
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

// NOTE: These won't actually be used since it is initialized from a random state, 
//    but this is good for testing
function rotateYellow() {
    for (var i in yellow) {
        yellow[i].startTurn(Y_AXIS);
    }
}

function rotateWhite() {
    for (var i in white) {
        white[i].startTurn(Y_AXIS);
    }
}

function rotateOrange() {
    for (var i in orange) {
        orange[i].startTurn(X_AXIS);
    }
}

function rotateBlue() {
    for (var i in blue) {
        blue[i].startTurn(Y_AXIS);
    }
}

function rotateGreen() {
    for (var i in green) {
        green[i].startTurn(Y_AXIS);
    }
}

function rotateRed() {
    for (var i in red) {
        red[i].startTurn(Y_AXIS);
    }
}

/* Set up event callback to start the application */
window.onload = function() {
    initGL(); // basic WebGL setup for the scene 

    // load and compile our shaders into a program object
    var shaders = initShaders( gl, "vertex-shader", "fragment-shader" );

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
    var top = makeSide(shaders, colors, Y_AXIS);
    for (var i in top) {
        top[i].move(1.01, Y_AXIS);
        drawables.push(top[i]);
    }

    // white (bottom) is next in array (9-17)
    var bottom = makeSide(shaders, colors, Y_AXIS);
    for (var i in bottom) {
        bottom[i].move(-1.01, Y_AXIS);
        drawables.push(bottom[i]);
    }

    var middle = makeSide(shaders, colors, Y_AXIS);
    for (var i in middle) {
        drawables.push(middle[i]);
    }
    

    yellow = top;   // all cubes of top row are yellow
    white = bottom; // all cubes on bottom are white
    orange = [
        top[1],
        top[7],
        top[8],
        middle[1],
        middle[7],
        middle[8],
        bottom[1],
        bottom[7],
        bottom[8]
    ];

    rotateOrange();

    renderScene(); // begin render loop
}

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
                                  
  side[1].move(1.01, AXIS_1);   
  
  side[2].move(-1.01, AXIS_1); 
  
  side[3].move(1.01, AXIS_2);  
  
  side[4].move(-1.01, AXIS_2);  
 
  side[5].move(-1.01, AXIS_2);  
  side[5].move(-1.01, AXIS_1);
  
  side[6].move(1.01, AXIS_2);  
  side[6].move(-1.01, AXIS_1);
  
  side[7].move(-1.01, AXIS_2); 
  side[7].move(1.01, AXIS_1);
  
  side[8].move(1.01, AXIS_2);   
  side[8].move(1.01, AXIS_1);
  
  return side;
  
}

