<?PHP

if (empty($_GET["giver_name"])) {
	exit("giver not specified");
}

$giverName = $_GET["giver_name"];

$people = json_decode(file_get_contents("../control-files/people.json"), true);

$giver = reset(array_filter($people, function($person) use ($giverName) {
    return $person["name"] == $giverName;
}));
if (!$giver) {
	exit("giver not found");
}

$giverAvailable = empty($giver["assignedRecipient"]);
if (!$giverAvailable) {
    exit("giver assigned");
}

$assignedGivers   = array_filter($people, function($person)
{
    return !empty($person["assignedRecipient"]);
});
$unassignedGivers = array_diff_assoc($people, $assignedGivers);

$assignedRecipients = array_filter($people, function($person) use ($people, $giver)
{
	if ($person["name"] == $giver["name"]) {
		return true;
	}
    return array_search($person["name"], array_map(function($person)
    {
        return $person["assignedRecipient"];
    }, $people)) !== false;
});
$unassignedRecipients = array_diff_assoc($people, $assignedRecipients);
$unassignedRecipients = array_values($unassignedRecipients);

$index = -1;

while (count($unassignedRecipients) > 0) {
	$countRemaining = count($unassignedRecipients);
	$index = rand(0, $countRemaining - 1);
	$recipient = $unassignedRecipients[$index];
	if ($countRemaining == 1 || !checkExcludedRecipient($giver, $recipient)) 
	{
		break;
	}		
	unset($unassignedRecipients[$index]);
	$unassignedRecipients = array_values($unassignedRecipients);
}

function checkExcludedRecipient($giver, $recipient) {
	return array_search($recipient["name"], $giver["excludedRecipients"] ?? array()) !== false;
}

if ($index == -1) {
    exit("calculation failed");
}

$people = array_map(function($person) use ($giver, $recipient)
{
    if ($person["name"] == $giver["name"]) {
        $person["assignedRecipient"] = $recipient["name"];
    }
    return $person;
}, $people);

file_put_contents("../control-files/people.json", json_encode($people, JSON_PRETTY_PRINT));

echo json_encode(array(
    "name" => $recipient["name"],
    "number" => $recipient["wheelIndex"]
));

?>