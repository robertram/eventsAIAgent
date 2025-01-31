import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateGoogleSheetConfig } from "../environment";
import { readSheetDataExamples } from "../examples";
import { createGoogleSheetsService } from "../services";

export const getGoogleSheetAction: Action = {
    name: "GOOGLE_SHEET_GET_DATA",
    similes: [
        "LIST",
        "DATA",
        "EVENTS",
        "SHEET"
    ],
    description: "Get the Google Sheet Data.",
    validate: async (runtime: IAgentRuntime) => {
        await validateGoogleSheetConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {

        const config = await validateGoogleSheetConfig(runtime);
        const googleSheetService = createGoogleSheetsService(        );

        try {
            // const APODData = await nasaService.getAPOD();
            const data = await googleSheetService.getList();
            console.log('data', data)
            elizaLogger.success(
                `Successfully fetched google sheet data`
            );
            if (callback) {
                callback({
                    text: `Here is the google sheet data: `
                });
                //${APODData.url}
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Google Sheet plugin handler:", error);
            callback({
                text: `Error fetching Google Sheet Data: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: readSheetDataExamples as ActionExample[][],
} as Action;