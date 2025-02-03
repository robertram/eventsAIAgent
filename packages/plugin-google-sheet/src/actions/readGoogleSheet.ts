import {
    type Action,
    ActionExample,
    composeContext,
    elizaLogger,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import { validateGoogleSheetConfig } from "../environment";
import { createGoogleSheetsService } from "../services";

const getSheetDataTemplate = `
Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Extract the following details from the Google Sheet data:
- name
- email

The Google Sheets data follows this structure:
[
    { "name": "Name", "email": "email@gmail.com" },
]

Example requests and responses:

**Request:** "Give me the users information"
\`\`\`json
[
    {
        "nombre": "Robert",
        "email": "email@gmail.com"
    }
]
\`\`\`
`;

export const getGoogleListAction: Action = {
    name: "GET_GOOGLE_SHEET_DATA",
    similes: [
        "GET_GOOGLE_SHEET_DATA",
        "GET_SHEET_DATA",
        "GET_SHEET",
        "GET_LIST",
        "LIST",
        "DATA",
        "SHEET",
        "GOOGLE SHEET",
        "EXCEL",
        "SHEET DATA"
    ],
    description: "Gets the google sheet data",
    validate: async (runtime: IAgentRuntime) => {
        await validateGoogleSheetConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory | any,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {

        elizaLogger.log('Logging google sheet data');

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const deployContext = composeContext({
            state,
            template: getSheetDataTemplate,
        });

        const response = await generateObjectDeprecated({
            runtime,
            context: deployContext,
            modelClass: ModelClass.SMALL,
        });

        elizaLogger.log(JSON.stringify(response, null, 2));

        const googleSheetService = createGoogleSheetsService();

        try {
            const data = await googleSheetService.getList();
            console.log('data', data);

            let responseText = "I couldn't find any relevant data.";

            if (data){
                responseText = `The requested users are:\n` +
                    data.values.slice(1).map(row => `- ${row[0]}: ${row[1]}`).join('\n');
            }

            elizaLogger.success(`Responding with: ${responseText}`);
            callback?.({ text: responseText });
            return true;
        } catch (error: any) {
            elizaLogger.error("Error in Google Sheet plugin handler:", error);
            callback({
                text: `Error fetching Google Sheet list: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me the data from the list",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I'll give you the data from the list now.",
                    action: "GET_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Data from the list displayed now.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Get data from the sheet",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I'll give you the data from the sheet",
                    action: "ADD_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Successfully sent the data from the sheet",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;