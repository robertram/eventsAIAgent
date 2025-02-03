import { Plugin } from "@elizaos/core";
import { getGoogleListAction  } from "./actions/readGoogleSheet";
import { addGoogleSheetListAction } from "./actions/addGoogleSheets";

export const googleSheetPlugin: Plugin = {
    name: "googleSheet",
    description: "Google Sheet plugin for Eliza",
    actions: [ getGoogleListAction, addGoogleSheetListAction ],
    evaluators: [],
    providers: [],
};
export default googleSheetPlugin;