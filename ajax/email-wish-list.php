<?php

$wheelState = json_decode(file_get_contents("../control-files/wheel-state.json"), true);
if (!$wheelState["emailsActive"]) {
	die;
}

$people = json_decode(file_get_contents("../control-files/people.json"), true);

$giver = reset(array_filter($people, function($person) { 
	return $person["name"] == $_GET["giver_name"];
}));

$recipient = reset(array_filter($people, function($person) { 
	return $person["name"] == $_GET["recipient_name"];
}));

$wishList = "<ul><li>".implode("</li><li>", $recipient["wishList"])."</li></ul>";

$emailMessage = "You drew " . $recipient["name"] . " for this year's Christmas gift exchange! The recommended price range for your gift is between $15 and $30. Happy shopping!";

require_once dirname(__FILE__).'/../includes/PHPMailer-master/PHPMailerAutoload.php';
$mail = new PHPMailer();

$mail->IsSMTP();
$mail->IsHTML(true);
$mail->From = "david.smtp.no.reply@gmail.com";
$mail->FromName = "David Lounsbrough";
$mail->Subject = "Christmas Wheel";
$mail->Body = $emailMessage;
$mail->AddAddress($giver["email"]);
$mail->Send();

?>
