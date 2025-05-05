import { handler } from "../src/createPayment";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Mock dependencies
jest.mock("crypto", () => ({
  randomUUID: jest.fn()
}));
jest.mock("../src/lib/apigateway", () => ({
  ...jest.requireActual("../src/lib/apigateway"),
  parseInput: jest.fn(),
  buildResponse: jest.fn()
}));
jest.mock("../src/paymentRequestValidator", () => ({
  validatePaymentRequest: jest.fn()
}));
jest.mock("../src/repositories/payments");
import { createPayment } from "../src/repositories/payments";
import { validatePaymentRequest } from "../src/paymentRequestValidator";
import { parseInput, buildResponse } from "../src/lib/apigateway";
import { randomUUID } from "crypto";
import { ErrorNames } from "../src/models/errorNames";
import { ErrorCodes } from "../src/models/errorCodes";
import { error } from "console";

// Mock data
const mockParseInput = parseInput as jest.MockedFunction<typeof parseInput>;
const mockBuildResponse = buildResponse as jest.MockedFunction<typeof buildResponse>;
const mockValidatePaymentRequest = validatePaymentRequest as jest.MockedFunction<typeof validatePaymentRequest>;
const mockCreatePayment = createPayment as jest.MockedFunction<typeof createPayment>;
const mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>;
const mockPaymentId = "1234-1234-1234-1234-1234";
const mockPayment = {
  amount: 100.0,
  currency: "AUD"
};

const mockEvent: APIGatewayProxyEvent = {
  body: JSON.stringify(mockPayment)
} as any;

const mockValidationErrorMessage = {
  field: "id",
  message: "Validation error message",
  expected: "string",
  received: "number"
};

describe("createPayment handler", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should return 201 and payment ID when payment is created successfully", async () => {
    // Setup mocks
    mockParseInput.mockReturnValue(mockPayment);
    mockValidatePaymentRequest.mockReturnValue([]); // No validation errors
    mockCreatePayment.mockResolvedValue(undefined); // Simulate successful payment creation
    mockRandomUUID.mockReturnValue(mockPaymentId);
    mockBuildResponse.mockReturnValue({
      statusCode: 201,
      body: JSON.stringify({ result: mockPaymentId })
    });

    const response: APIGatewayProxyResult = await handler(mockEvent);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ result: mockPaymentId });
    expect(createPayment).toHaveBeenCalledWith(expect.objectContaining(mockPayment));
    expect(buildResponse).toHaveBeenCalledWith(201, { result: mockPaymentId });
  });

  it("should return 422 when there are validation errors", async () => {
    // Setup mocks
    mockParseInput.mockReturnValue(mockPayment);
    mockValidatePaymentRequest.mockReturnValue([mockValidationErrorMessage]); // Simulate validation error
    mockBuildResponse.mockReturnValue({
      statusCode: ErrorCodes.INVALID_REQUEST,
      body: JSON.stringify({
        error: ErrorNames.INVALID_REQUEST,
        details: [mockValidationErrorMessage]
      })
    });

    const response: APIGatewayProxyResult = await handler(mockEvent);

    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body).error).toBe("invalid request");
    expect(JSON.parse(response.body).details).toEqual([mockValidationErrorMessage]);
    expect(createPayment).not.toHaveBeenCalled(); // Ensure createPayment is not called
    expect(mockRandomUUID).not.toHaveBeenCalled(); // Ensure randomUUID is not called
    expect(mockValidatePaymentRequest).toHaveBeenCalledWith(mockPayment);
    expect(mockParseInput).toHaveBeenCalledWith(mockEvent.body);
    expect(buildResponse).toHaveBeenCalledWith(
      ErrorCodes.INVALID_REQUEST,
      expect.objectContaining({ error: ErrorNames.INVALID_REQUEST, details: [mockValidationErrorMessage] })
    );
  });

  it("should handle unexpected errors", async () => {
    // Setup mocks
    mockParseInput.mockReturnValue(mockPayment);
    mockValidatePaymentRequest.mockReturnValue([]); // No validation errors
    mockCreatePayment.mockRejectedValue(new Error("Database error")); // Simulate unexpected error
    mockBuildResponse.mockReturnValue({
      statusCode: 500,
      body: JSON.stringify({
        error: ErrorNames.INTERNAL_SERVER_ERROR,
        details: "Database error"
      })
    });

    const response: APIGatewayProxyResult = await handler(mockEvent);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe(ErrorNames.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(response.body).details).toBe("Database error");
  });
});
