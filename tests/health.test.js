import supertest from 'supertest';

import startServer from '../src/start';

let apiServer;
let request;

describe("GET /healthcheck", () => {

  beforeAll(async () => {
    jest.setTimeout(10000);
    apiServer = await startServer(process.env.PORT).catch(err => {
      log.error('[server][start]', err);
      process.kill(process.pid);
    });
    request = supertest(apiServer);

    // Allow time for mongo to connect
    await new Promise((r) => setTimeout(r, 1000));
  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  describe("Is backend healthy?", () => {

    test("should respond with a 200 status code", async () => {
      const response = await request.get("/healthcheck");
      expect(response.statusCode).toBe(200);
    })

  });

});
