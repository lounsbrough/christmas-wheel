let viewportScale = "";
let dummyAngle = 10;
let currentDummyAngle = 0;
let calculationTimeout = "";
let giverSelected = false;
let numberWheelClicks = 0;
let clickTimeout = false;

const defaultGiverSelectButtonText = "Select Your Name";

$(() => {
  calculateViewportScale();
  defineDialogs();
  defineButtons();
  selectGiverClickHandler();
  startSpinButtonClickHandler();
  clickCounterHandlers();
  initializeWheel();
  windowResizeHandler();
});

const promptForGiverName = () => {
  $("#select_giver").button("option", "disabled", false);
  $("#start_spin_button").button("option", "disabled", false);
  if (!$("#select_giver_dialog").dialog("isOpen")) {
    openDialog("#select_giver_dialog");
    loadSelectGiverDialog();
  }
};

const loadSelectGiverDialog = async () => {
  var loadRemainingGiversResponse = await $.get({
    url: "ajax/load-remaining-givers.php",
    cache: false
  });
  $("#select_giver_dialog").html("");
  remainingGivers = JSON.parse(loadRemainingGiversResponse);
  var prop = -1;
  for (prop in remainingGivers) {
    $("#select_giver_dialog").append(
      '<br><button class="select_name_button">' +
        remainingGivers[prop]["name"] +
        "</button><br>"
    );
  }
  if (prop != -1) {
    $("#select_giver_dialog").append("<br>");
    window.setTimeout(function() {
      $("#select_giver_dialog").dialog({
        position: { my: "center", at: "center", of: "#winwheelCanvas" }
      });
    }, 0);
    $(".select_name_button").button();
    $(".select_name_button").click(function() {
      $("#select_giver").html($(this).html());
      giverSelected = true;
      $("#select_giver_dialog").dialog("close");
    });
  } else {
    window.location.replace(window.location);
  }
  $(".select_name_button").blur();
};

const processSpinButton = async () => {
  $("#start_spin_button").data("calculated_target", "");
  dummySpin();
  calculationTimeout = window.setTimeout(function() {
    $("#start_spin_button").data("calculated_target", "none");
    $("#calculation_message_span").html("Calculation failed");
    $("#calculation_message_dialog").dialog("open");
    window.setTimeout(function() {
      $("#calculation_message_dialog").dialog("close");
    }, 500);
    $("#select_giver").html(defaultGiverSelectButtonText);
  }, 30000);
  $("#select_giver_dialog").dialog("close");

  var getDeterminedPrizeResponse = await $.get({
    url:
      "ajax/get-determined-prize.php?giver_name=" + $("#select_giver").html(),
    cache: false
  });

  if (getDeterminedPrizeResponse.trim() == "giver assigned") {
    $("#calculation_message_span").html(
      $("#select_giver").html() + " has already spun the wheel"
    );
    $("#calculation_message_dialog").dialog("open");
    window.setTimeout(function() {
      $("#calculation_message_dialog").dialog("close");
    }, 500);
    $("#select_giver").html(defaultGiverSelectButtonText);
    $("#start_spin_button").data("calculated_target", "none");
  } else if (getDeterminedPrizeResponse.trim() == "calculation failed") {
    $("#calculation_message_span").html("Calculation failed");
    $("#calculation_message_dialog").dialog("open");
    window.setTimeout(function() {
      $("#calculation_message_dialog").dialog("close");
    }, 500);
    $("#select_giver").html(defaultGiverSelectButtonText);
    $("#start_spin_button").data("calculated_target", "none");
  } else {
    determinedPrize = JSON.parse(getDeterminedPrizeResponse);

    $("#start_spin_button").data("calculated_target", determinedPrize.number);

    var loadWishListResponse = await $.get({
      url: "ajax/load-wish-list.php?recipient_name=" + determinedPrize.name,
      cache: false
    });
    var wishListItems = JSON.parse(loadWishListResponse);

    $("#display_wish_list").html(
      '<div class="recipient_assigned_message">You drew <span class="recipient_assigned_name">' +
        determinedPrize.name +
        "</span>!</div>"
    );
    $("#display_wish_list").append('<div class="recipient_wish_list_name">' + determinedPrize.name + '\'s wish list:</div>');
    $("#display_wish_list").append('<div class="recipient_wish_list_items"><ul></ul></div>');
    wishListItems.forEach(wishListItem => {
      $("#display_wish_list .recipient_wish_list_items ul").append('<li>' + wishListItem + '</li>');
    });
    $("#display_wish_list").append(
      '<div class="countdown_reset_message">Wheel will be reset in <span id="page_reset_seconds">30</span> <span id="page_reset_seconds_text">seconds</span></div>'
    );

    $.get({
      url:
        "ajax/email-wish-list.php?giver_name=" +
        $("#select_giver").html() +
        "&recipient_name=" +
        determinedPrize.name,
      cache: false
    });
  }
  giverSelected = false;
};

