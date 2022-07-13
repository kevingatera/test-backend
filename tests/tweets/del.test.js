import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'bson';

import startServer from '../../src/start';

let apiServer;
let request;

let userId;
let tweetId;

let testUser = {
  username: `testuser-${uuidv4()}`,
  password: `password${uuidv4().split('-')[0]}`,
};

describe("DELETE /tweets", () => {

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

    const tweetResponse = await request.post(`/api/users/${userId}/tweets/create`).send({
      username: testUser.username,
      message: `Test Message ${uuidv4()}`
    });
    tweetId = tweetResponse.body.tweet.id;

  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  describe("With valid userId & valid tweetId & invalid tweetId", () => {
    test("should respond with a 404 status code", async () => {
      const response = await request.del(`/api/users/${userId}/tweets/${new ObjectID()}/delete`).send();
      expect(response.statusCode).toBe(404);
    })
  })

  describe("With invalid userId & valid tweetId", () => {
    test("should respond with a 401 status code", async () => {
      const response = await request.del(`/api/users/${new ObjectID()}/tweets/${tweetId}/delete`).send();
      expect(response.statusCode).toBe(401)
      expect(response.body.errorKey).toBe("UNAUTHORIZED");
    })
  })

  describe("With valid userId & valid tweetId", () => {
    test("should respond with a 200 status code & specify json in the content type header", async () => {
      const response = await request.del(`/api/users/${userId}/tweets/${tweetId}/delete`).send();
      expect(response.statusCode).toBe(200);
      expect(response.body.tweetId).toBeDefined();
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    })
  })

});
