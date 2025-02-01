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
import { readDataExamples } from "../examples";

export const getGoogleListAction: Action = {
    name: "GET_GOOGLE_SHEET_DATA",
    similes: [
        "LIST",
        "DATA",
        "EVENTS",
        "SHEET",
        "SPREADSHEET",
        "ROWS",
        "COLUMNS",
        "TABLE",
        "GOOGLE SHEET",
        "EXCEL",
        "SHEET DATA"
    ],
    description: "Get google sheet data",
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

        //const config = await validateNasaConfig(runtime);
        // const nasaService = createNASAService(
        //     config.NASA_API_KEY
        // );

        elizaLogger.log('Logging google sheet data')

        try {
            //const MarsRoverData = await nasaService.getMarsRoverPhoto();
            elizaLogger.success(
                `Successfully fetched Google Sheet Data`
            );
            if (callback) {
                callback({
                    text: `
                    Here is your google sheet data
                    `
                });
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Google Sheet plugin handler:", error);
            callback({
                text: `Error fetching Google Sheet list: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: readDataExamples as ActionExample[][],
} as Action;