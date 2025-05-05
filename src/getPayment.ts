import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getPayment } from "./repositories/payments";
import { constants as statusCodes } from "http2";
import { ErrorNames } from "./models/errorNames";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const paymentId = event.pathParameters?.id;
  if (!paymentId) {
    return {
      statusCode: statusCodes.HTTP_STATUS_BAD_REQUEST,
      body: JSON.stringify({ error: ErrorNames.PAYMENT_ID_REQUIRED })
    };
  }
  try {
    const payment = await getPayment(paymentId);
    if (!payment) {
      return {
        statusCode: statusCodes.HTTP_STATUS_NOT_FOUND,
        body: JSON.stringify({ error: ErrorNames.PAYMENT_NOT_FOUND })
      };
    }
    return {
      statusCode: statusCodes.HTTP_STATUS_OK,
      body: JSON.stringify(payment)
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      statusCode: statusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: ErrorNames.FAILED_TO_RETRIEVE_PAYMENT })
    };
  }
};