const countWheelClicks = async () => {
  numberWheelClicks++;
  window.clearTimeout(clickTimeout);
  clickTimeout = window.setTimeout(async () => {
    if (numberWheelClicks == 5) {
      openDialog("#emails_activated_status_dialog");
      var toggleEmailActiveResponse = await $.get({
        url: "ajax/toggle-email-active.php",
        cache: false
      });

      $("#drawing_complete_span").css("visibility", "hidden");
      $("#emails_activated_status_dialog").html(
        '<span style="line-height:300px;font-size:50px">' +
          toggleEmailActiveResponse +
          "</span>"
      );
      if ($("#winwheelCanvas").length > 0) {
        $("#emails_activated_status_dialog").dialog("option", "position", {
          my: "center",
          at: "center",
          of: "#winwheelCanvas"
        });
      } else {
        $("#emails_activated_status_dialog").dialog("option", "position", {
          my: "center",
          at: "center",
          of: "#drawing_complete_span"
        });
      }
      window.setTimeout(function() {
        $("#emails_activated_status_dialog").dialog("close");
      }, 500);
    } else if (numberWheelClicks == 10) {
      openDialog("#drawing_reset_dialog");
      var resetDrawingResponse = await $.get({
        url: "ajax/reset-drawing.php",
        cache: false
      });

      $("#drawing_complete_span").css("visibility", "hidden");
      $("#drawing_reset_dialog").html(
        '<span style="line-height:300px;font-size:50px">Drawing Has Been Reset</span>'
      );
      if ($("#winwheelCanvas").length > 0) {
        $("#drawing_reset_dialog").dialog("option", "position", {
          my: "center",
          at: "center",
          of: "#winwheelCanvas"
        });
      } else {
        $("#drawing_reset_dialog").dialog("option", "position", {
          my: "center",
          at: "center",
          of: "#drawing_complete_span"
        });
      }
      window.setTimeout(function() {
        $("#drawing_reset_dialog").dialog("close");
      }, 500);
    }
    numberWheelClicks = 0;
  }, 1000);
};

const defineDialogs = () => {
  $(
    '<div id="select_giver_dialog" style="color:#333333;text-align:center"><span style="line-height:300px;font-size:50px">You did not select your name</span></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "200",
    minHeight: "0",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "fade", duration: 500 },
    position: { my: "center", at: "center", of: "#winwheelCanvas" }
  });
  $(
    '<div id="no_select_giver_dialog" style="color:#333333;text-align:center"><span style="line-height:300px;font-size:50px">Please select your name</span></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "700",
    minHeight: "300",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "drop", duration: 5000, direction: "up" },
    position: { my: "center", at: "center", of: "#winwheelCanvas" },
    close: function() {
      $("#start_spin_button").button("option", "disabled", false);
    }
  });
  $(
    '<div id="calculation_message_dialog" style="color:#333333;text-align:center"><span id="calculation_message_span" style="line-height:300px;font-size:35px"></span></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "700",
    minHeight: "300",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "drop", duration: 5000, direction: "up" },
    position: { my: "center", at: "center", of: "#winwheelCanvas" },
    close: function() {
      $("#select_giver").button("option", "disabled", false);
      $("#start_spin_button").button("option", "disabled", false);
    }
  });
  $(
    '<div id="display_wish_list" style="color:#333333;text-align:center"></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "700",
    minHeight: "300",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "fade", duration: 1000, direction: "up" },
    position: { my: "center", at: "center", of: "#winwheelCanvas" }
  });
  $(
    '<div id="emails_activated_status_dialog" style="color:#333333;text-align:center"></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "700",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "fade", duration: 2000, direction: "up" },
    close: function() {
      $("#drawing_complete_span").css("visibility", "visible");
    }
  });
  $(
    '<div id="drawing_reset_dialog" style="color:#333333;text-align:center"></div>'
  ).dialog({
    autoOpen: false,
    minWidth: "700",
    dialogClass: "transparentDialogRounded",
    hide: { effect: "fade", duration: 2000, direction: "up" },
    close: function() {
      window.location.replace(window.location);
    }
  });

  if ($("#winwheelCanvas").length > 0) {
    $("#emails_activated_status_dialog").dialog("option", "position", {
      my: "center",
      at: "center",
      of: "#winwheelCanvas"
    });
    $("#drawing_reset_dialog").dialog("option", "position", {
      my: "center",
      at: "center",
      of: "#winwheelCanvas"
    });
  } else {
    $("#emails_activated_status_dialog").dialog("option", "position", {
      my: "center",
      at: "center",
      of: "#drawing_complete_span"
    });
    $("#drawing_reset_dialog").dialog("option", "position", {
      my: "center",
      at: "center",
      of: "#drawing_complete_span"
    });
  }
};

