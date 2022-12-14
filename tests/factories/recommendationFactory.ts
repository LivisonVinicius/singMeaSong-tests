import { faker } from "@faker-js/faker";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export function recommendationFactory() {
  const recommendation: CreateRecommendationData = {
    name: faker.lorem.word(),
    youtubeLink: `https://www.youtube.com/${faker.lorem.word()}`,
  };
  return recommendation;
}
export function scoreFactory() {
  return faker.datatype.number({ min: -5, max: 50 });
}
