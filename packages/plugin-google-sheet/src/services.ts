import { google } from 'googleapis';

export const createGoogleSheetsService = () => {
    const getList = async (): Promise<any> => {
        // Auth
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Query
        const range = `Hoja 1!A1:C9`;
        const response: any = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range,
        });

        console.log('response', response);
        const values = response.data.values;

        // Result
        const [title, content] = values[1];
        console.log(title, content);

        return {
            title,
            content,
            values
        };
    };

    return { getList };
};