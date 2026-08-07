import { shapeIntoMongooseObjectId } from "../libs/config";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { ClientSession, Types } from "mongoose";
import MemberService from "./Member.service";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";

class OrderService {
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly memberService;
    private readonly productModel;

    constructor() {
        this.orderModel = OrderModel;
        this.orderItemModel = OrderItemModel;
        this.memberService = new MemberService();
        this.productModel = ProductModel;
    }

    public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
       const memberId = shapeIntoMongooseObjectId(member._id);
       if (!Array.isArray(input) || input.length === 0) {
           throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
       }

       const quantities = new Map<string, number>();
       for (const item of input) {
           if (!Types.ObjectId.isValid(item.productId) || !Number.isInteger(item.itemQuantity) || item.itemQuantity <= 0) {
               throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
           }
           const productId = String(item.productId);
           quantities.set(productId, (quantities.get(productId) ?? 0) + item.itemQuantity);
       }

       const productIds = [...quantities.keys()].map((id) => new Types.ObjectId(id));
       const products = await this.productModel.find({
           _id: { $in: productIds },
           productStatus: ProductStatus.PROCESS,
       }).exec();
       if (products.length !== productIds.length) {
           throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
       }

       const productsById = new Map(products.map((product) => [String(product._id), product]));
       let amount = 0;
       for (const [productId, quantity] of quantities) {
           const product = productsById.get(productId);
           if (!product || product.productLeftCount < quantity) {
               throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
           }
           amount += product.productPrice * quantity;
       }
       const delivery = amount < 100 ? 5 : 0;
       const session = await this.orderModel.db.startSession();

       try {
        let newOrder: Order | undefined;
        await session.withTransaction(async () => {
            for (const [productId, quantity] of quantities) {
                const updatedProduct = await this.productModel.findOneAndUpdate(
                    { _id: productId, productStatus: ProductStatus.PROCESS, productLeftCount: { $gte: quantity } },
                    { $inc: { productLeftCount: -quantity } },
                    { new: true, session }
                ).exec();
                if (!updatedProduct) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
            }

            const createdOrders = await this.orderModel.create([{
                orderTotal: amount + delivery,
                orderDelivery: delivery,
                memberId,
            }], { session });
            newOrder = createdOrders[0];
            await this.recordOrderItem(newOrder._id, input, productsById, session);
        });

        if (!newOrder) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        return newOrder;
       } catch(err){
            console.log("Error, model:createOrder:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
       } finally {
            await session.endSession();
       }
    }

    private async recordOrderItem(
        orderId: Types.ObjectId,
        input: OrderItemInput[],
        products: Map<string, { _id: Types.ObjectId; productPrice: number }>,
        session: ClientSession,
    ): Promise<void>{
        const promisedList = input.map(async (item: OrderItemInput) => {
            const productId = shapeIntoMongooseObjectId(item.productId) as Types.ObjectId;
            const product = products.get(String(productId));
            if (!product) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
            await this.orderItemModel.create([{
                orderId,
                productId,
                itemQuantity: item.itemQuantity,
                itemPrice: product.productPrice,
            }], { session });
            return "INSERTED";
        });

    
        const orderItemState = await Promise.all(promisedList); // kutib turgan mantiqni ishlatadi
        console.log("orderItemsState:", orderItemState);
    }


    public async getMyOrders(
        member: Member,
        inquiry: OrderInquiry
    ): Promise<Order[]> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const matches = { memberId: memberId, orderStatus: inquiry.orderStatus};

        const result = await this.orderModel.aggregate([
            { $match: matches},
            { $sort: { updatedAt: -1}},
            { $skip: (inquiry.page -1)* inquiry.limit},
            { $limit: inquiry.limit},
            {
                $lookup: {
                    from: "orderItems",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "orderItems",
                },
            },
            {
                $lookup:{
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            }
        ])
        .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);


        return result;
    }


    public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
        const memberId = shapeIntoMongooseObjectId(member._id),
              orderId = shapeIntoMongooseObjectId(input.orderId),
              orderStatus = input.orderStatus;

        
        const result = await this.orderModel
          .findOneAndUpdate(
            {
                memberId: memberId,
                _id: orderId,
            },
            { orderStatus: orderStatus},
            { new: true}
        ).exec();   
        
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        if (orderStatus === OrderStatus.PROCESS) {
            await this.memberService.addUserPoint(member ,1);
        }

        return result;
    }
}

export default OrderService;
