var wheel;
var canvasId = "winwheelCanvas";
var surface;
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

function begin() {
  surface = document.getElementById(canvasId);

  if (surface.getContext) {
    wheel = new Image();
    wheel.width = "700";
    wheel.height = "700";
    wheel.src = "winwheel/prizewheel.png";
    wheel.onload = initialDraw;
  }
}

function initialDraw(e) {
  var surfaceContext = surface.getContext("2d");
  surfaceContext.drawImage(wheel, 0, 0);

  drawStaticWheelElements();
}

function startSpin(determinedValue) {
  var stopAngle = undefined;

  var startAngle = prizes[determinedValue]["startAngle"];
  var endAngle = prizes[determinedValue]["endAngle"];
  stopAngle = Math.floor(
    (startAngle +
      (Math.random() * 0.5 + 0.25) *
        rotationalDistance(startAngle, endAngle, 360)) %
      360
  );

  if (typeof stopAngle !== "undefined" && wheelState == "reset" && power) {
    targetAngle = 360 * (power * 6) + stopAngle;
    wheelState = "spinning";
    doSpin();
  }
}

function rotationalDistance(start, end, full) {
  start = start % full;
  end = end % full;

  return end - start + (end >= start ? 0 : full);
}

function angleBetween(angle, start, end, full) {
  angle = angle % full;
  start = start % full;
  end = end % full;

  return end >= start
    ? angle >= start && angle <= end
    : angle >= start || angle <= end;
}

function doSpin() {
  var surfaceContext = surface.getContext("2d");
  surfaceContext.save();
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
        reset_page_counter();
      }, 1000);
    }, 1000);
  }
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function resetWheel() {
  angle = 0;
  targetAngle = 0;
  currentAngle = 0;
  wheelState = "reset";

  initialDraw();
}

function drawStaticWheelElements() {
  var surfaceContext = surface.getContext("2d");
  drawGrommet(surfaceContext);
  drawPointer(surfaceContext);
}

function drawGrommet(surfaceContext) {
  surfaceContext.fillStyle = "rgba(83,153,217,1)";
  surfaceContext.beginPath();
  surfaceContext.arc(350, 350, 10, 0, 2 * Math.PI);
  surfaceContext.closePath();
  surfaceContext.fill();
}

function drawPointer(surfaceContext) {
  var pointsX = [350, 500, 350];
  var pointsY = [360, 350, 340];
  var pointerColor = "rgba(83,153,217,0.75)";

  surfaceContext.fillStyle = pointerColor;
  surfaceContext.beginPath();
  surfaceContext.moveTo(pointsX[0], pointsY[0]);
  for (var i = 1; i < pointsX.length; i++) {
    surfaceContext.lineTo(pointsX[i], pointsY[i]);
  }
  surfaceContext.closePath();
  surfaceContext.fill();
}
