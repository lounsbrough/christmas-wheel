var wheel;
var canvasId = "winwheelCanvas";
var wheelImageName = "winwheel/prizewheel.png";

var marker_points_x = [350, 500, 350];
var marker_points_y = [360, 350, 340];
var marker_aspect_ratio =
  (700 - marker_points_x[0]) / (marker_points_y[2] - marker_points_y[1]);
var marker_color = "rgba(83,153,217,0.75)";
var marker_gradient_color = "rgba(83,153,217,0.25)";
var marker_gradient_width = 100;
var marker_gradient_smoothness = 20;

var countPrizes = 6;
var firstAngle = 330;
var prizeWidth = (360 - countPrizes) / countPrizes;

var prizes = window.people.map((person, i) => {
  var startAngle = (firstAngle + i + i * prizeWidth) % 360;
  var endAngle = (startAngle + prizeWidth) % 360;
  return { name: person["name"], startAngle: startAngle, endAngle: endAngle };
});

var surface;
var wheel;
var angle = 0;
var targetAngle = 0;
var currentAngle = 0;
var power = 1;

var spinTimer;

var wheelState = "reset";

function begin() {
  surface = document.getElementById(canvasId);

  if (surface.getContext) {
    wheel = new Image();
    wheel.width = "700";
    wheel.height = "700";
    wheel.src = wheelImageName;
    wheel.onload = initialDraw;
  }
}

function initialDraw(e) {
  var surfaceContext = surface.getContext("2d");
  surfaceContext.drawImage(wheel, 0, 0);

  drawMarker();
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
  surfaceContext.translate(wheel.width * 0.5, wheel.height * 0.5);
  surfaceContext.rotate(DegToRad(currentAngle));
  surfaceContext.translate(-wheel.width * 0.5, -wheel.height * 0.5);
  surfaceContext.drawImage(wheel, 0, 0);
  surfaceContext.restore();

  drawMarker();

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

function DegToRad(d) {
  return d * 0.01745329251994329576923690768489;
}

function powerSelected(powerLevel) {
  if (wheelState == "reset") {
    document.getElementById("pw1").className = "";
    document.getElementById("pw2").className = "";
    document.getElementById("pw3").className = "";

    if (powerLevel >= 1) document.getElementById("pw1").className = "pw1";
    if (powerLevel >= 2) document.getElementById("pw2").className = "pw2";
    if (powerLevel >= 3) document.getElementById("pw3").className = "pw3";

    power = powerLevel;
  }
}

function resetWheel() {
  clearTimeout(spinTimer);

  angle = 0;
  targetAngle = 0;
  currentAngle = 0;
  power = 0;

  document.getElementById("pw1").className = "";
  document.getElementById("pw2").className = "";
  document.getElementById("pw3").className = "";

  wheelState = "reset";

  initialDraw();
}

function drawMarker() {
  var surfaceContext = surface.getContext("2d");
  drawGrommet(surfaceContext);
  drawPointer(surfaceContext);
  drawTransparencyGradient(surfaceContext);
}

function drawGrommet(surfaceContext) {
  surfaceContext.fillStyle = "rgba(83,153,217,1)";
  surfaceContext.beginPath();
  surfaceContext.arc(350, 350, 10, 0, 2 * Math.PI);
  surfaceContext.closePath();
  surfaceContext.fill();
}

function drawPointer(surfaceContext) {
  surfaceContext.fillStyle = marker_color;
  surfaceContext.beginPath();
  surfaceContext.moveTo(marker_points_x[0], marker_points_y[0]);
  for (var i = 1; i < marker_points_x.length; i++) {
    surfaceContext.lineTo(marker_points_x[i], marker_points_y[i]);
  }
  surfaceContext.closePath();
  surfaceContext.fill();
}

function drawTransparencyGradient(surfaceContext) {
  surfaceContext.fillStyle = marker_gradient_color;
  for (var j = 1; j <= marker_gradient_smoothness; j++) {
    surfaceContext.beginPath();
    surfaceContext.moveTo(marker_points_x[0] -
      (marker_gradient_width * j) / marker_gradient_smoothness, marker_points_y[0]);
    for (var i = 1; i < marker_points_x.length; i++) {
      var marker_height = marker_points_y[i] +
        ((marker_points_y[i] - 350) / Math.abs(marker_points_y[i] - 350)) *
        (marker_gradient_width / marker_aspect_ratio) *
        (j / marker_gradient_smoothness);
      var marker_curvature_adjustment = 0;
      surfaceContext.lineTo(marker_points_x[i] - marker_curvature_adjustment, marker_height);
    }
    surfaceContext.closePath();
    surfaceContext.fill();
  }
}
