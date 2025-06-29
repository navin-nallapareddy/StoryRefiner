// Base URL of the StoryRefiner API
const SERVER_URL = "https://storyrefiner.onrender.com";

SDK.init();
let formService;
SDK.ready().then(async function() {
  formService = await SDK.getService("ms.vss-work-web.work-item-form");

  document.getElementById("rateBtn").addEventListener("click", function() {
    handleAction("rate");
  });
  document.getElementById("rewriteBtn").addEventListener("click", function() {
    handleAction("rewrite");
  });

  updateActionsVisibility();
  formService.onFieldChanged(function(args) {
    if (args.changedFields.includes("System.Title") || args.changedFields.includes("System.Description")) {
      updateActionsVisibility();
    }
  });
});

async function updateActionsVisibility() {
  const title = await formService.getFieldValue("System.Title");
  const description = await formService.getFieldValue("System.Description");
  const actions = document.getElementById("actions");
  if (title && title.trim() !== "" && description && description.trim() !== "") {
    actions.style.display = "block";
  } else {
    actions.style.display = "none";
  }
}
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
