<?php

$people = json_decode(file_get_contents("../control-files/people.json"), true);

$recipient = reset(array_filter($people, function($person) { 
	return $person["name"] == $_GET["recipient_name"];
}));

$wishList = "<ul><li>".implode("</li><li>", $recipient["wishList"])."</li></ul>";

echo "<div style='font-size:30px;margin-top:25px'>".$recipient["name"]."'s wish list:</div><div style='font-size:25px;margin-top:25px;margin-bottom:25px'>$wishList</div>";

?>