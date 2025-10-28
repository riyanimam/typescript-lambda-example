// backup of the manual S3 mock (moved out of Jest __mocks__ to avoid automatic mocking)
const GetObjectCommand = jest.fn((params) => params);

class S3Client {
  constructor() {}
  send() {
    const resp = global.__S3_MOCK_RESPONSE ?? { Body: Buffer.from('') };
    return Promise.resolve(resp);
  }
}

module.exports = { S3Client, GetObjectCommand };
