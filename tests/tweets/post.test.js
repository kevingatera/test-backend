import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import startServer from '../../src/start';

let apiServer;
let request;

// POST
let userId;

let testUser = {
  username: `testuser-${uuidv4()}`,
  password: `password${uuidv4().split('-')[0]}`,
};

describe("POST /tweets", () => {

  beforeAll(async () => {
    jest.setTimeout(10000);
    apiServer = await startServer(process.env.PORT).catch(err => {
      log.error('[server][start]', err);
      process.kill(process.pid);
    });
    request = supertest.agent(apiServer);

    // Allow time for mongo to connect
    await new Promise((r) => setTimeout(r, 1000));

    await request.post("/api/users/register").send(testUser);
    const response = await request.post("/api/auth/login").send(testUser);
    // save the session cookie
    request.jar.setCookie(response.headers['Set-Cookie']);
    userId = response.body.data.id;

  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  // describe("With preexisting username & valid/invalid message", () => {

  //   test("should respond with a 409 status code", async () => {
  //     const response = await request.post("/api/users/register").send({
  //       username: "testuser",
  //       message: `Test Message ${uuidv4()}`,
  //     })
  //     expect(response.statusCode).toBe(409);
  //     expect(response.body.error).toBe("Username already exists");
  //   })

  // });

  describe("With valid userId, valid username & valid message", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request.post(`/api/users/${userId}/tweets/create`).send({
        username: testUser.username,
        message: `Test Message ${uuidv4()}`
      });
      expect(response.statusCode).toBe(201)
      expect(response.body.tweet.id).toBeDefined();
    })

    test("should specify json in the content type header", async () => {
      const response = await request.post(`/api/users/${userId}/tweets/create`).send({
        username: testUser.username,
        message: `Test Message ${uuidv4()}`
      });
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
  })

  describe("With valid user, invalid username & valid message", () => {
    test("should respond with a 401 status code", async () => {
      const response = await request.post(`/api/users/${userId}/tweets/create`).send({
        username: `notmytestuser`,
        message: `Test Message ${uuidv4()}`
      })
      expect(response.statusCode).toBe(401)
    })
  })

  describe("With valid user but no message", () => {
    test("should respond with a 402 status code", async () => {
      const response = await request.post(`/api/users/${userId}/tweets/create`).send({
        username: testUser.username,
      })
      expect(response.statusCode).toBe(422);
      expect(response.body.errorKey).toBe("INVALID_REQUEST");
    })
  })

});

