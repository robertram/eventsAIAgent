import { google } from 'googleapis';

export const createGoogleSheetsService = () => {
    const getList = async (): Promise<any> => {
        // Authorization for reading only the spreadsheet
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });
        const range = `Hoja 1!A:P`;

        const response: any = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range,
        });

        const values = response.data.values;

        return {
            values
        };
    };

    const addItemToList = async (newValues: any[]): Promise<any> => {
        // Authorization for editing the spreadsheet
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const sheets = google.sheets({ version: 'v4', auth });
        const range = `Hoja 1!A:P`;

        // Append values
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newValues], // Each inner array represents a row
            },
        });

        console.log('Update response', response);
        return response.data;
    };

    const updateList = async (newValues: any[]): Promise<any> => {
        // Authorization for editing the spreadsheet
        const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Update
        const range = `Hoja 1!A:C`;
        const response: any = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SHEET_ID,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [newValues],
            },
        });

        console.log('Update response', response);
        return response.data;
    };

    return { getList, addItemToList, updateList };
};