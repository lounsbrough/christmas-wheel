<!DOCTYPE html>

<html>

<head>

<title>Christmas Drawing</title>
<link rel='shortcut icon' type='image/x-icon' href='christmas-tree.ico' />
<meta name="mobile-web-app-capable" content="yes">

<link rel="stylesheet" href="css/main.css?tms=<?php echo filemtime("css/main.css"); ?>"/>

<script>
    window.people = <?= file_get_contents("control-files/people.json") ?>;
</script>

<script src="assets/jquery-3.3.1.min.js"></script>
<link rel="stylesheet" href="assets/jquery-ui-1.12.1/jquery-ui.min.css"/>
<script src="assets/jquery-ui-1.12.1/jquery-ui.min.js"></script>
<script src="assets/touch-punch.js"></script>
<script src="winwheel/winwheel.js?tms=<?php echo filemtime("winwheel/winwheel.js"); ?>"></script>

<script src="scripts/index.js?tms=<?php echo filemtime("scripts/index.js"); ?>"></script>

</head>

<body style="background-image:url('images/glass-bubbles.jpg'); background-repeat:no-repeat; background-size:cover">

<?PHP

$people = json_decode(file_get_contents("control-files/people.json"), true);
$unassignedGivers = array_filter($people, function($person) { 
	return empty($person["assignedRecipient"]);
});

if (!empty($unassignedGivers)) {
?>
	<div id="content_wrapper_div" style="min-width:700px">
	    <div id="select_name_div" style="text-align:center;font-size:25px;margin-top:10px">
            <button id="select_giver" style="font-size:25px;display:none;white-space:nowrap"></button>
        </div>
	    <div style="text-align:center">
            <canvas id="winwheelCanvas" width="700px" height="700px" style="margin-top:25px"></canvas>
        </div>
	    <div style="text-align:center;margin-top:25px;margin-bottom:25px">
            <button id="start_spin_button" style="font-size:25px;display:none">Spin!</button>
        </div>
    </div>
<?php
} else {
?>
	<div id="drawing_complete_div" style="margin-top:50px;min-width:700px;text-align:center;font-size:50px;color:#FFFFFF">
        <span id="drawing_complete_span" style="background:rgba(255,255,255,0.5);padding:50px;border-radius:10px">Drawing is complete!</span>
    </div>
<?php
}
?>

<!-- Load image ahead of time for JavaScript -->
<img src="images/loading_color_wheel.gif" style="height:150px;display:none">

</body>

</html>