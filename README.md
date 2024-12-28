import { errorAction } from "../utils/store/error-slice";
import { AppDispatch, dispatchError, dispatchLoader } from "./common-service";

export const exceptionCheck = (response: any,isExit?:boolean): any => {
  return async (dispatch: AppDispatch) => {
    const errors =
      response.data &&
      response.data.application &&
      response.data.application.errors
        ? response.data.application
        : "";
    let responseAction =
      response.data &&
      response.data.application &&
      response.data.application.response_action
        ? response.data.application.response_action.toUpperCase()
        : "";
    let responseType =
      response.data &&
      response.data.application &&
      response.data.application.response_type
        ? response.data.application.response_type.toUpperCase()
        : "";
    let error: any = [];

    if (response.status === 200 || response.status === 201) {
      if (
        isExit && responseAction !== "CONTINUE" && responseAction !== "SUCCESS"
      ) { /** Exception handling specific for save and close pop-up */
        error = {
          response: {
            error_header: "Something went wrong!",
            errorList: {
              errors: [
                {
                  detail:
                  "Sorry, we are unable to save your application. Please proceed by resuming the application",
                }
            ]
            },

            error_button: "Ok",
            error_type: "cancelResume",
            status: "error",
          },
        };
        dispatch(errorAction.getRetryStatus(true));
        dispatch(errorAction.getExceptionList(error.response));
        dispatch(dispatchLoader(false));
        return Promise.reject("Rejected");
      }
      if (responseAction && responseType) {
        switch (responseAction) {
          case "CONTINUE":
          case "SUCCESS":
            if (responseType === "INFO" || responseType === "SOFT") {
              return Promise.resolve(response);
            }
            break;
          case "RESUBMIT":
          case "CORRECT":
          case "CORRECT AND RESUBMIT":
            if (errors && errors.errors && errors.errors.length > 0) {
              error = {
                response: {
                  error_header: "Please try again !",
                  errorList: errors,
                  error_button: "Ok",
                  error_type: "back",
                  status: "error",
                },
              };
            } else {
              error = {
                response: {
                  error_header: "Please try again !",
                  errorList: [
                    {
                      detail:
                        "We have encountered a technical issue. Please try again.",
                    },
                  ],
                  error_button: "Ok",
                  error_type: "back",
                  status: "error",
                },
              };
            }
            dispatch(errorAction.getRetryStatus(true));
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");

          case "STOP":
          case "FAIL":
            if (responseType === "HARD") {
              if (errors && errors.errors && errors.errors.length > 0) {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: errors,
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              } else {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: [
                      {
                        detail:
                          "Sorry, we are unable to process your request. Please try again later",
                      },
                    ],
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              }
            }
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");
          default:
            dispatch(dispatchError(error));
            return Promise.reject("Rejected");
        }
      } else {
        return Promise.resolve(response);
      }
    } else {
      dispatch(dispatchError(error));
      return Promise.reject("Rejected");
    }
  };
};

import { exceptionCheck } from "../services/exception-service";
import { errorAction } from "../utils/store/error-slice";
import { dispatchLoader, dispatchError } from "../services/common-service";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

const mockStore = configureStore([thunk]);

describe("exceptionCheck", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({});
  });

  it("should handle a successful response with 'CONTINUE' action and 'INFO' type", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "CONTINUE",
          response_type: "INFO",
        },
      },
    };

    await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();
    expect(actions).toEqual([]);
  });

  it("should handle 'RESUBMIT' action with errors and reject with the appropriate error", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "RESUBMIT",
          response_type: "SOFT",
          errors: { errors: [{ detail: "Invalid data" }] },
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getRetryStatus(true)
    );
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Please try again !",
        errorList: mockResponse.data.application.errors,
        error_button: "Ok",
        error_type: "back",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });

  it("should handle 'STOP' action with 'HARD' type and reject with the appropriate error", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "STOP",
          response_type: "HARD",
          errors: { errors: [{ detail: "Hard error occurred" }] },
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Something went wrong!",
        errorList: mockResponse.data.application.errors,
        error_button: "Ok",
        error_type: "CancelApplication",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });

  it("should handle a successful response without errors", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "SUCCESS",
          response_type: "INFO",
        },
      },
    };

    await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();
    expect(actions).toEqual([]);
  });

  it("should reject if status is not 200 or 201", async () => {
    const mockResponse = {
      status: 500,
      data: {},
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(dispatchError([]));
  });

  it("should handle 'isExit' scenario with invalid action", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "INVALID",
          response_type: "INFO",
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse, true));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getRetryStatus(true)
    );
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Something went wrong!",
        errorList: {
          errors: [
            {
              detail:
                "Sorry, we are unable to save your application. Please proceed by resuming the application",
            },
          ],
        },
        error_button: "Ok",
        error_type: "cancelResume",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });
});

