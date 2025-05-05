export enum ErrorCodes {
  // ** Error codes with shared ErrorName **
  PAYMENT_NOT_FOUND = 404,
  FAILED_TO_RETRIEVE_PAYMENT = 500,
  INVALID_REQUEST = 422,
  INTERNAL_SERVER_ERROR = 502,
  // ** authorization failed **
  INVALID_CREDENTIAL = 150,
  NO_BASIC_AUTH_HEADER = 151
}
