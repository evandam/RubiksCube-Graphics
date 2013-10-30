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
var isTurning = false;  // we should only be performing one rotation at a time

// an easy to access map of colors to vectors
const COLORS = {
    G: vec4(0.0, 0.7, 0.0, 1.0),   // green - front
    O: vec4(1.0, 0.4, 0.0, 1.0),   // orange - right
    W: vec4(1.0, 1.0, 1.0, 1.0),   // white - bottom
    Y: vec4(1.0, 1.0, 0.0, 1.0),   // yellow - top
    B: vec4(0.0, 0.0, 1.0, 1.0),   // blue - back
    R: vec4(1.0, 0.0, 0.0, 1.0)    // red - left
};

/* Initialize properties of this color cube object. 
 */
Cube.prototype.init = function (program, faceColors) {
    this.points = []; // this array will hold raw vertex positions
    this.colors = []; // this array will hold per-vertex color data
    this.normalsArray = [];  // this will hold the normal vector to each vertex
    this.transform = mat4(); // initialize object transform as identity matrix

    this.materialAmbient = vec4(0.1, 0.1, 0.1, 1.0);
    this.materialDiffuse = vec4(0.3, 0.3, 0.3, 1.0);    // determines the color reflected
    this.materialSpecular = vec4(0.7, 0.7, 0.7, 1.0);
    this.materialShininess = 100.0;

    // TODO make sure we pass the face colors into this call
    this.mkcube(faceColors); // delegate to auxiliary function

    this.program = program; // Load shaders and initialize attribute buffer

    this.cBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBufferId); // set active array buffer
    /* send vert colors to the buffer, must repeat this
       wherever we change the vert colors for this cube */
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

    this.vBufferId = gl.createBuffer(); // reserve a buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBufferId); // set active array buffer
    /* send vert positions to the buffer, must repeat this
       wherever we change the vert positions for this cube */
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);

};

