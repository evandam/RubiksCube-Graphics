// read in a file via HTML5's File API
// parse out the cube state, initialize a cube and solve it

document.getElementById('fileInput').addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function () {
        return function (e) {
            var lines = e.target.result.split('\n');
            for (line in lines) {
                console.log(lines[line]);
            }
        }
    })(f);
    reader.readAsText(f);
});