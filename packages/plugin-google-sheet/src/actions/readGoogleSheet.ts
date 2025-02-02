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
import { readDataExamples } from "../examples";
import { createGoogleSheetsService } from "../services";

const deployTemplate = `
Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Extract the following details from the Google Sheet data:
- User name
- Date or associated value

If the user asks for:
- "first user" → Return the first entry.
- "second user" → Return the second entry.
- "third user" → Return the third entry.
- If the requested index does not exist, return null.

The Google Sheets data follows this structure:
[
    { "nombre": "Name", "fecha": "date" },
    { "nombre": "Name", "fecha": "date" }
]

Example requests and responses:

**Request:** "Give me the first user"
\`\`\`json
{
    "nombre": "Robert",
    "fecha": "01/02/2023"
}
\`\`\`
`;

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
        message: Memory | any,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const deployContext = composeContext({
            state,
            template: deployTemplate,
        });

        const response = await generateObjectDeprecated({
            runtime,
            context: deployContext,
            modelClass: ModelClass.SMALL,
        });

        elizaLogger.log(JSON.stringify(response, null, 2));

        elizaLogger.log('Logging google sheet data');

        const googleSheetService = createGoogleSheetsService();

        try {
            const data = await googleSheetService.getList();
            console.log('data', data);

            let responseText = "I couldn't find any relevant data.";
            //const userRequest = message?.text?.toLowerCase() || '';

            if(data){
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
    examples: readDataExamples as ActionExample[][],
} as Action;