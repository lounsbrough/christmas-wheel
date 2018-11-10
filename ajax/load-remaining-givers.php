<?php

$people = json_decode(file_get_contents("../control-files/people.json"), true);
$unassignedGivers = array_filter($people, function($person) { 
	return empty($person["assignedRecipient"]);
});

echo json_encode($unassignedGivers);

?>