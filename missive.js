const https = require('https');

/**
 * Sends an email with the given parameters
 *
 * @param {string} token - A `Bearer` token for the Missive API
 * @param {string} body - The body of the email - `<b>html</b>` or plain text
 * @param {string} subject - The subject of the email
 * @param {Object} to - The recipient of the email
 * @param {string} to.name - The readable name of the recipient of the email
 * @param {string} to.address - The email address of the recipient of the email
 * @param {Object} from - The sender of the email
 * @param {string} from.name - The readable name of the sender of the email
 * @param {string} from.address - The email address of the sender of the email
 * @param {string} reference - The email address that started the conversation - optional
 * @param {string[]} labels - Any labels to attach to the conversation - optional
 * @param {boolean} [send=false] - Whether to send the email; default will create a draft on Missive - optional
 * @param {Array<{base64_data: string, filename: string}>} [attachments] - An array of attachment objects. NB the total payload must be <=10MB - optional
 * @param {Object} [logger=null] - An object with an `info` method to log interactions - optional
 * @returns {Promise<Object>} - A promise that resolves with the response from the HTTPS request
 */
async function createEmail(token, body, subject, to, from, reference, labels, send = false, attachments = [], logger = null) {
  const email = {
    drafts: {
      send: send,
      subject: subject,
      body: body,
      to_fields: [to],
      from_field: from,
      references: [reference],
      attachments: attachments,
      add_shared_labels: labels,
    },
  };

  const options = {
    hostname: 'public.missiveapp.com',
    path: '/v1/drafts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(data);
        logger ? logger.info(`Email sent via Missive to ${to.address} with response status: ${response.status}`) : null;
        resolve(response);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(email));
    req.end();
  });
}

module.exports = {
  createEmail,
};
