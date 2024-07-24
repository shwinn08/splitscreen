const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const KEYFILEPATH = path.join(__dirname, 'peppy-primacy-427205-v1-f5fd6743bcdb.json');
const PROJECT_ID = 'peppy-primacy-427205-v1';

app.use(bodyParser.json());

const bigquery = google.bigquery('v2');
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

google.options({ auth });

app.post('/fetch-patents', async (req, res) => {
  const { patentId } = req.body;

  try {
    const sqlQuery = `
      SELECT
        publication_number,
        title,
        abstract,
        assignee_organization,
        publication_date,
        filing_date
      FROM
        \`patents-public-data.patents.publications\`
      WHERE
        publication_number = @patentId
      LIMIT 1
    `;

    const options = {
      query: sqlQuery,
      location: 'US',
      params: {
        patentId: patentId,
      },
      useLegacySql: false
    };

    const [job] = await bigquery.jobs.query({
      projectId: PROJECT_ID,
      requestBody: options,
    });

    const [rows] = await bigquery.jobs.getQueryResults({
      projectId: PROJECT_ID,
      jobId: job.data.jobReference.jobId,
    });

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: 'Patent not found' });
    }
  } catch (error) {
    console.error('Error fetching data from BigQuery:', error);
    res.status(500).json({ error: 'Error fetching data from BigQuery' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
