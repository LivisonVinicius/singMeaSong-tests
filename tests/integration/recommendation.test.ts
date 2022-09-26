import supertest from "supertest";
import app from "../../src/app";
import { recommendationFactory } from "../factories/recommendationFactory";
import pkg, { prisma } from "@prisma/client";
import exp from "constants";

const { PrismaClient } = pkg;

const client = new PrismaClient();

const agent = supertest(app);

beforeEach(async () => {
  await client.$executeRaw`TRUNCATE recommendations`;
});

describe("POST /recommendations", () => {
  it("Must return status 201 if recommendation is in the correct format, and create a recommendation.", async () => {
    const recommendation = recommendationFactory();
    const resp = await agent.post("/recommendations").send(recommendation);
    const first = await client.recommendation.findFirst();

    expect(resp.status).toEqual(201);
    expect(first.name).toEqual(recommendation.name);
  });

  it("Must return status 409 try to POST a recommendation that the name already exists", async () => {
    const recommendation = recommendationFactory();
    await agent.post("/recommendations").send(recommendation);
    const response = await agent.post("/recommendations").send(recommendation);
    const count = await client.recommendation.count();

    expect(response.status).toEqual(409);
    expect(count).toEqual(1);
  });
});

describe("POST /recommendations/:id/upvote", () => {
  it("Must return status 200 and +1 score", async () => {
    const recommendation = recommendationFactory();
    await agent.post("/recommendations").send(recommendation);

    const { id } = await client.recommendation.findFirst({
      where: { name: recommendation.name },
    });
    const response = await agent.post(`/recommendations/${id}/upvote`);
    const { score } = await client.recommendation.findFirst({
      where: {
        name: recommendation.name,
      },
    });
    expect(score).toEqual(1);
    expect(response.status).toEqual(200);
  });
  it("Must return status 404 if id does not exist", async () => {
    const response = await agent.post(`/recommendations/-1/upvote`);
    expect(response.status).toEqual(404);
  });
});

describe("POST /recommendations/:id/downvote", () => {
  it("Must return status 200 and -1 score", async () => {
    const recommendation = recommendationFactory();
    await agent.post("/recommendations").send(recommendation);

    const { id } = await client.recommendation.findFirst({
      where: { name: recommendation.name },
    });
    const response = await agent.post(`/recommendations/${id}/downvote`);
    const { score } = await client.recommendation.findFirst({
      where: {
        name: recommendation.name,
      },
    });
    expect(score).toEqual(-1);
    expect(response.status).toEqual(200);
  });
  it("Must return status 404 if id does not exist", async () => {
    const response = await agent.post(`/recommendations/-1/downvote`);
    expect(response.status).toEqual(404);
  });
  it("Must remove recommendation if score is bellow -5", async () => {
    const recommendation = { ...recommendationFactory(), score: -5 };
    await client.recommendation.create({ data: recommendation });
    const { id } = await client.recommendation.findFirst({
      where: { name: recommendation.name },
    });
    const response = await agent.post(`/recommendations/${id}/downvote`);
    const createdRecomendation = await client.recommendation.findFirst({
      where: {
        name: recommendation.name,
      },
    });

    expect(response.status).toEqual(200);
    expect(createdRecomendation).toBe(null);
  });
});

describe("GET /recommendations", () => {
  it("Must return status 200, return a empty array or array of recommendations", async () => {
    const empty = await agent.get("/recommendations");
    const recommendation = recommendationFactory();
    await agent.post("/recommendations").send(recommendation);
    const response = await agent.get("/recommendations");
    console.log(response.body);
    expect(empty.status).toEqual(200);
    expect(response.status).toEqual(200);
    expect(empty.body.length).toEqual(0);
    expect(response.body.length).toEqual(1);
  });
});

afterAll(async () => {
  await client.$disconnect();
});
