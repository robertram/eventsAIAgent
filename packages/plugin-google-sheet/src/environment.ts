import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const googleSheetEnvSchema = z.object({
    GOOGLE_SHEET_CLIENT_ID: z.string().min(1, "Google Sheet Client Id is required"),
    GOOGLE_SHEET_CLIENT_SECRET: z.string().min(1, "Google Sheet Client Secret is required"),
    GOOGLE_SHEET_REFRESH_TOKEN: z.string().min(1, "Google Sheet Refresh Token is required"),
});

export type nasaConfig = z.infer<typeof googleSheetEnvSchema>;

export async function validateGoogleSheetConfig(
    runtime: IAgentRuntime
): Promise<nasaConfig> {
    try {
        const config = {
            GOOGLE_SHEET_CLIENT_ID: runtime.getSetting("GOOGLE_SHEET_CLIENT_ID"),
            GOOGLE_SHEET_CLIENT_SECRET: runtime.getSetting("GOOGLE_SHEET_CLIENT_SECRET"),
            GOOGLE_SHEET_REFRESH_TOKEN: runtime.getSetting("GOOGLE_SHEET_REFRESH_TOKEN"),
        };
        console.log('config: ', config)
        return googleSheetEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error)
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Google Sheet API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
