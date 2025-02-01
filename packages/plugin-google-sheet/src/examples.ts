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

export const readDataExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Please give me the data from the google sheet list",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here you have the google sheet list",
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
