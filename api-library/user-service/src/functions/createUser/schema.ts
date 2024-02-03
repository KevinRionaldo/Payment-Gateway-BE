export default {
  type: "object",
  properties: {
    phone: { type: 'string' },
    email: {type: 'string'}
  },
  required: ['email', 'phone']
} as const;