import { exceptionCheck } from "../services/exception-service";
import { errorAction } from "../utils/store/error-slice";
import { dispatchLoader, dispatchError } from "../services/common-service";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

const mockStore = configureStore([thunk]);

describe("exceptionCheck - Extended Coverage", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({});
  });

  it("should handle a successful response with no response_action or response_type", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {},
      },
    };

    const result = await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();

    expect(result).toEqual(mockResponse);
    expect(actions).toEqual([]);
  });

  it("should handle an 'isExit' scenario with valid response_action but missing response_type", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "SUCCESS",
        },
      },
    };

    const result = await store.dispatch(exceptionCheck(mockResponse, true));
    const actions = store.getActions();

    expect(result).toEqual(mockResponse);
    expect(actions).toEqual([]);
  });

  it("should reject when status is not 200/201 with empty errors object", async () => {
    const mockResponse = {
      status: 500,
      data: {},
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(dispatchError([]));
  });

  it("should handle response_action 'STOP' with missing errors in HARD type", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "STOP",
          response_type: "HARD",
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Something went wrong!",
        errorList: [
          {
            detail:
              "Sorry, we are unable to process your request. Please try again later",
          },
        ],
        error_button: "Ok",
        error_type: "CancelApplication",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });

  it("should reject for response_action 'CORRECT AND RESUBMIT' with no errors", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "CORRECT AND RESUBMIT",
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getRetryStatus(true)
    );
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Please try again !",
        errorList: [
          {
            detail:
              "We have encountered a technical issue. Please try again.",
          },
        ],
        error_button: "Ok",
        error_type: "back",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });

  it("should handle a successful response with response_type 'SOFT'", async () => {
    const mockResponse = {
      status: 201,
      data: {
        application: {
          response_action: "CONTINUE",
          response_type: "SOFT",
        },
      },
    };

    const result = await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();

    expect(result).toEqual(mockResponse);
    expect(actions).toEqual([]);
  });

  it("should reject if response_action is invalid", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {
          response_action: "INVALID_ACTION",
          response_type: "INFO",
        },
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(dispatchError([]));
  });

  it("should handle a missing application in the response", async () => {
    const mockResponse = {
      status: 200,
      data: {},
    };

    const result = await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();

    expect(result).toEqual(mockResponse);
    expect(actions).toEqual([]);
  });

  it("should handle a response without data property", async () => {
    const mockResponse = {
      status: 200,
    };

    const result = await store.dispatch(exceptionCheck(mockResponse));
    const actions = store.getActions();

    expect(result).toEqual(mockResponse);
    expect(actions).toEqual([]);
  });

  it("should reject if response_action is undefined and isExit is true", async () => {
    const mockResponse = {
      status: 200,
      data: {
        application: {},
      },
    };

    try {
      await store.dispatch(exceptionCheck(mockResponse, true));
    } catch (err) {
      expect(err).toBe("Rejected");
    }

    const actions = store.getActions();
    expect(actions).toContainEqual(
      errorAction.getRetryStatus(true)
    );
    expect(actions).toContainEqual(
      errorAction.getExceptionList({
        error_header: "Something went wrong!",
        errorList: {
          errors: [
            {
              detail:
                "Sorry, we are unable to save your application. Please proceed by resuming the application",
            },
          ],
        },
        error_button: "Ok",
        error_type: "cancelResume",
        status: "error",
      })
    );
    expect(actions).toContainEqual(dispatchLoader(false));
  });
});
