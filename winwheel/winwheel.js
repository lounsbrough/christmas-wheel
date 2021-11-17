var wheel;
var canvasId = "winwheelCanvas";
var surface;
var surfaceContext;
var angle = 0;
var targetAngle = 0;
var currentAngle = 0;
var power = 1;
var wheelState = "reset";
var firstAngle = 330;
var prizeWidth = (360 - window.people.length) / window.people.length;

var prizes = window.people.map((person, i) => {
  var startAngle = (firstAngle + i + i * prizeWidth) % 360;
  var endAngle = (startAngle + prizeWidth) % 360;
  return { name: person["name"], startAngle: startAngle, endAngle: endAngle };
});


const initializeWheel = () => {
  surface = document.getElementById(canvasId);
  surfaceContext = surface.getContext("2d");

  if (surface === null) {
    return;
  }

  if (surface.getContext) {
    wheel = new Image();
    wheel.width = "700";
    wheel.height = "700";
    wheel.src = "winwheel/prizewheel.png";
    wheel.onload = initialDraw;
  }
};

const initialDraw = e => {
  surfaceContext.drawImage(wheel, 0, 0);

  drawStaticWheelElements();
};

const startSpin = determinedValue => {
  var stopAngle = undefined;

  var startAngle = prizes[determinedValue]["startAngle"];
  var endAngle = prizes[determinedValue]["endAngle"];
  stopAngle = Math.floor(
    (startAngle +
      0.87 *
        rotationalDistance(startAngle, endAngle, 360)) %
      360
  );

  if (typeof stopAngle !== "undefined" && wheelState == "reset" && power) {
    targetAngle = 360 * (power * 6) + stopAngle;
    wheelState = "spinning";
    doSpin();
  }
};

const rotationalDistance = (start, end, full) => {
  start = start % full;
  end = end % full;

  return end - start + (end >= start ? 0 : full);
};

const doSpin = () => {
  surfaceContext.save();
  surfaceContext.clearRect(0, 0, surface.width, surface.height);
  surfaceContext.translate(wheel.width / 2, wheel.height / 2);
  surfaceContext.rotate(degreesToRadians(currentAngle));
  surfaceContext.translate(-wheel.width / 2, -wheel.height / 2);
  surfaceContext.drawImage(wheel, 0, 0);
  surfaceContext.restore();

  drawStaticWheelElements();

  currentAngle += angle;

  if (currentAngle < targetAngle) {
    var angleRemaining = targetAngle - currentAngle;

    angle = Math.min(Math.max(angleRemaining / 100, 0.1), 20);

    requestAnimationFrame(doSpin);
  } else {
    wheelState = "stopped";

    window.setTimeout(function() {
      $("#display_wish_list").dialog("open");
      window.setTimeout(function() {
        resetPageCounter();
      }, 1000);
    }, 1000);
  }
};

const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

const resetWheel = () => {
  angle = 0;
  targetAngle = 0;
  currentAngle = 0;
  wheelState = "reset";

  initialDraw();
};

const drawStaticWheelElements = () => {
  drawGrommet(surfaceContext);
  drawPointer(surfaceContext);
};

const drawGrommet = surfaceContext => {
  surfaceContext.fillStyle = "rgba(255, 255, 255, 1)";
  surfaceContext.beginPath();
  surfaceContext.arc(350, 350, 10, 0, 2 * Math.PI);
  surfaceContext.closePath();
  surfaceContext.fill();
};

const drawPointer = surfaceContext => {
  var pointsX = [350, 500, 350];
  var pointsY = [360, 350, 340];
  var pointerColor = "rgba(255, 255, 255, 0.75)";

  surfaceContext.fillStyle = pointerColor;
  surfaceContext.beginPath();
  surfaceContext.moveTo(pointsX[0], pointsY[0]);
  for (var i = 1; i < pointsX.length; i++) {
    surfaceContext.lineTo(pointsX[i], pointsY[i]);
  }
  surfaceContext.closePath();
  surfaceContext.fill();
};
