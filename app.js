let serial; // variable to hold an instance of the serialport library
let options = {
    baudrate: 9600
}; // set baudrate to 9600; must match Arduino baudrate
//let portName = '/dev/cu.PHIL-DevB';
//let portName = '/dev/cu.Bluetooth-Incoming-Port';
let portName = '/dev/cu.usbmodem14621'; // fill in serial port name
let colors, trackingData;

//let trigger = false;

let data; // for incoming serial data
let val;
let r, g, b, c, d, accX, accY, accZ, ori;
//let threshold = 10;
let cBtn, bBtn, wBtn, resetBtn, eraseBtn, clearBtn, saveBtn;
let btnPosX, btnPosY;
let radiusHigh;
//let locX, locY;
let sfx;

function preload() {
    soundFormats('mp3', 'ogg');
    sfx = loadSound('spray.mp3');
}

function init() {
    frameRate(120);
    createCanvas(windowWidth, windowHeight); // make the canvas
    background(220);

    //pixelDensity(1);

    capture = createCapture(VIDEO);
    capture.position(0, 0);
    capture.size(width, height);
    capture.id('tracksource');
    //capture.style('opacity', 0.5);
    capture.style('opacity', 0);

    //capture.hide();

    colors = new tracking.ColorTracker(['magenta']);
    tracking.track('#tracksource', colors); // start the tracking of the colors above on the camera in p5

    //start detecting the tracking
    colors.on('track', function (event) { //this happens each time the tracking happens
        trackingData = event.data // break the trackingjs data into a global so we can access it with p5
    });

    serial = new p5.SerialPort(); // make a new instance of the serialport library
    serial.on('data', serialEvent); // callback for when new data arrives
    serial.open(portName, options); // open a serial port @ 9600 

    btnPosX = width / 10;
    btnPosY = height / 10;

    cBtn = createButton("Pick Color!"); // color picker button
    cBtn.position(width - btnPosX, btnPosY);
    cBtn.mousePressed(colorPicker);

    resetBtn = createButton("Reset"); // color reset button
    resetBtn.position(width - btnPosX, btnPosY + 25);
    resetBtn.mousePressed(resetColor);

    eraseBtn = createButton("Eraser"); // eraser button
    eraseBtn.position(width - btnPosX, btnPosY + 50);
    eraseBtn.mousePressed(eraser);

    clearBtn = createButton("Clear"); // clear canvas button
    clearBtn.position(width - btnPosX, btnPosY + 75);
    clearBtn.mousePressed(clearCanvas);

    saveBtn = createButton("Save"); // clear canvas button
    saveBtn.position(width - btnPosX, btnPosY + 100);
    saveBtn.mousePressed(saveGraffiti);

    document.getElementById('colorBox').style.backgroundColor = 'rgb(' + 0 + ',' + 0 + ',' + 0 + ')';
    fill(0); // initiate color to black

    sfx.setVolume(1.0);
    sfx.playMode('sustain');
}

function spray() {
    //    stroke(0);
    //    rect(btnPosX - 60, btnPosY - 70, 60, 60);

    radiusHigh = d * 0.45;

    if (trackingData) {
        for (var i = 0; i < trackingData.length; i++) {

            var locX = trackingData[i].x + trackingData[i].width / 2;
            var locY = trackingData[i].y + trackingData[i].height / 1.8;

            document.getElementById('crosshair').style.left = (locX - 20) + 'px';
            document.getElementById('crosshair').style.top = (locY - 20) + 'px';
        }
    }

    if (d > 0 && trackingData) {
        //        let panning = map(locX, 0., width, 1.0, -1.0);
        //        sfx.pan(panning);
        //        sfx.play();


        //        for (var i = 0; i < trackingData.length; i++) {
        //
        //            locX = trackingData[i].x + trackingData[i].width / 2;
        //            locY = trackingData[i].y + trackingData[i].height / 1.8;

        for (let j = 0; j <= 3000; j++) {
            let angle = random(TWO_PI);
            let radius = random(0, radiusHigh);
            let offsetX = radius * cos(angle);
            let offsetY = radius * sin(angle);
            let sizeX = random(1.2);
            let sizeY = random(1.2);
            noStroke();
            rect(locX + offsetX, locY + offsetY, sizeX, sizeY);
        }

        // if pointer stays at one point, increase diameter of spray nozzle
        if (d > 0 && trackingData && locX == locX) {
            for (let k = 0; k <= 3200; k++) {
                let angle = random(TWO_PI);
                radiusHigh = radiusHigh + 0.006;
                let radius = random(0, radiusHigh);
                let offsetX = radius * cos(angle);
                let offsetY = radius * sin(angle);
                let sizeX = random(1);
                let sizeY = random(1);
                noStroke();
                rect(locX + offsetX, locY + offsetY, sizeX, sizeY);
            }
        }
    } else if (d < 0 || !trackingData) {
        sfx.stop();
        //return trigger = false;
    }
    //    }
}

