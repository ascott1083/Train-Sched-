var config = {
    apiKey: "AIzaSyC1-lfMm-ICxtXmyZYMaB8kS4it_jaZODI",
    authDomain: "transit-schedules.firebaseapp.com",
    databaseURL: "https://transit-schedules.firebaseio.com",
    projectId: "transit-schedules",
    storageBucket: "",
    messagingSenderId: "531882819109"
  };
  
  firebase.initializeApp(config);
  
  var database = firebase.database();
  
  var name = "";
  var destination = "";
  var frequency = "";
  var firstTrain = "";
  
  $("#train-form").on("submit", function() {
  
    event.preventDefault();
  
    if (!validateForm()) {
      return false;
    }
  
    name = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    frequency = $("#frequency").val().trim();
    firstTrain = $("#first-train").val().trim();
  
    database.ref().push({
      name: name,
      destination: destination,
      frequency: frequency,
      firstTrain: firstTrain
    });
  
    $("#train-form")[0].reset();
  
  });
  
  database.ref().on("child_added", function(snapshot) {
  
    var freq = snapshot.val().frequency;
    var initialTime = snapshot.val().firstTrain;
  
    var nextTrain = calculateNextTrains(freq, initialTime);
    var times = calculateArrivalTime(nextTrain);
    var formattedAMPM = times[0];
    var minutesAway = times[1];
  
  
    var newTableRow = $("<tr>");
  
    var newTableData =
    $("<td id='table-train-name'>" + snapshot.val().name + "</td>" +
    "<td id='table-train-destination'>" + snapshot.val().destination + "</td>" +
    "<td id='table-train-frequency'>" + snapshot.val().frequency + "</td>" +
    "<td id='table-train-arrival'>" + formattedAMPM + "</td>"+
    "<td id='table-train-minutes'>" + minutesAway + "</td>");
  
    newTableRow.append(newTableData);
    $("#table-body").append(newTableRow);
  
  });
  
  function calculateNextTrains(freq, initialTime) {
  
    var timeMoment = moment(initialTime, "HH:mm");
  
    var endOfDay = moment("23:59", "HH:mm");
  
    var timetable = [];
  
    
    for (var i = timeMoment; i.isSameOrBefore(endOfDay); i.add(freq, "minutes")) {
      var times = i.format("HH:mm");
      timetable.push(times);
    }
  
    var now = moment();
  
    var futureTrains = [];
  
    for (var i = 0; i < timetable.length; i++) {
      if (moment(timetable[i], "HH:mm").isAfter(now)) {
        futureTrains.push(timetable[i]);
      }
    }
  
    var nextTrain = futureTrains[0];
  
    return nextTrain;
  
  }
  
  function calculateArrivalTime(nextTrain) {
    var now = moment();
    var minutesAway = moment(nextTrain, "HH:mm").diff(now, "minutes");
    var formattedAMPM = moment(nextTrain, "HH:mm").format("h:mm a");
    return [formattedAMPM, minutesAway];
  }
  
  
  function validateForm() {
    var firstTrainTimes = $("#first-train").val().trim().split(":");
  
    if (!validateFirstTrainTime(firstTrainTimes[0], firstTrainTimes[1])) {
      return false;
    }
    return true;
  }
  
  function validateFirstTrainTime(hours, minutes) {
    if (!((hours >= 00 || hours >= 0) && (hours <= 23))) {
      return false;
    }
    if (!((minutes >= 00) && (minutes <= 59))) {
      return false;
    }
    return true;
  }