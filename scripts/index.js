var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (
      isMobile.Android() ||
      isMobile.BlackBerry() ||
      isMobile.iOS() ||
      isMobile.Opera() ||
      isMobile.Windows()
    );
  }
};

var viewport_scale = "";
var dummyAngle = 10;
var currentDummyAngle = 0;
var calculation_timeout = "";
var giver_selected = false;
var nbr_wheel_clicks = 0;
var click_timeout = false;

$(() => {
  $("#select_giver").click(async () => {
    if ($("#select_giver_dialog").dialog("isOpen")) {
      $("#select_giver_dialog").dialog("close");
      return;
    }

    openDialog("#select_giver_dialog");
    loadSelectGiverDialog();
  });

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

  $("#start_spin_button").click(() => {
    $("#start_spin_button").button("option", "disabled", true);
    $("#select_giver").button("option", "disabled", true);
    if (giver_selected) {
      processSpinButton();
    } else {
      promptForGiverName();
    }
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
        giver_selected = true;
        $("#select_giver").css({ color: "rgba(0,150,0,0.75)" });
        $("#start_spin_button").css({ color: "rgba(0,150,0,0.75)" });
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
    calculation_timeout = window.setTimeout(function() {
      $("#start_spin_button").data("calculated_target", "none");
      $("#calculation_message_span").html("Calculation failed");
      $("#calculation_message_dialog").dialog("open");
      window.setTimeout(function() {
        $("#calculation_message_dialog").dialog("close");
      }, 500);
      $("#select_giver").html("Select Your Name");
      $("#select_giver").css({ color: "rgba(150,0,0,0.75)" });
      $("#start_spin_button").css({ color: "rgba(150,0,0,0.75)" });
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
      $("#select_giver").html("Select Your Name");
      $("#select_giver").css({ color: "rgba(150,0,0,0.75)" });
      $("#start_spin_button").css({ color: "rgba(150,0,0,0.75)" });
      $("#start_spin_button").data("calculated_target", "none");
    } else if (getDeterminedPrizeResponse.trim() == "calculation failed") {
      $("#calculation_message_span").html("Calculation failed");
      $("#calculation_message_dialog").dialog("open");
      window.setTimeout(function() {
        $("#calculation_message_dialog").dialog("close");
      }, 500);
      $("#select_giver").html("Select Your Name");
      $("#select_giver").css({ color: "rgba(150,0,0,0.75)" });
      $("#start_spin_button").css({ color: "rgba(150,0,0,0.75)" });
      $("#start_spin_button").data("calculated_target", "none");
    } else {
      determinedPrize = JSON.parse(getDeterminedPrizeResponse);

      $("#start_spin_button").data("calculated_target", determinedPrize.number);

      var loadWishListResponse = await $.get({
        url: "ajax/load-wish-list.php?recipient_name=" + determinedPrize.name,
        cache: false
      });

      $("#display_wish_list").html(loadWishListResponse);
      $("#display_wish_list").prepend(
        '<div style="margin-top:25px;font-size:55px">You drew <span style="font-size:60px;color:#700000">' +
          determinedPrize.name +
          "</span>!</div>"
      );
      $("#display_wish_list").append(
        '<div style="margin-top:50px;margin-bottom:25px;font-size:25px">Wheel will be reset in <span id="page_reset_seconds" style="font-size:30px;color:#700000">30</span> <span id="page_reset_seconds_text">seconds</span></div>'
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
    giver_selected = false;
  };

  $("#winwheelCanvas").click(function() {
    count_wheel_clicks();
  });
  $("#drawing_complete_span").click(function() {
    count_wheel_clicks();
  });

  if ($("#content_wrapper_div").length > 0) {
    initializeWheel();
  }

  if (isMobile.any()) {
    if (window.screen.availHeight > window.screen.availWidth) {
      viewport_scale = Math.floor((window.screen.availWidth / 800) * 100) / 100;
    } else {
      viewport_scale =
        Math.floor((window.screen.availHeight / 800) * 100) / 100;
    }
  } else {
    viewport_scale = 1;
  }
  var content =
    "initial-scale=" +
    viewport_scale +
    ",user-scalable=no,maximum-scale=3,width=device-width,height=device-height";
  $("head").append('<meta name="viewport" content="' + content + '">');

  $(window).resize(function() {
    window_resize_function();
    window.setTimeout(function() {
      window_resize_function();
    }, 500);
  });

  $("#select_giver")
    .button()
    .css({ color: "rgba(150,0,0,0.75)" });
  $("#select_giver").css("visibility", "visible");
  $("#start_spin_button")
    .button()
    .css({ color: "rgba(150,0,0,0.75)" });
  $("#start_spin_button").css("visibility", "visible");

  window_resize_function();
  window.setTimeout(function() {
    window_resize_function();
  }, 500);
});

const count_wheel_clicks = async () => {
  nbr_wheel_clicks++;
  window.clearTimeout(click_timeout);
  click_timeout = window.setTimeout(async () => {
    if (nbr_wheel_clicks == 5) {
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
    } else if (nbr_wheel_clicks == 10) {
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
    nbr_wheel_clicks = 0;
  }, 1000);
};

function window_resize_function() {
  var width = 0;
  var height = 0;
  if (isMobile.any()) {
    if (window.orientation == 0 || window.orientation == 180) {
      width = Math.min(window.screen.availWidth, window.screen.availHeight);
      height = Math.max(window.screen.availWidth, window.screen.availHeight);
    } else {
      width = Math.max(window.screen.availWidth, window.screen.availHeight);
      height = Math.min(window.screen.availWidth, window.screen.availHeight);
    }
  } else {
    width = $(window).width();
    height = $(window).height();
  }
  var image_size = "";
  if (width / height > 1.6) {
    image_size =
      Math.round(width / viewport_scale) +
      "px " +
      Math.round(width / viewport_scale / 1.6) +
      "px";
  } else {
    image_size =
      Math.round((height / viewport_scale) * 1.6) +
      "px " +
      Math.round(height / viewport_scale) +
      "px";
  }
  $("body").css("background-size", image_size);
  if ($("#content_wrapper_div").length > 0) {
    $("#select_name_div").css(
      "margin-top",
      Math.max(Math.round((height - 850 * viewport_scale) / 2), 0) + "px"
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
      Math.round((height - 120) / 2 / viewport_scale) + "px"
    );
  }
}

function reset_page_counter() {
  var seconds = $("#page_reset_seconds").html();
  seconds--;
  $("#page_reset_seconds").html(seconds);
  if (seconds == 1) {
    $("#page_reset_seconds_text").html("second");
    window.setTimeout(function() {
      window.location.replace(window.location);
    }, 1000);
  } else {
    window.setTimeout(function() {
      reset_page_counter();
    }, 1000);
  }
}

function dummySpin() {
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
    window.clearTimeout(calculation_timeout);
    startSpin($("#start_spin_button").data("calculated_target"));
  } else {
    window.clearTimeout(calculation_timeout);
    initialDraw();
  }
}

const openDialog = (selector, loading = true) => {
  $(selector).dialog("open");

  if (loading) {
    $(selector).html(
      '<img src="images/loading_color_wheel.gif" style="height:150px">'
    );
  }
};
