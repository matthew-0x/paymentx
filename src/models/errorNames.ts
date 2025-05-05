/*
 * note that these constants can also be referenced in the postman tests if required.
 */
export enum ErrorNames {
  PAYMENT_ID_REQUIRED = "payment id is required",
  PAYMENT_NOT_FOUND = "payment not found",
  FAILED_TO_RETRIEVE_PAYMENT = "failed to retrieve payment",
  REQUEST_VALIDATION_FAILED = "request validation failed",
  INVALID_REQUEST = "invalid request",
  INTERNAL_SERVER_ERROR = "internal server error"
}
