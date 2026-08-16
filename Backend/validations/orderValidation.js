const { z } = require("zod");

const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().nonempty({ message: "Restaurant ID is required" }),
    tableNumber: z.number().int().positive({ message: "Valid table number is required" }),
    items: z.array(
      z.object({
        itemId: z.string().nonempty(),
        name: z.string().optional(),
        price: z.number().optional(),
        qty: z.number().int().positive(),
      })
    ).min(1, { message: "Order must contain at least one item" }),
    totalAmount: z.number().optional(),
    note: z.string().optional(),
  })
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().nonempty({ message: "Order ID is required" }),
  }),
  body: z.object({
    status: z.enum(["pending", "approved", "preparing", "ready", "completed", "rejected", "cancelled"]),
  })
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
