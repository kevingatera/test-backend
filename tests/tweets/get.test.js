import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'bson';

import startServer from '../../src/start';

let apiServer;
let request;

//  PUT
let userId;
let tweetIds = [];

const TOTAL_TEST_TWEETS = 5;

let testUser = {
  username: `testuser-${uuidv4()}`,
  password: `password${uuidv4().split('-')[0]}`,
};

describe("GET /tweets", () => {

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

    for (let i = 0; i < TOTAL_TEST_TWEETS; i++) {
      let tweetResponse = await request.post(`/api/users/${userId}/tweets/create`).send({
        username: testUser.username,
        message: `Test Message ${uuidv4()}`
      });
      tweetIds.push(tweetResponse.body.tweet.id);
    }

  });

  afterAll(async () => {
    // Cleanup after yourself!.
    await apiServer.shutdown();
  })

  describe("GET /:id", () => {
    describe("With valid userId & valid tweetId & invalid tweetId", () => {
      test("should respond with a 404 status code", async () => {
        const response = await request.get(`/api/users/${userId}/tweets/${new ObjectID()}`).send();
        expect(response.statusCode).toBe(404);
      })
    })

    describe("With invalid userId & valid tweetId", () => {
      test("should respond with a 404 status code", async () => {
        const response = await request.get(`/api/users/${new ObjectID()}/tweets/${tweetIds[0]}`).send();
        expect(response.statusCode).toBe(404)
        expect(response.body.errorKey).toBe("TWEET_NOTFOUND");
      })
    })

    describe("With valid userId & valid tweetId", () => {
      test("should respond with a 200 status code & specify json in the content type header", async () => {
        const response = await request.get(`/api/users/${userId}/tweets/${tweetIds[0]}`).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.tweet.id).toBeDefined();
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      })
    })
  })

  describe("GET /", () => {

    describe("With invalid userId", () => {
      test("should respond with a 200 rather than 404 status code", async () => {
        const response = await request.get(`/api/users/${new ObjectID()}/tweets/`).send();
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        expect(response.body.tweets).toBeDefined();
        expect(response.body.tweets).toStrictEqual([]);
      })
    })

    describe("With valid userId", () => {
      test("should respond with a 200 status code & specify json in the content type header", async () => {
        const response = await request.get(`/api/users/${userId}/tweets/`).send();
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        expect(response.body.tweets).toBeDefined();
        expect(response.body.tweets.length).toBe(TOTAL_TEST_TWEETS);
      })
    })
  })

});