function serialEvent() {
    data = serial.readStringUntil("/");
    //console.log(data);
    // let arr = data.split(",").map((item) => item.trim());
    val = data.split(",");
    r = Number(val[0]);
    g = Number(val[1]);
    b = Number(val[2]);
    c = Number(val[3]);
    d = Number(val[4]);
    accX = Number(val[5]);
    accY = Number(val[6]);
    accZ = Number(val[7]);
    ori = Number(val[8]);

    d = map(d, 560, 1000, 0, 320); // mapping FSR analog value to control nozzle radius

    r *= 255;
    r /= c;
    g *= 255;
    g /= c;
    b *= 255;
    b /= c;

    r = parseInt(r);
    g = parseInt(g);
    b = parseInt(b);

    accX = abs(accX);
    accY = abs(accY);
    accZ = abs(accZ);

    //    console.log(accX + ', ' + accY + ', ' + accZ);
    if (accX >= 17 || accY >= 17 || accZ >= 17) {
        console.log("Shake!!");
        shake();
    }
}

function colorPicker() {
    fill(r, g, b);
    document.getElementById('colorBox').style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    //    return trigger = true;
    //    return false;
}

function resetColor() {
    fill(0);
    document.getElementById('colorBox').style.backgroundColor = 'rgb(' + 0 + ',' + 0 + ',' + 0 + ')';
    //    if (d > 0) {
    //    return trigger = true;
    //    return false;
    //    }
}

function eraser() {
    fill(220);
    document.getElementById('colorBox').style.backgroundColor = 'rgb(' + 220 + ',' + 220 + ',' + 220 + ')';
}

function clearCanvas() {
    background(220);
}

function saveGraffiti() {
    saveCanvas(defaultCanvas0, ['vandal'], ['jpg']);
}

function keyPressed() {
    switch (keyCode) {
        case 32:
            fill(r, g, b);
            document.getElementById('colorBox').style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
            break;
        case 82:
            fill(0);
            document.getElementById('colorBox').style.backgroundColor = 'rgb(' + 0 + ',' + 0 + ',' + 0 + ')';
            break;
        case 69:
            fill(220);
            document.getElementById('colorBox').style.backgroundColor = 'rgb(' + 220 + ',' + 220 + ',' + 220 + ')';
            break;
        case 67:
            background(220);
            break;
        case 83:
            saveCanvas(defaultCanvas0, ['vandal'], ['jpg']);
            break;
    }
}
//
//function mousePressed() {
//    if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 150 && mouseY < height / 2 + 150) {
//        var fs = fullscreen();
//        fullscreen(!fs);
//    }
//}
//
//function windowResized() {
//    resizeCanvas(windowWidth, windowHeight);
//    background(220);
//}
//function shake() {
//    //return trigger = false;
//    //    if (accX >= 17 || accY >= 17 || accZ >= 17) {
//    if (d > 0) {
//        resetColor();
//        //return false;
//    } else {
//        setTimeout(colorPicker, 4000);
//    }
//}
//}
function shake() {
    switch (ori) {
        case 1:
            setTimeout(colorPicker, 4500);
            break;
        case 2:
            eraser();
            break;
        case 3:
            resetColor();
            break;
    }
}
