// read in a file via HTML5's File API
// parse out the cube state, initialize a cube and solve it
var lines;
var string = [];
var r_side = [];
var o_side = [];
var y_side = [];
var g_side = [];
var b_side = [];
var w_side = [];

document.getElementById('stateFileInput').addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function () {
        return function (e) {
            // array for each cubie specifying the necessary colors of visible faces.
            // initialize all to black, visible ones will be set while parsing file.
            colors = [];
            for (var i = 0; i < 27; i++) {
                colors[i] = [];
                for (var j = 0; j < 9; j++) {
                    colors[i][j] = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            lines = e.target.result.split('\n');

            // break down string into array of array (of chars)
            for (var line in lines) {
                string = string.concat(lines[line].toString().trim().split(''));
            }
            // console.log(string);

            r_side = string.slice(0, 9);
            
            g_side = string.slice(9, 12);
            g_side = g_side.concat(string.slice(18, 21));
            g_side = g_side.concat(string.slice(27, 30));

            y_side = string.slice(12, 15);
            y_side = y_side.concat(string.slice(21, 24));
            y_side = y_side.concat(string.slice(30, 33));

            b_side = string.slice(15, 18);
            b_side = b_side.concat(string.slice(24, 27));
            b_side = b_side.concat(string.slice(33, 36));

            o_side = string.slice(36, 45);

            w_side = string.slice(45, 54);
           
            // set the red face
            colors[5][5] = COLORS[r_side[0]];
            colors[23][5] = COLORS[r_side[1]];
            colors[14][5] = COLORS[r_side[2]];
            colors[2][5] = COLORS[r_side[3]];
            colors[20][5] = COLORS[r_side[4]];
            colors[11][5] = COLORS[r_side[5]];
            colors[6][5] = COLORS[r_side[6]];
            colors[24][5] = COLORS[r_side[7]];
            colors[15][5] = COLORS[r_side[8]];

            // set the green face
            colors[5][0] = COLORS[g_side[0]];
            colors[2][0] = COLORS[g_side[1]];
            colors[6][0] = COLORS[g_side[2]];
            colors[4][0] = COLORS[g_side[3]];
            colors[0][0] = COLORS[g_side[4]];
            colors[3][0] = COLORS[g_side[5]];
            colors[7][0] = COLORS[g_side[6]];
            colors[1][0] = COLORS[g_side[7]];
            colors[8][0] = COLORS[g_side[8]];

            // set the yellow face
            colors[6][3] = COLORS[y_side[0]];
            colors[24][3] = COLORS[y_side[1]];
            colors[15][3] = COLORS[y_side[2]];
            colors[3][3] = COLORS[y_side[3]];
            colors[21][3] = COLORS[y_side[4]];
            colors[12][3] = COLORS[y_side[5]];
            colors[8][3] = COLORS[y_side[6]];
            colors[26][3] = COLORS[y_side[7]];
            colors[17][3] = COLORS[y_side[8]];

            // set the blue face
            colors[15][4] = COLORS[b_side[0]];
            colors[11][4] = COLORS[b_side[1]];
            colors[14][4] = COLORS[b_side[2]];
            colors[12][4] = COLORS[b_side[3]];
            colors[9][4] = COLORS[b_side[4]];
            colors[13][4] = COLORS[b_side[5]];
            colors[17][4] = COLORS[b_side[6]];
            colors[10][4] = COLORS[b_side[7]];
            colors[16][4] = COLORS[b_side[8]];

            // set the orange face
            colors[8][1] = COLORS[o_side[0]];
            colors[26][1] = COLORS[o_side[1]];
            colors[17][1] = COLORS[o_side[2]];
            colors[1][1] = COLORS[o_side[3]];
            colors[19][1] = COLORS[o_side[4]];
            colors[10][1] = COLORS[o_side[5]];
            colors[7][1] = COLORS[o_side[6]];
            colors[25][1] = COLORS[o_side[7]];
            colors[16][1] = COLORS[o_side[8]];

            // set the white face (last but not least)
            colors[7][2] = COLORS[w_side[0]];
            colors[25][2] = COLORS[w_side[1]];
            colors[16][2] = COLORS[w_side[2]];
            colors[4][2] = COLORS[w_side[3]];
            colors[22][2] = COLORS[w_side[4]];
            colors[13][2] = COLORS[w_side[5]];
            colors[5][2] = COLORS[w_side[6]];
            colors[23][2] = COLORS[w_side[7]];
            colors[14][2] = COLORS[w_side[8]];

            console.log(colors);

            // reconstruct the drawables array
            makeCubesFromColors(colors);

            /* assignSide(firstSide);
            assignSide(secondSide);
            assignSide(thirdSide);
            assignSide(fourthSide);
            assignSide(fifthSide);
            assignSide(sixthSide); */

        }
    })(f);
    reader.readAsText(f);
});

function assignSide(currentSide) {
    var center = 4;

    switch (currentSide[center]) {
        case 'R':
            console.log("RED SIDE");
            r_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(r_side);
            break;
        case 'O':
            console.log("ORANGE SIDE");
            o_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(o_side);
            break;
        case 'Y':
            console.log("YELLOW SIDE");
            y_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(y_side);
            break;
        case 'G':
            console.log("GREEN SIDE");
            g_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(g_side);
            break;
        case 'B':
            console.log("BLUE SIDE");
            b_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(b_side);
            break;
        case 'W':
            console.log("WHITE SIDE");
            w_side = currentSide;
            makeCubes(setColors(currentSide));
            console.log(w_side);
            break;
    }

}

document.getElementById('solutionFileInput').addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function () {
        return function (e) {
            var solution = e.target.result.split('');
            // queue of rotations to make
            var turns = [];

            // the first value is the color of the face to rotate,
            // the second is the number of times to turn it.
            for (var i = 0; i < solution.length; i += 2) {
                var face = solution[i];
                var num_turns = solution[i + 1];
                for (var j = 1; j <= num_turns; j++) {
                    switch (face) {
                        case 'R':
                            turns.push(rotateRed);
                            break;
                        case 'O':
                            turns.push(rotateOrange);
                            break;
                        case 'Y':
                            turns.push(rotateYellow);
                            break;
                        case 'G':
                            turns.push(rotateGreen);
                            break;
                        case 'B':
                            turns.push(rotateBlue);
                            break;
                        case 'W':
                            turns.push(rotateWhite);
                            break;
                    }
                }
            }

            var interval = setInterval(function () {
                if (turns.length > 0) {
                    if (!isTurning)
                        turns.shift()();
                }
                else
                    clearInterval(interval);
            }, 100);

        }
    })(f);
    reader.readAsText(f);
});