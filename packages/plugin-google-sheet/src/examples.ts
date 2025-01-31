import { ActionExample } from "@elizaos/core";

export const readSheetDataExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you show me the data from the list?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me return the data from the list.",
                action: "GET_GOOGLE_SHEET_DATA",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Get me the data from the list",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me get the data from the list",
                action: "GET_GOOGLE_SHEET_DATA",
            },
        }
    ],
]
