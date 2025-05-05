import { APIGatewayProxyResult } from "aws-lambda";

export const buildResponse = (statusCode: number, body: Object): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    }
  };
};

export const parseInput = (body: string): Object => {
  try {
    return JSON.parse(body);
  } catch (err) {
    console.error("Failed to parse input:", err);
    throw new Error("Invalid JSON input"); // Rethrow with a clear error message;
  }
};
