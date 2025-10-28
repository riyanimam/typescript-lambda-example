import type { SQSEvent, SQSRecord, Context } from 'aws-lambda';

// Minimal contract:
// - Input: SQSEvent where each SQS record body is a JSON string of an S3 event
// - Output: void (logs and processes records)
// - Error handling: continue processing other records if one fails; throw only if an unexpected fatal error occurs

export const handler = async (event: SQSEvent, _context: Context): Promise<void> => {
  // Iterate SQS records in parallel but limit concurrency if needed (here simple Promise.all)
  await Promise.all(
    event.Records.map(async (record: SQSRecord) => {
      try {
        // SQS message body for S3 notifications is typically the S3 event JSON
        const body = record.body;

        // Try parsing the body as JSON
        const parsed = JSON.parse(body);

        // The parsed object should be an S3 event with Records array
        const s3Records = parsed?.Records ?? [];

        if (!Array.isArray(s3Records) || s3Records.length === 0) {
          console.warn('SQS message did not contain S3 event records', { messageId: record.messageId });
          return;
        }

        for (const s3Record of s3Records) {
          try {
            const bucket = s3Record?.s3?.bucket?.name;
            const key = s3Record?.s3?.object?.key;

            if (!bucket || !key) {
              console.warn('S3 record missing bucket or key', { s3Record, messageId: record.messageId });
              continue;
            }

            // Your processing logic here. Example: log and pretend to process.
            console.info('Processing S3 object', { bucket, key, eventName: s3Record.eventName });

            // Example: decode key if it was URL encoded
            const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));

            // TODO: Replace with real work: download object, transform, forward to DB, etc.
            // For now just a placeholder async wait to show where async work would occur.
            await Promise.resolve();

            console.info('Processed S3 object successfully', { bucket, key: decodedKey, messageId: record.messageId });
          } catch (innerErr) {
            console.error('Failed processing S3 record', { err: innerErr, messageId: record.messageId, s3Record });
            // continue processing other s3Records
          }
        }
      } catch (err) {
        console.error('Failed parsing SQS message body as JSON', { err, messageId: record.messageId, body: record.body });
        // Do not rethrow so other messages can be processed. If you want Lambda to fail and requeue, rethrow.
      }
    })
  );
};

// Export a named handler; AWS Lambda will work with an ESM bundle where the exported name is used.
