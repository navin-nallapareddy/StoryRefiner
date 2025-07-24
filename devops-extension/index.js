var SERVER_URL = "https://storyrefiner.onrender.com"; // e.g. https://myserver.example.com

SDK.init();
SDK.ready().then(function() {
  document.getElementById("rateBtn").addEventListener("click", function() {
    handleAction("rate");
  });
  document.getElementById("rewriteBtn").addEventListener("click", function() {
    handleAction("rewrite");
  });
  document.getElementById("summaryBtn").addEventListener("click", function() {
    handleAction("summary");
  });
  // Removed Generate Test Scripts feature
});

async function handleAction(type) {
  document.getElementById("loader").style.display = "block";
  var formService = await SDK.getService("ms.vss-work-web.work-item-form");
  var title = await formService.getFieldValue("System.Title");
  var description = await formService.getFieldValue("System.Description");

  var prompt;
  if (type === "rate") {
    prompt = `Please rate the following user story based on clarity, feasibility, testability, completeness and value. Return HTML <tr> rows only.\nTitle: ${title}\nDescription: ${description}`;
  } else if (type === "rewrite") {
    prompt = `Please rewrite the user story and provide a short test approach that matches it.\nTitle: ${title}\nDescription: ${description}`;
  } else {
    prompt = `Summarize recommended test cases in a table with columns ID, Test Description and Risk Level. Return only HTML <tr> rows.\nTitle: ${title}\nDescription: ${description}`;
  }

  try {
    var response = await fetch(SERVER_URL + "/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt })
    });
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    var data = await response.json();
    document.getElementById("result").innerHTML = data.result;
  } catch (err) {
    document.getElementById("result").textContent = "Error: " + err.message;
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

