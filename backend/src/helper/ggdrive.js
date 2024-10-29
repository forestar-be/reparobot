const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');
if (!process.env.KEY_FILE) {
  throw new Error('KEY_FILE environment variable is required');
}

const drive = google.drive({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    keyFile: process.env.KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  }),
});

const maxTries = 10;

async function uploadFileToDrive(fileBuffer, fileName, mimeType) {
  let fileIndex = 0;
  let newFileName = fileName;

  while (true) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: newFileName,
          mimeType: mimeType,
        },
        media: {
          mimeType: mimeType,
          body: Readable.from(fileBuffer),
        },
      });

      await drive.permissions.create({
        fileId: response.data.id,
        // transferOwnership: true,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: process.env.EMAIL_USER,
        },
      });

      return response.data;
    } catch (error) {
      if (error.code === 409 && fileIndex < maxTries) {
        // Conflict error, file already exists
        fileIndex++;
        const ext = path.extname(fileName);
        newFileName = path.basename(fileName, ext) + ` (${fileIndex})` + ext;
      } else {
        throw error;
      }
    }
  }
}

module.exports = { uploadFileToDrive };
