import { processEvent } from '../src/handler';

describe('processEvent', () => {
  it('returns processed object', () => {
    const payload = { foo: 'bar' };
    const out = processEvent(payload);
    expect(out).toEqual({ message: 'processed', input: payload });
  });
});
