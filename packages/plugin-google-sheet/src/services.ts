const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// import {
//     APODResponse,
//     MarsRoverDataResponse
// } from "./types";

//const BASE_URL = "https://api.nasa.gov/planetary/apod\?api_key\=";

export const createGoogleSheetsService = () => {
    const getList = async (): Promise<any> => {
        // if (!apiKey) {
        //     throw new Error("Invalid parameters");
        // }

        try {
            // const url = BASE_URL + apiKey
            // const response = await fetch(url);
            // if (!response.ok) {
            //     const error = await response.json();
            //     throw new Error(error?.message || response.statusText);
            // }

            const listMajorsData = authorize().then(listMajors).catch(console.error);
            console.log('listMajors', listMajorsData)

            //const data = await response.json();
            return {
                res: 'hello'
            };
        } catch (error: any) {
            console.error("NASA API Error:", error.message);
            throw error;
        }
    };

    // const getMarsRoverPhoto = async (): Promise<MarsRoverDataResponse> => {
    //     try {
    //         const data = await fetchMarsPhotos(apiKey)
    //         return data
    //     } catch (error: any) {
    //         console.error("NASA Mars Rover API Error:", error.message);
    //         throw error;
    //     }
    // }

    return { getList };
};


/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '1uKplhyBG4xdQnJAxNXz9CsiGyk8WbYpSO_uk7T-owec',//1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
      range: 'Hoja 1!A2:E',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    console.log('Name, Fecha:');
    rows.forEach((row) => {
      // Print columns A and E, which correspond to indices 0 and 4.
      console.log(`${row[0]}, ${row[1]}`);
    });
  }


/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}
