﻿// read in a file via HTML5's File API
// parse out the cube state, initialize a cube and solve it
var lines;
document.getElementById('stateFileInput').addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function () {
        return function (e) {
            
            lines = e.target.result.split('\n');
            // break down string into array of array (of chars)
            for (var line in lines)
                lines[line] = lines[line].trim().split('');

            var r_side = lines.slice(0, 3);

            var g_side = [];
            var y_side = [];
            var b_side = [];
            for (var i = 3; i < 6; i++) {
                g_side.push(lines[i].slice(0, 3));
                y_side.push(lines[i].slice(3, 6));
                b_side.push(lines[i].slice(6, 9));
            }
            
            var o_side = lines.slice(6, 9);
            var w_side = lines.slice(9);



        }
    })(f);
    reader.readAsText(f);
});

document.getElementById('solutionFileInput').addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function () {
        return function (e) {
            var solution = e.target.result.split('');
            // the first value is the color of the face to rotate,
            // the second is the number of times to turn it.
            for (var i = 0; i < solution.length; i += 2) {
                var face = solution[i];
                var num_turns = solution[i + 1];
                for (var j = 1; j <= num_turns; j++) {
                    switch (face) {
                        case 'R':
                            rotateRed();
                            break;
                        case 'O':
                            rotateOrange();
                            break;
                        case 'Y':
                            rotateYellow();
                            break;
                        case 'G':
                            rotateGreen();
                            break;
                        case 'B':
                            rotateBlue();
                            break;
                        case 'W':
                            rotateWhite();
                            break;
                    }
                }
            }
        }
    })(f);
    reader.readAsText(f);
});