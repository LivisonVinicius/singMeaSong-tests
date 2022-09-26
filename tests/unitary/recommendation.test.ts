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

describe("upvote function", () => {
  it("Must throw not_found error if id does not exist", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return false;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {});
    const id = -1;

    const response = recommendationService.upvote(id);

    expect(response).rejects.toEqual({ type: "not_found", message: "" });
    expect(recommendationRepository.updateScore).not.toBeCalled();
  });
  it("updateScore must be called with 'increment' as argument", async () => {
    const recommendation = recommendationFactory();
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((id, operation): any => {
        return operation;
      });

    const id = 1;
    await recommendationService.upvote(id);

    expect(recommendationRepository.updateScore).toBeCalledWith(
      id,
      "increment"
    );
  });
});

describe("downvote function", () => {
  it("Must throw not_found error if id does not exist", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return false;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {});
    jest.spyOn(recommendationRepository, "remove");
    const id = -1;

    const response = recommendationService.upvote(id);

    expect(response).rejects.toEqual({ type: "not_found", message: "" });
    expect(recommendationRepository.updateScore).not.toBeCalled();
    expect(recommendationRepository.remove).not.toBeCalled();
  });
  it("updateScore must be called with 'decrement' as argument and do not delete the recommendation", async () => {
    const recommendation = recommendationFactory();
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return { score: 1 };
      });
    jest.spyOn(recommendationRepository, "remove");

    const id = 1;
    await recommendationService.downvote(id);

    expect(recommendationRepository.updateScore).toBeCalledWith(
      id,
      "decrement"
    );
    expect(recommendationRepository.remove).not.toBeCalled();
  });
  it("updateScore must be called with 'decrement' as argument and delete the recommendation", async () => {
    const recommendation = recommendationFactory();
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return { score: -6 };
      });
    jest
      .spyOn(recommendationRepository, "remove")
      .mockImplementationOnce((): any => {});

    const id = 1;
    await recommendationService.downvote(id);

    expect(recommendationRepository.updateScore).toBeCalledWith(
      id,
      "decrement"
    );
    expect(recommendationRepository.remove).toBeCalled();
  });
});

describe("get function", () => {
  it("Must call findAll function", async () => {
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementationOnce((): any => {});
    await recommendationService.get();

    expect(recommendationRepository.findAll).toBeCalled();
  });
});

describe("getTop function", () => {
  it("Must call getAmountByScore function", async () => {
    jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockImplementationOnce((): any => {});
    const amount = 1;
    await recommendationService.getTop(amount);

    expect(recommendationRepository.getAmountByScore).toBeCalledWith(amount);
  });
});

describe("getRandom", () => {
  it("Must throw not_found if there isn't any recommendation in database", async () => {
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementation((): any => {
        return [];
      });
    const response = recommendationService.getRandom();
    expect(response).rejects.toEqual({ type: "not_found", message: "" });
  });
  it("Must call findAll function with scoreFilter 'lte'", async () => {
    const arr = [
      { ...recommendationFactory, score: 8 },
      { ...recommendationFactory, score: 2 },
      { ...recommendationFactory, score: 3 },
    ];
    jest.spyOn(Math, "random").mockImplementation((): any => {
      return 0.8;
    });
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementation((): any => {
        return arr;
      });

    await recommendationService.getRandom();
    expect(recommendationRepository.findAll).toHaveBeenCalledWith({
      score: 10,
      scoreFilter: "lte",
    });
  });
  it("Must call findAll function with scoreFilter 'gt'", async () => {
    const arr = [
      { ...recommendationFactory, score: 11 },
      { ...recommendationFactory, score: 12 },
      { ...recommendationFactory, score: 14 },
    ];
    jest.spyOn(Math, "random").mockImplementation((): any => {
      return 0.2;
    });
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementation((): any => {
        return arr;
      });

    await recommendationService.getRandom();
    expect(recommendationRepository.findAll).toHaveBeenCalledWith({
      score: 10,
      scoreFilter: "gt",
    });
  });
});
