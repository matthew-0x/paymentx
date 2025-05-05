// paymentSchema.ts used to validate payment Api requests
export const paymentSchema = {
  type: "object",
  required: ["amount", "currency"],
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    amount: { type: "number" },
    currency: { type: "string" }
  }
};
