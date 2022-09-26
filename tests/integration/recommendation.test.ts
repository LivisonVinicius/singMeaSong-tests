import supertest from "supertest";
import app from "../../src/app";
import { recommendationFactory } from "../factories/recommendationFactory";
import pkg, { prisma } from "@prisma/client";

const { PrismaClient } = pkg;

const client = new PrismaClient();

const agent = supertest(app);

beforeEach(async () => {
  await client.$executeRaw`TRUNCATE recommendations`;
});

describe("POST /recommendations", () => {
  it("Must return 201 if recommendation is in the correct format, and create a recommendation.", async () => {
    const recommendation = recommendationFactory();
    const resp = await agent.post("/recommendations").send(recommendation);
    const first = await client.recommendation.findFirst();

    expect(resp.status).toEqual(201);
    expect(first.name).toEqual(recommendation.name);
  });
});

afterAll(async () => {
  await client.$disconnect();
});
