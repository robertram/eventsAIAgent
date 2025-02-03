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

const addItemTemplate = `Respond with a JSON markdown block containing only the extracted values. Use "NA" for any values that cannot be determined.

Analyze the values based on the provided message. Extract the following information:
The name of the user
The email of the user

Example response:
\`\`\`json
{
    "name": "robert",
    "email": "robert@gmail.com"
}
\`\`\`
`;

export const addGoogleSheetListAction: Action = {
    name: "ADD_GOOGLE_SHEET_DATA",
    similes: [
        "ADD_GOOGLE_SHEET_DATA",
        "ADD_ITEM",
        "ADD",
    ],
    description: "Add google sheet data",
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
        elizaLogger.log('Adding google sheet data');

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const deployContext = composeContext({
            state,
            template: addItemTemplate,
        });

        const response = await generateObjectDeprecated({
            runtime,
            context: deployContext,
            modelClass: ModelClass.SMALL,
        });

        elizaLogger.log(JSON.stringify(response, null, 2));

        const googleSheetService = createGoogleSheetsService();

        try {
            const newValues = [response.nombre, response.email];
            const data = await googleSheetService.addItemToList(newValues);
            console.log('data', data);
            let responseText = "Item added to the list";
            elizaLogger.success(`Responding with: ${responseText}`);
            callback?.({ text: responseText });
            return true;
        } catch (error: any) {
            elizaLogger.error("Error in Google Sheet plugin handler:", error);
            callback({
                text: `Error adding Google Sheet list: ${error.message}`,
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
                    text: "Add sheet data: Robert, robert@gmail.com, true",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I'll add the data 'Robert, robert@gmail.com, true' to the list now.",
                    action: "ADD_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Successfully added the data 'Robert, robert@gmail.com, true' to the list",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Add 'Robert, robert@gmail.com, true' to the sheet",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I'll add the data 'Robert, robert@gmail.com, true' to the sheet now.",
                    action: "ADD_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Successfully added the data 'Robert, robert@gmail.com, true' to the sheet",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;