import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { Types } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
    private readonly productModel;
    public viewService;

    constructor() {
        this.productModel = ProductModel;
        this.viewService = new ViewService();
    }

    /* ====== SPA ======*/
    public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
        const match: T = { productStatus: ProductStatus.PROCESS};

        if (inquiry.productCollection)
            match.productCollection = inquiry.productCollection; // selected cosmetics category
        if (inquiry.search) {
            match.productName = { $regex: new RegExp(inquiry.search, "i")};
            // qidiruv mantigi productlarni nomi bilan
        }

      const sort: T = 
       inquiry.order === "productPrice"  // acending va decending
        ? {[inquiry.order]: 1} // arzonidan yuqoriga
        : {[inquiry.order]: -1}; // yangi qoshilgandan qolganiga

      const result = await this.productModel
        .aggregate([
            { $match: match}, // pipeline process da bolgan productni find
            { $sort: sort},   // pipeline. // arzonidan yuqoriga yoki  yangi qoshilgandan qolganiga
            { $skip: (inquiry.page * 1 -1) * inquiry.limit}, // 3   X 1,2,3. // pipeline boshidan productni olib ber 1-pagega
            { $limit: inquiry.limit * 1},                    // 3   => 4,5,6  // pipeline har page da nechta malumot olib berishi
        ])
        .exec();
      if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      return result;
    }

    public async getProduct(
        memberId: Types.ObjectId | null, // login user bolsa id, bolmasa null
        id: string                // product Id 
    ): Promise<Product> {
        const productId = shapeIntoMongooseObjectId(id);

        let result = await this.productModel
        .findOne({
            _id: productId, 
            productStatus: ProductStatus.PROCESS
        })
        .exec();
       
       if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

       
       if (memberId) {
        // Check  Existence
        const input: ViewInput = {
            memberId: memberId,
            viewRefId: productId,
            viewGroup: ViewGroup.PRODUCT
        };
        const existView = await this.viewService.checkViewExistence(input);
        console.log("exist:", !!existView); // true
        if (!existView) {
            // Insert View 
            await this.viewService.insertMemberView(input);

             // Increase Counts
             result = await this.productModel
             .findByIdAndUpdate(
                productId, 
                { $inc: { productViews: +1}},
                { new: true }
            )
            .exec();
        }
       }
       
       if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
       return result;
    }


    /* ====== SSR  ======*/

   public async getAllProducts(): Promise<Product[]> {
        // string => ObjectId
        
        const result = await this.productModel
        .find()
        .exec();

        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

       
        return result;
    }


    
    public async createNewProduct(input: ProductInput): Promise<Product> {
        try {
            return await this.productModel.create(input);
        } catch (err) {
            console.error("Error, model:createNewProduct:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }

    }


    public async updateChosenProduct(id: string,input: ProductUpdateInput): Promise<Product> {
        // string => ObjectId
        id = shapeIntoMongooseObjectId(id);
        const result = await this.productModel
        .findOneAndUpdate({_id: id}, input, { new: true})
        .exec();

        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

       
        return result;
    }

}

export default ProductService;
