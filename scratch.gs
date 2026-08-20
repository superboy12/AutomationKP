function testOpenById() {
  try {
    var sheetId = '1YV0Cx2YUfJysso29vdYoELQncHovwdza'; // The spreadsheet ID
    DocumentApp.openById(sheetId);
    console.log("Success");
  } catch (e) {
    console.log("Error name: " + e.name);
    console.log("Error message: " + e.message);
  }
}
