class Pool {
  constructor() {}
  query(_text, _params) {
    return Promise.resolve({ rows: [] });
  }
  end() {
    return Promise.resolve();
  }
}

module.exports = { Pool };
