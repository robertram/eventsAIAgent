import { Plugin } from "@elizaos/core";
import { getGoogleListAction } from "./actions/readGoogleSheet";

export const googleSheetPlugin: Plugin = {
    name: "googleSheet",
    description: "Google Sheet plugin for Eliza",
    actions: [getGoogleListAction],
    evaluators: [],
    providers: [],
};
export default googleSheetPlugin;