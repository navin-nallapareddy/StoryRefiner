# Story Quality AI Azure DevOps Extension

This folder contains a minimal example of an Azure DevOps extension that adds a **Story Quality (AI)** section to the User Story work item form. Once the title and description fields have text, the extension shows **Rate It** and **Re-write** buttons which call the existing API provided by this repository.

## Files

- `vss-extension.json` – extension manifest
- `index.html` – iframe content loaded in the work item form
- `index.js` – logic that retrieves work item fields and calls the API
- `style.css` – basic styling for the iframe

## Usage

1. `index.js` is configured to use the hosted API at `https://storyrefiner.onrender.com`.
   Update `SERVER_URL` if you deploy the server elsewhere.
2. Install the [Azure DevOps extension CLI](https://learn.microsoft.com/azure/devops/extend/develop/command-line?view=azure-devops) and package the extension:
   ```bash
   tfx extension create --manifest-globs vss-extension.json
   ```
3. Upload the generated `.vsix` to your Azure DevOps organization and install it.

The extension will appear only for work items of type **User Story** and will display the AI results inside the **Story Quality (AI)** group.
