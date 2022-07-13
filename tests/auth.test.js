import supertest from 'supertest';

import startServer from '../src/start';

let apiServer;
let request;

describe("POST /login", () => {

  beforeAll(async () => {
    jest.setTimeout(10000);
    apiServer = await startServer(process.env.PORT).catch(err => {
      log.error('[server][start]', err);
      process.kill(process.pid);
    });
    request = supertest(apiServer);

  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  describe("With valid username & valid password", () => {
    // TODO: Should save the username & password to db
    // TODO: Should respond with  a json object containing the user id

    test("should respond with a 200 status code", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "testuser",
        password: "password123"
      })
      expect(response.statusCode).toBe(200)
    })

    test("should specify json in the content type header", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "testuser",
        password: "password123"
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })

    test("response has user's id", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "testuser",
        password: "password123"
      })
      expect(response.body.data.id).toBeDefined()
    })
  })
  describe("With valid username & no password", () => {
    // TODO: Should NOT save to db
    // TODO: Should respond with  a json object containing the user id

    test("should respond with a 401 status code", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "testuser",
      })
      expect(response.statusCode).toBe(401)
    });

  });

  describe("With valid username & invalid password", () => {
    // TODO: Should NOT save to db
    // TODO: Should respond with  a json object containing the user id

    test("should respond with a 401 status code", async () => {
      const response = await request.post("/api/auth/login").send({
        username: "testuser",
        password: "wrongpassword123",
      })
      expect(response.statusCode).toBe(401);
      expect(response.body.errorKey).toBe("WRONG_CREDENTIALS");
      expect(response.body.error).toBe("Http Exception");
    });

  });

  describe("With invalid/no username & valid password", () => {

    test("should respond with a 401 status code", async () => {
      const response = await request.post("/api/auth/login").send({
        password: "password123",
      })
      expect(response.statusCode).toBe(401)
    })

  });

});
