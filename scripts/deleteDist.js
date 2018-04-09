var rimraf = require('rimraf');

function launchDeleting() {
    console.log("Deleting dist");
    rimraf.sync('dist/');
}

launchDeleting();