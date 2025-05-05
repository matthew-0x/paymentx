import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse, parseInput } from "./lib/apigateway";
import { createPayment } from "./repositories/payments";
import { Payment } from "./models/payment";
import { randomUUID } from "crypto";
import { validatePaymentRequest } from "./paymentRequestValidator";
import { ErrorNames } from "./models/errorNames";
import { ErrorCodes } from "./models/errorCodes";
import { constants as statusCodes } from "http2";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const payment: Payment = parseInput(event.body || "{}") as Payment;
    //json request validation
    const validationErrors = validatePaymentRequest(payment);
    if (validationErrors.length > 0) {
      return buildResponse(ErrorCodes.INVALID_REQUEST, {
        error: ErrorNames.INVALID_REQUEST,
        details: validationErrors
      });
    }
    // Generate payment ID
    const paymentId: string = randomUUID();
    payment.id = paymentId;
    // Create payment in DynamoDB
    await createPayment(payment);
    return buildResponse(statusCodes.HTTP_STATUS_CREATED, { result: payment.id });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return buildResponse(ErrorCodes.INTERNAL_SERVER_ERROR, {
      error: ErrorNames.INTERNAL_SERVER_ERROR,
      details: error.message
    });
  }
};
