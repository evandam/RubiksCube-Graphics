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

            lines = e.target.result.split('\n');

            // break down string into array of array (of chars)
            for (var line in lines) {
                string = string.concat(lines[line].toString().trim().split(''));
            }
            console.log(string);

            var firstSide = string.slice(0, 9);

            var secondSide = string.slice(9, 12);
            secondSide = secondSide.concat(string.slice(18, 21));
            secondSide = secondSide.concat(string.slice(27, 30));

            var thirdSide = string.slice(12, 15);
            thirdSide = thirdSide.concat(string.slice(21, 24));
            thirdSide = thirdSide.concat(string.slice(30, 33));

            var fourthSide = string.slice(15, 18);
            fourthSide = fourthSide.concat(string.slice(24, 27));
            fourthSide = fourthSide.concat(string.slice(33, 36));

            var fifthSide = string.slice(36, 45);

            var sixthSide = string.slice(45, 54);

            assignSide(firstSide);
            assignSide(secondSide);
            assignSide(thirdSide);
            assignSide(fourthSide);
            assignSide(fifthSide);
            assignSide(sixthSide);

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