const defineButtons = () => {
  $("#select_giver")
    .button()
    .html(defaultGiverSelectButtonText)
    .show();
  $("#start_spin_button")
    .button()
    .show();
};

const windowResizeFunction = () => {
  const height = window.screen.availHeight;

  if ($("#content_wrapper_div").length > 0) {
    $("#select_name_div").css(
      "margin-top",
      Math.max(Math.round((height - 850 * viewportScale) / 2), 0) + "px"
    );

    $(".ui-dialog-content").css("visibility", "visible");
    $("#select_giver_dialog").dialog({
      position: { my: "center", at: "center", of: "#winwheelCanvas" }
    });
    $("#display_wish_list").dialog({
      position: { my: "center", at: "center", of: "#winwheelCanvas" }
    });
  } else {
    $("#drawing_complete_div").css(
      "margin-top",
      Math.round((height - 120) / 2 / viewportScale) + "px"
    );
  }
};

const resetPageCounter = () => {
  let seconds = $("#page_reset_seconds").html();
  seconds--;
  $("#page_reset_seconds").html(seconds);
  if (seconds == 1) {
    $("#page_reset_seconds_text").html("second");
    window.setTimeout(() => {
      window.location.replace(window.location);
    }, 1000);
  } else {
    window.setTimeout(() => {
      resetPageCounter();
    }, 1000);
  }
};

const dummySpin = () => {
  if (
    $("#start_spin_button").data("calculated_target") === "" ||
    dummyAngle < 20
  ) {
    dummyAngle += 1;
    dummyAngle = Math.min(dummyAngle, 20);
    var surfaceContext = surface.getContext("2d");
    surfaceContext.save();
    surfaceContext.translate(wheel.width * 0.5, wheel.height * 0.5);
    surfaceContext.rotate(degreesToRadians(currentDummyAngle));
    surfaceContext.translate(-wheel.width * 0.5, -wheel.height * 0.5);
    surfaceContext.drawImage(wheel, 0, 0);
    surfaceContext.restore();
    drawStaticWheelElements();
    currentDummyAngle += dummyAngle;

    requestAnimationFrame(dummySpin);
  } else if ($("#start_spin_button").data("calculated_target") != "none") {
    window.clearTimeout(calculationTimeout);
    startSpin($("#start_spin_button").data("calculated_target"));
  } else {
    window.clearTimeout(calculationTimeout);
    initialDraw();
  }
};

const openDialog = (selector, loading = true) => {
  $(selector).dialog("open");

  if (loading) {
    $(selector).html(
      '<img src="images/loading_color_wheel.gif" style="height:150px">'
    );
  }
};

const calculateViewportScale = () => {
  if (window.screen.availHeight > window.screen.availWidth) {
    viewportScale = Math.floor((window.screen.availWidth / 800) * 100) / 100;
  } else {
    viewportScale = Math.floor((window.screen.availHeight / 800) * 100) / 100;
  }

  const content =
    "initial-scale=" +
    viewportScale +
    ",user-scalable=no,maximum-scale=3,width=device-width,height=device-height";
  $("head").append('<meta name="viewport" content="' + content + '">');
};

const selectGiverClickHandler = () => {
  $("#select_giver").click(async () => {
    if ($("#select_giver_dialog").dialog("isOpen")) {
      $("#select_giver_dialog").dialog("close");
      return;
    }
    openDialog("#select_giver_dialog");
    loadSelectGiverDialog();
  });
};

const startSpinButtonClickHandler = () => {
  $("#start_spin_button").click(() => {
    $("#start_spin_button").button("option", "disabled", true);
    $("#select_giver").button("option", "disabled", true);
    if (giverSelected) {
      processSpinButton();
    } else {
      promptForGiverName();
    }
  });
};

const clickCounterHandlers = () => {
  $("#winwheelCanvas").click(function() {
    countWheelClicks();
  });
  $("#drawing_complete_span").click(function() {
    countWheelClicks();
  });
};

const windowResizeHandler = () => {
  $(window).resize(function() {
    windowResizeFunction();
    window.setTimeout(function() {
      windowResizeFunction();
    }, 500);
  });
  $(window).trigger("resize");
};
