import mongoose, { Schema } from "mongoose";
import { OrderItem } from "../libs/types/order";

const orderItemSchema = new Schema<OrderItem>({
    itemQuantity: {
        type: Number,
        required: true,
    },

    itemPrice: {
        type: Number,
        required: true,
    },

    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },

    productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    },
},
{ timestamps: true, collection: "orderItems"}
);

export default mongoose.model<OrderItem>("OrderItem", orderItemSchema);
