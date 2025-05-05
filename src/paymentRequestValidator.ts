import { Validator, ValidationError } from "jsonschema";
import { Payment } from "./models/payment";
import { paymentSchema } from "./schemas/paymentSchema";

export const validatePaymentRequest = (payment: Payment) => {
  const validator = new Validator();
  const validationResult = validator.validate(payment, paymentSchema);

  if (!validationResult.valid) {
    // Explicitly typed the errors
    return validationResult.errors.map((error: ValidationError) => {
      const schema = error.schema;

      // Handling cases where schema is a string or an object
      const expectedType = typeof schema === "object" && schema.type ? schema.type : "unknown";
      return {
        field: error.property,
        message: error.message, // Validation error message
        expected: expectedType, // Expected type based on the schema
        received: payment[error.property as keyof Payment] // The received value for that field
      };
    });
  }

  return [];
};
