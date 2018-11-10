<?php

$people = json_decode(file_get_contents("../control-files/people.json"), true);

$people = array_map(function($person) {
    $person["assignedRecipient"] = null;
    return $person;
}, $people);

file_put_contents("../control-files/people.json", json_encode($people, JSON_PRETTY_PRINT));

?>