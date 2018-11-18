<?php

$people = json_decode(file_get_contents("../control-files/people.json"), true);

$recipient = reset(array_filter($people, function($person) { 
	return $person["name"] == $_GET["recipient_name"];
}));

echo json_encode($recipient["wishList"]);

?>