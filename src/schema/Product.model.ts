import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductSkinType, ProductStatus, ProductVolume } from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";

const productSchema = new Schema<Product>(
  {
    
    productStatus: {
        type: String,
        enum: ProductStatus,
        default: ProductStatus.PAUSE,
    },

    productCollection: {
        type: String,
        enum: ProductCollection,
        required: true,
    },

    productName: {
        type: String,
        required: true,
    },

    productPrice: {
        type: Number,
        required: true,
    },

    productLeftCount: {
        type: Number,
        required: true,
    },

    productSkinType: {
        type: String,
        enum: ProductSkinType,
        default: ProductSkinType.ALL,
    },

    productVolume: {
        type: String,
        enum: ProductVolume,
        default: ProductVolume.GRAM_10,
    },

    productDesc: {
        type: String,
    },

    productImages: {
        type: [String],
        default: [],
    },

    productViews: {
        type: Number,
        default: 0,
    },
  },
  { timestamps: true } // updatedAt, createdAt
);

productSchema.index(
    {productName: 1, productSkinType: 1, productVolume: 1 },
    {unique: true});
export default mongoose.model<Product>('Product', productSchema);
