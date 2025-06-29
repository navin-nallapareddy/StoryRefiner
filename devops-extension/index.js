var SERVER_URL = ""; // e.g. https://myserver.example.com

SDK.init();
SDK.ready().then(function() {
  document.getElementById("rateBtn").addEventListener("click", function() {
    handleAction("rate");
  });
  document.getElementById("rewriteBtn").addEventListener("click", function() {
    handleAction("rewrite");
  });
});

async function handleAction(type) {
  document.getElementById("loader").style.display = "block";
  var formService = await SDK.getService("ms.vss-work-web.work-item-form");
  var title = await formService.getFieldValue("System.Title");
  var description = await formService.getFieldValue("System.Description");

  var prompt;
  if (type === "rate") {
    prompt = `Please rate the following user story based on clarity, feasibility, testability, completeness and value. Return HTML <tr> rows only.\nTitle: ${title}\nDescription: ${description}`;
  } else {
    prompt = `Please rewrite the user story.\nTitle: ${title}\nDescription: ${description}`;
  }

  try {
    var response = await fetch(SERVER_URL + "/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt })
    });
    var data = await response.json();
    document.getElementById("result").textContent = data.result;
  } catch (err) {
    document.getElementById("result").textContent = "Error: " + err.message;
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}