Cube.prototype.draw = function () {
    /* Check if the cube needs to be turned. Enable buttons on last turn. */
    if (this.right_turns > 0) {
        this.turn(-1, Y_AXIS);
        this.right_turns--;
        if (this.right_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    else if (this.left_turns > 0) {
        this.turn(1, Y_AXIS);
        this.left_turns--;
        if (this.left_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    else if (this.forward_turns > 0) {
        this.turn(-1, Z_AXIS);
        this.forward_turns--;
        if (this.forward_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    else if (this.backward_turns > 0) {
        this.turn(1, Z_AXIS);
        this.backward_turns--;
        if (this.backward_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    else if (this.near_turns > 0) {
        this.turn(-1, X_AXIS);
        this.near_turns--;
        if (this.near_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    else if (this.far_turns > 0) {
        this.turn(1, X_AXIS);
        this.far_turns--;
        if (this.far_turns === 0) {
            enableBtns();
            isTurning = false;
        }
    }

    gl.useProgram(this.program); // set the current shader programs

    var projId = gl.getUniformLocation(this.program, "projectionMatrix");
    gl.uniformMatrix4fv(projId, false, flatten(projection));

    var xformId = gl.getUniformLocation(this.program, "modelViewMatrix");
    gl.uniformMatrix4fv(xformId, false, flatten(this.transform));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBufferId); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vColorId = gl.getAttribLocation(this.program, "vColor");
    gl.vertexAttribPointer(vColorId, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColorId);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBufferId); // set active array buffer
    // map buffer data to the vertex shader attribute
    var vPosId = gl.getAttribLocation(this.program, "vPosition");
    gl.vertexAttribPointer(vPosId, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosId);

    // bind variables to the shader program for lighting
    // the color that the vertex will be
    this.materialDiffuse = this.colors[Math.floor(Math.random() * 6)];

    var ambientProduct = mult(lightAmbient, this.materialAmbient);
    var diffuseProduct = mult(lightDiffuse, this.materialDiffuse);
    var specularProduct = mult(lightSpecular, this.materialSpecular);

    // normals array
    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normalsArray), gl.STATIC_DRAW);

    this.vNormal = gl.getAttribLocation(this.program, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vNormal);

    gl.uniform4fv(gl.getUniformLocation(this.program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "diffuseProduct"),
       flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "specularProduct"),
       flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(this.program, "lightPosition"),
       flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(this.program,
       "shininess"), this.materialShininess);

    // now push buffer data through the pipeline to render this object
    gl.drawArrays(gl.TRIANGLES, 0, this.numverts());
};

/* Returns the total count of vertices to be sent into the pipeline. */
Cube.prototype.numverts = function () { return this.points.length; };

/* Default vertex positions for unit cube centered at the origin. */
Cube.prototype.vertices = [
    [-0.5, -0.5, 0.5, 1.0],
    [-0.5, 0.5, 0.5, 1.0],
    [0.5, 0.5, 0.5, 1.0],
    [0.5, -0.5, 0.5, 1.0],
    [-0.5, -0.5, -0.5, 1.0],
    [-0.5, 0.5, -0.5, 1.0],
    [0.5, 0.5, -0.5, 1.0],
    [0.5, -0.5, -0.5, 1.0]
];

/* Default vertex colors for the color cube. */
Cube.prototype.vcolors = [
    [0.0, 0.0, 0.0, 1.0], // black
    [1.0, 0.0, 0.0, 1.0], // red
    [1.0, 1.0, 0.0, 1.0], // yellow
    [0.0, 1.0, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [1.0, 1.0, 1.0, 1.0], // white
    [0.0, 1.0, 1.0, 1.0],  // cyan
    [1.0, 1.0, 1.0, 1.0]    // orange
];

/*
    Build one of the faces for this cube object.

    TODO change this so that we specify a single color (via a
        parameter) for the quad face instead of using vcolors
*/
Cube.prototype.mkquad = function (a, b, c, d, color) {
    // calculate the normal by using points on a plane
    var t1 = subtract(this.vertices[b], this.vertices[a]);
    var t2 = subtract(this.vertices[c], this.vertices[b]);
    var normal = normalize(vec3(cross(t1, t2)));

    this.points.push(vec4(this.vertices[a]));

    this.points.push(vec4(this.vertices[b]));

    this.points.push(vec4(this.vertices[c]));

    this.points.push(vec4(this.vertices[a]));

    this.points.push(vec4(this.vertices[c]));

    this.points.push(vec4(this.vertices[d]));

    // push all colors and normals at once since same now
    for (var i = 0; i < 6; i++) {
        this.colors.push(color);
        this.normalsArray.push(normal);
    }
};

/*
    Build all faces of this cube object.
    TODO change this so that we specify the colors (via parameter)
        for the different faces and pass them into mkquad 
*/
Cube.prototype.mkcube = function (colors) {
    this.mkquad(1, 0, 3, 2, colors[0]);
    this.mkquad(2, 3, 7, 6, colors[1]);
    this.mkquad(3, 0, 4, 7, colors[2]);
    this.mkquad(6, 5, 1, 2, colors[3]);
    this.mkquad(4, 5, 6, 7, colors[4]);
    this.mkquad(5, 4, 0, 1, colors[5]);
};

/* Translate this cube along the specified canonical axis. */
Cube.prototype.move = function (dist, axis) {
    var delta = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    delta[axis] = dist;
    // flipped order of multiplication
    this.transform = mult(translate(delta), this.transform);
};

/* Rotate this cube around the center of the rubiks cube. */
Cube.prototype.turn = function (angle, axis) {
    var avec = [0, 0, 0];

    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;

    this.transform = mult(rotate(angle, avec), this.transform);
};

/* Rotate this cube around the specified canonical axis. */
Cube.prototype.turnSingle = function (angle, axis) {
    var avec = [0, 0, 0];
    if (axis === undefined) axis = Y_AXIS;
    avec[axis] = 1;
    this.transform = mult(this.transform, rotate(angle, avec));
};

/* Init the member var so it will be read in the draw function */
Cube.prototype.startLeftTurn = function () {
    this.left_turns = 90;
    isTurning = true;
};
Cube.prototype.startRightTurn = function () {
    this.right_turns = 90;
    isTurning = true;
};
Cube.prototype.startForwardTurn = function () {
    this.forward_turns = 90;
    isTurning = true;
};
Cube.prototype.startBackwardTurn = function () {
    this.backward_turns = 90;
    isTurning = true;
};
Cube.prototype.startFarTurn = function () {
    this.far_turns = 90;
    isTurning = true;
};
Cube.prototype.startNearTurn = function () {
    this.near_turns = 90;
    isTurning = true;
};

function setColors(currentSide) {

    var colors;
    for (var cur = 0; cur < currentSide.length; cur++) {
        switch (currentSide[cur]) {
            case 'R':
                console.log("RED");
                colors = [
					vec4(1.0, 0.0, 0.0, 1.0),// red - front
					vec4(0.0, 0.7, 0.0, 1.0),//green - right
					vec4(1.0, 1.0, 1.0, 1.0),// white -bottom
					vec4(1.0, 1.0, 0.0, 1.0),//yellow - top
					vec4(1.0, 0.2, 0.0, 1.0),//orange - back
					vec4(0.0, 0.0, 1.0, 1.0)// blue - left
                ];
                break;
            case 'O':
                console.log("ORANGE");
                colors = [
					vec4(1.0, 0.2, 0.0, 1.0), // orange - front
					vec4(0.0, 0.0, 1.0, 1.0), // blue - right
					vec4(1.0, 1.0, 1.0, 1.0), // white - bottom
					vec4(1.0, 1.0, 0.0, 1.0), // yellow - top
					vec4(1.0, 0.0, 0.0, 1.0), // red - back 
					vec4(0.0, 0.7, 0.0, 1.0)  // green - left
                ];
                break;
            case 'Y':
                console.log("YELLOW");
                colors = [
					vec4(1.0, 1.0, 0.0, 1.0), // yellow - front
					vec4(1.0, 0.2, 0.0, 1.0), // orange - right
					vec4(0.0, 0.7, 0.0, 1.0), // green - bottom
					vec4(0.0, 0.0, 1.0, 1.0), // blue - top
					vec4(1.0, 1.0, 1.0, 1.0), // white - back
					vec4(1.0, 0.0, 0.0, 1.0)  // red - left
                ];
                break;
            case 'G':
                console.log("GREEN");
                colors = [
					vec4(0.0, 0.7, 0.0, 1.0),   // green - front
					vec4(1.0, 0.2, 0.0, 1.0),   // orange - right
					vec4(1.0, 1.0, 1.0, 1.0),   // white - bottom
					vec4(1.0, 1.0, 0.0, 1.0),   // yellow - top
					vec4(0.0, 0.0, 1.0, 1.0),   // blue - back
					vec4(1.0, 0.0, 0.0, 1.0)    // red - left
                ];
                console.log(colors[0]);
                break;
            case 'B':
                console.log("BLUE");
                colors = [
					vec4(0.0, 0.0, 1.0, 1.0), // blue - front
					vec4(1.0, 0.0, 0.0, 1.0), // red - right
					vec4(1.0, 1.0, 1.0, 1.0), // white - bottom
					vec4(1.0, 1.0, 0.0, 1.0), // yellow - top
					vec4(0.0, 0.7, 0.0, 1.0), // green - back
					vec4(1.0, 0.2, 0.0, 1.0)  // orange - left
                ];
                break;
            case 'W':
                console.log("WHITE");
                colors = [
					vec4(1.0, 1.0, 1.0, 1.0), // white - front
					vec4(1.0, 0.2, 0.0, 1.0), // orange - right
					vec4(0.0, 0.0, 1.0, 1.0), // blue - bottom
					vec4(0.0, 0.7, 0.0, 1.0), // green - top
					vec4(1.0, 1.0, 0.0, 1.0), // yellow - back 
					vec4(1.0, 0.0, 0.0, 1.0)  // red - left
                ];
                break;
        }
    }
    return colors;
}

/* Set up event callback to start the application */
window.onload = function () {
    initGL(); // basic WebGL setup for the scene 

    // makeCubes();
    var colors = [];
    for (var i = 0; i < 27; i++) {
        colors[i] = [
            COLORS.G,
            COLORS.O,
            COLORS.W,
            COLORS.Y,
            COLORS.B,
            COLORS.R
        ];
    }
    makeCubesFromColors(colors);

    renderScene(); // begin render loop
};

// colors is an array of arrays for each cubie
// that specifies the visible faces
function makeCubesFromColors(colors) {

    // load and compile our shaders into a program object
    var shaders = initShaders(gl, "vertex-shader", "fragment-shader");

    // make sure our drawables array is empty
    drawables = [];

    var dist = 1.03;

    /* --- FRONT --- */
    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    /* --- back --- */
    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Z_AXIS);
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    /* --- MIDDLE --- */
    drawables[drawables.length] = new Cube(shaders, colors.shift());

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Y_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(-dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(-dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

    drawables[drawables.length] = new Cube(shaders, colors.shift());
    drawables[drawables.length - 1].move(dist, Y_AXIS);
    drawables[drawables.length - 1].move(dist, X_AXIS);

}

// initialize all 27 cubies default in goal state
function makeCubes() {
    colors[5][5] = COLORS['R'];
    colors[23][5] = COLORS['R'];
    colors[14][5] = COLORS['R'];
    colors[2][5] = COLORS['R'];
    colors[20][5] = COLORS['R'];
    colors[11][5] = COLORS['R'];
    colors[6][5] = COLORS['R'];
    colors[24][5] = COLORS['R'];
    colors[15][5] = COLORS['R'];

    // set the green face
    colors[5][0] = COLORS['G'];
    colors[2][0] = COLORS['G'];
    colors[6][0] = COLORS['G'];
    colors[4][0] = COLORS['G'];
    colors[0][0] = COLORS['G'];
    colors[3][0] = COLORS['G'];
    colors[7][0] = COLORS['G'];
    colors[1][0] = COLORS['G'];
    colors[8][0] = COLORS['G'];

    // set the yellow face
    colors[6][3] = COLORS['Y'];
    colors[24][3] = COLORS['Y'];
    colors[15][3] = COLORS['Y'];
    colors[3][3] = COLORS['Y'];
    colors[21][3] = COLORS['Y'];
    colors[12][3] = COLORS['Y'];
    colors[8][3] = COLORS['Y'];
    colors[26][3] = COLORS['Y'];
    colors[17][3] = COLORS['Y'];

    // set the blue face
    colors[15][4] = COLORS['B'];
    colors[11][4] = COLORS['B'];
    colors[14][4] = COLORS['B'];
    colors[12][4] = COLORS['B'];
    colors[9][4] = COLORS['B'];
    colors[13][4] = COLORS['B'];
    colors[17][4] = COLORS['B'];
    colors[10][4] = COLORS['B'];
    colors[16][4] = COLORS['B'];

    // set the orange face
    colors[8][1] = COLORS['O'];
    colors[26][1] = COLORS['O'];
    colors[17][1] = COLORS['O'];
    colors[1][1] = COLORS['O'];
    colors[19][1] = COLORS['O'];
    colors[10][1] = COLORS['O'];
    colors[7][1] = COLORS['O'];
    colors[25][1] = COLORS['O'];
    colors[16][1] = COLORS['O'];

    // set the white face (last but not least)
    colors[7][2] = COLORS['W'];
    colors[25][2] = COLORS['W'];
    colors[16][2] = COLORS['W'];
    colors[4][2] = COLORS['W'];
    colors[22][2] = COLORS['W'];
    colors[13][2] = COLORS['W'];
    colors[5][2] = COLORS['W'];
    colors[23][2] = COLORS['W'];
    colors[14][2] = COLORS['W'];
}

function makeSide(shaders, colors) {
    var side = []

    for (var i = 0; i < 9; i++) {
        //for(var j = 0; j<9; j++){
        //side.push(new Cube(shaders, colors[j]));
        //}
        side.push(new Cube(shaders, colors));
    }

    side[1].move(1.01, X_AXIS);

    side[2].move(-1.01, X_AXIS);

    side[3].move(1.01, Y_AXIS);

    side[4].move(-1.01, Y_AXIS);

    side[5].move(-1.01, Y_AXIS);
    side[5].move(-1.01, X_AXIS);

    side[6].move(1.01, Y_AXIS);
    side[6].move(-1.01, X_AXIS);

    side[7].move(-1.01, Y_AXIS);
    side[7].move(1.01, X_AXIS);

    side[8].move(1.01, Y_AXIS);
    side[8].move(1.01, X_AXIS);

    return side;

}

// start off by trying to orbit the cubes on green face(drawables[0-9])
// need to think about arranging cubes to get a side mathematically...want to just work on orbit function for now...
function orbit() {
    var cubes1 = drawables.slice(0, 9);
    var cubes2 = drawables.slice(9, 18);
    var cubes3 = drawables.slice(18, 27);
    var center = cubes1[19];  //center?
    for (cube in cubes1) {			//front
        cubes1[cube].startLeftTurn();
    }
    for (cube in cubes2) {			//back
        cubes2[cube].startLeftTurn();
    }
    for (cube in cubes3) {			//middle
        cubes3[cube].startLeftTurn();
    }
}

function rotateYellow() {
    curCubies = yellow.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startRightTurn();
        curCube++;
    }

    //resets cubies				
    var temp = drawables[6];
    drawables[6] = drawables[8];
    drawables[8] = drawables[17];
    drawables[17] = drawables[15];
    drawables[15] = temp;
    temp = drawables[3];
    drawables[3] = drawables[26];
    drawables[26] = drawables[12];
    drawables[12] = drawables[24];
    drawables[24] = temp;

    //resets variables
    curCube = 0;
    curCubies = "";
}

function rotateWhite() {
    curCubies = white.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startLeftTurn();
        curCube++;
    }

    //resets cubies	
    /* var temp = drawables[13];
    drawables[13] = drawables[23];
    drawables[23] = drawables[4];
    drawables[4] = drawables[25];
    drawables[25] = temp;
    temp = drawables[16];
    drawables[16] = drawables[14];
    drawables[14] = drawables[5];
    drawables[5] = drawables[7];
    drawables[7] = temp;
    */
    var tmp = drawables[7];
    drawables[7] = drawables[5];
    drawables[5] = drawables[14];
    drawables[14] = drawables[16];
    drawables[16] = tmp;
    tmp = drawables[25];
    drawables[25] = drawables[4];
    drawables[4] = drawables[23];
    drawables[23] = drawables[13];
    drawables[13] = tmp;

    //resets variables
    curCube = 0;
    curCubies = "";
}

function rotateGreen() {
    curCubies = green.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startForwardTurn();
        curCube++;
    }

    //resets cubies	
    var temp = drawables[3];
    drawables[3] = drawables[2];
    drawables[2] = drawables[4];
    drawables[4] = drawables[1];
    drawables[1] = temp;
    temp = drawables[8];
    drawables[8] = drawables[6];
    drawables[6] = drawables[5];
    drawables[5] = drawables[7];
    drawables[7] = temp;

    //resets variables
    curCube = 0;
    curCubies = "";
}

function rotateBlue() {
    curCubies = blue.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startBackwardTurn();
        curCube++;
    }

    //resets cubies	
    /*
    var temp = drawables[12];
    drawables[12] = drawables[11];
    drawables[11] = drawables[13];
    drawables[13] = drawables[10];
    drawables[10] = temp;
    temp = drawables[17];
    drawables[17] = drawables[15];
    drawables[15] = drawables[14];
    drawables[14] = drawables[16];
    drawables[16] = temp;
    */
    var temp = drawables[15];
    drawables[15] = drawables[17];
    drawables[17] = drawables[16];
    drawables[16] = drawables[14];
    drawables[14] = temp;
    temp = drawables[11];
    drawables[11] = drawables[12];
    drawables[12] = drawables[10];
    drawables[10] = drawables[13];
    drawables[13] = temp;

    //resets variables
    curCube = 0;
    curCubies = "";
}

function rotateRed() {
    curCubies = red.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startFarTurn();
        curCube++;
    }

    //resets cubies				
    /*
    var temp = drawables[24];
    drawables[24] = drawables[2];
    drawables[2] = drawables[23];
    drawables[23] = drawables[11];
    drawables[11] = temp;
    temp = drawables[15];
    drawables[15] = drawables[6];
    drawables[6] = drawables[5];
    drawables[5] = drawables[14];
    drawables[14] = temp;
    */
    var temp = drawables[5];
    drawables[5] = drawables[6];
    drawables[6] = drawables[15];
    drawables[15] = drawables[14];
    drawables[14] = temp;
    temp = drawables[23];
    drawables[23] = drawables[2];
    drawables[2] = drawables[24];
    drawables[24] = drawables[11];
    drawables[11] = temp;

    //resets variables
    curCube = 0;
    curCubies = "";
}

function rotateOrange() {
    curCubies = orange.split(" ");
    while (curCube < curCubies.length) {
        drawables[curCubies[curCube]].startNearTurn();
        curCube++;
    }

    //resets cubies			
    var temp = drawables[26];
    drawables[26] = drawables[1];
    drawables[1] = drawables[25];
    drawables[25] = drawables[10];
    drawables[10] = temp;
    temp = drawables[17];
    drawables[17] = drawables[8];
    drawables[8] = drawables[7];
    drawables[7] = drawables[16];
    drawables[16] = temp;

    //resets variables
    curCube = 0;
    curCubies = "";
}
