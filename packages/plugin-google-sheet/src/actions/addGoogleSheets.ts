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

// 🔹 Function to Manually Extract Name & Email
function extractManualData(messageText: string) {
    const nameMatch = messageText.match(/(?:add|sheet|data)?\s*([\w]+)\s+and\s+/i);
    const emailMatch = messageText.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);

    return {
        name: nameMatch ? nameMatch[1].trim() : "NA",
        email: emailMatch ? emailMatch[0].trim() : "NA",
    };
}

// 🔹 AI-Based Extraction Template
const addItemTemplate = `
Your task is to extract structured information from a message and return it as a JSON markdown block.

### **Extraction Rules:**
1. Identify the **name** of the person mentioned in the message.
2. Identify the **email address** if present.
3. If a value cannot be determined, return "NA".
4. Do **not** modify or validate the extracted values—simply return them as they appear.
5. **Do not check for duplicates**—your only job is to extract data.
6. Preserve capitalization exactly as provided.

---

### **Input Message:**
\`\`\`
{{input_message}}
\`\`\`

### **Expected Response Format:**
Respond **only** with a correctly formatted JSON markdown block.

\`\`\`json
{
    "name": "{{extracted_name}}",
    "email": "{{extracted_email}}"
}
\`\`\`
`;

export const addGoogleSheetListAction: Action = {
    name: "ADD_GOOGLE_SHEET_DATA",
    similes: ["ADD_GOOGLE_SHEET_DATA", "ADD_ITEM", "ADD"],
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
        elizaLogger.log("Adding google sheet data");

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Received message:", message.content.text);

        // 🔹 Step 1: Extract Data Manually
        const manualData = extractManualData(message.content.text);
        elizaLogger.log(`Manually Extracted: Name = ${manualData.name}, Email = ${manualData.email}`);

        // 🔹 Step 2: Use AI Model to Confirm Extraction
        const deployContext = composeContext({
            state,
            template: addItemTemplate.replace("{{input_message}}", message.content.text),
        });

        let response;
        try {
            response = await generateObjectDeprecated({
                runtime,
                context: deployContext,
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.log("AI Extracted Data:", JSON.stringify(response, null, 2));
        } catch (error) {
            elizaLogger.error("OpenAI Extraction Failed:", error);
            response = {}; // AI extraction failed, fallback to manual
        }

        // 🔹 Step 3: Use AI Data if Valid, Otherwise Use Manual
        const extractedData = {
            name: response?.name && response.name !== "NA" ? response.name : manualData.name,
            email: response?.email && response.email !== "NA" ? response.email : manualData.email,
        };

        elizaLogger.log(`Final Extracted Data: Name = ${extractedData.name}, Email = ${extractedData.email}`);

        // 🔹 Step 4: Send Data to Google Sheets
        const googleSheetService = createGoogleSheetsService();
        try {
            const newValues = [extractedData.name, extractedData.email];
            const data = await googleSheetService.addItemToList(newValues);
            console.log("Google Sheets Response:", data);

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
                content: { text: "Add sheet data: Robert, robert@gmail.com" },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Sure, I'll add the data 'Robert, robert@gmail.com' to the list now.",
                    action: "ADD_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: { text: "Successfully added the data 'Robert, robert@gmail.com' to the list" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Add Ruben and ruben@gmail.com to the sheet" },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll add the data 'Ruben, ruben@gmail.com' to the sheet now.",
                    action: "ADD_GOOGLE_SHEET_DATA",
                },
            },
            {
                user: "{{agent}}",
                content: { text: "Successfully added the data 'Ruben, ruben@gmail.com' to the sheet" },
            },
        ],
    ] as ActionExample[][],
} as Action;