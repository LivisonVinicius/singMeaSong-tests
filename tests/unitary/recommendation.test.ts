import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationFactory } from "../factories/recommendationFactory";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

beforeEach(() => {
  jest.resetAllMocks(), jest.clearAllMocks();
});

describe("POST /recommendations", () => {
  it("Must throw conflictError, recommendations names must be unique", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return recommendationFactory();
      });
    const recommendation = recommendationFactory();
    const response = recommendationService.insert(recommendation);

    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
  });
});
