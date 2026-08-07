import dotenv from "dotenv";
import mongoose from "mongoose";
import ProductModel from "./schema/Product.model";
import {
  ProductCollection,
  ProductSkinType,
  ProductStatus,
  ProductVolume,
} from "./libs/enums/product.enum";

dotenv.config();

const cosmetics = [
  {
    productName: "Hydrating Facial Serum",
    productPrice: 28,
    productLeftCount: 30,
    productSkinType: ProductSkinType.DRY,
    productVolume: ProductVolume.ML_30,
    productDesc: "Lightweight hyaluronic acid serum for daily hydration.",
    productImages: [],
    productViews: 25,
  },
  {
    productName: "Velvet Matte Lipstick",
    productPrice: 19,
    productLeftCount: 24,
    productSkinType: ProductSkinType.ALL,
    productVolume: ProductVolume.GRAM_10,
    productDesc: "Comfortable, richly pigmented lipstick with a soft matte finish.",
    productImages: [],
    productViews: 18,
  },
  {
    productName: "Balancing Toner",
    productPrice: 22,
    productLeftCount: 20,
    productSkinType: ProductSkinType.COMBINATION,
    productVolume: ProductVolume.ML_200,
    productDesc: "Gentle daily toner that refreshes and balances combination skin.",
    productImages: [],
    productViews: 12,
  },
  {
    productName: "Eau de Parfum",
    productPrice: 46,
    productLeftCount: 16,
    productSkinType: ProductSkinType.ALL,
    productVolume: ProductVolume.ML_100,
    productDesc: "A warm floral fragrance with notes of jasmine and amber.",
    productImages: [],
    productViews: 10,
  },
];

async function seedProducts() {
  await mongoose.connect(process.env.MONGO_URL as string);

  const activeCosmeticCount = await ProductModel.countDocuments({
    productCollection: ProductCollection.SKINCARE,
    productStatus: ProductStatus.PROCESS,
  });

  if (activeCosmeticCount === 0) {
    await ProductModel.insertMany(
      cosmetics.map((cosmetic) => ({
        ...cosmetic,
        productCollection: ProductCollection.SKINCARE,
        productStatus: ProductStatus.PROCESS,
      })),
    );
    console.info(`Seeded ${cosmetics.length} active cosmetics products.`);
  } else {
    console.info(`${activeCosmeticCount} active skincare products already exist.`);
  }
}

seedProducts()
  .catch((error) => {
    console.error("Product seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
