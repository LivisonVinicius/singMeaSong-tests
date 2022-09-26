import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationFactory } from "../factories/recommendationFactory";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

beforeEach(() => {
  jest.resetAllMocks(), jest.clearAllMocks();
});

describe("insert function", () => {
  it("Must throw conflictError, recommendations names must be unique", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return recommendationFactory();
      });
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});
    const recommendation = recommendationFactory();
    const response = recommendationService.insert(recommendation);

    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
    expect(recommendationRepository.create).not.toBeCalled();
  });

  it("create function must be called", async () => {
    const recommendation = recommendationFactory();

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return false;
      });
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    await recommendationService.insert(recommendation);

    expect(recommendationRepository.create).toBeCalled();
  });
});
