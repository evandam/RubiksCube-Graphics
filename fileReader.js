// read in a file via HTML5's File API
// parse out the cube state, initialize a cube and solve it
var lines;
document.getElementById('fileInput').addEventListener('change', function (evt) {
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

            console.log(o_side);
            console.log(w_side);
        }
    })(f);
    reader.readAsText(f);
});