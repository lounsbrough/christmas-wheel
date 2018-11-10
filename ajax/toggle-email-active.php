<?php

$wheelState = json_decode(file_get_contents("../control-files/wheel-state.json"), true);

$wheelState["emailsActive"] = !$wheelState["emailsActive"];

echo $wheelState["emailsActive"] ? "Emails Activated" : "Emails Deactivated";

file_put_contents("../control-files/wheel-state.json", json_encode($wheelState));

?>