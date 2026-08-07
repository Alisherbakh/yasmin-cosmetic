import { shapeIntoMongooseObjectId } from "../libs/config";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";


// Class
class MemberService {    
    private readonly memberModel;


    constructor() {
        this.memberModel = MemberModel;
    }
    /* ====== SPA ======*/

    public async getStore(): Promise<Member> {
        const result = await this.memberModel
         .findOne({ memberType: MemberType.STORE})
         .lean()
         .exec();
        
         if (!result) throw new Errors(HttpCode.OK, Message.NO_DATA_FOUND);

         return result;
    }



    public async signup(input: MemberInput): Promise<Member> {
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);


        try {
            const result = await this.memberModel.create(input)
            // const tempResult = new this.memberModel(input);
            // const result = await tempResult.save();
            result.memberPassword = "";
            return result.toObject() as Member;
        } catch (err) {
            console.error("Error, model: signup", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }


    }

    public async login(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne(
                { memberNick: input.memberNick , memberStatus: { $ne: MemberStatus.DELETE},//$ne = not eqqual
            },
                { memberNick: 1, memberPassword: 1 , memberStatus: 1}
            )
            .exec();

        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        else if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
        }
        if (!member.memberPassword) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);


        const isMatch = await bcrypt.compare(
            input.memberPassword,
            member.memberPassword
        );
        //const isMatch = input.memberPassword === member.memberPassword;

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.memberModel.findById(member._id).lean().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result as Member;

    }

    
    public async getMemberDetail(member: Member): Promise<Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
         .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE})
         .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        
     return result;


    }
    

    public async updateMember(
        member: Member, 
        input: MemberUpdateInput
    ): Promise<Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
         .findOneAndUpdate({_id: memberId}, // FILTER
             input, // UPDATE
             {new: true}) // OPTION
         .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;     
    }
    
    public async getTopUsers(): Promise<Member[]> {
        const result = await this.memberModel.find({
            memberStatus: MemberStatus.ACTIVE,
            memberPoints: { $gte: 1} // greater than 
        }).sort({ memberPoints: -1}) // descending eng kattasidan eng kichigiga qarab saralaydi
        .limit(4) // 4 tadan korsatadi
        .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }
    
     

    public async addUserPoint(member: Member, point: number): Promise<Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);

        const result = await this.memberModel.findOneAndUpdate(
            {
                _id: memberId,
                memberType: MemberType.USER,
                memberStatus: MemberStatus.ACTIVE,
            },
            { $inc: { memberPoints: point }},
            { new: true }
        ).exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return result;
    }





    /* ====== SSR  ======*/
    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel
            .findOne({ memberType: MemberType.STORE })
            .exec();
        if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        console.log("before:", input.memberPassword);
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
        console.log("after:", input.memberPassword);

        try {
            const result = await this.memberModel.create(input)
            // const tempResult = new this.memberModel(input);
            // const result = await tempResult.save();
            result.memberPassword = "";
            return result;
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }


    }

    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne(
                {
                    memberNick: input.memberNick,
                    memberType: MemberType.STORE,
                    memberStatus: MemberStatus.ACTIVE,
                },
                { memberNick: 1, memberPassword: 1 } // Projection
            )
            .exec();

        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        if (!member.memberPassword) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

        const isMatch = await bcrypt.compare(
            input.memberPassword, // frontend dan kirib kelayotgan damir2020
            member.memberPassword // databasedagi password bdfhoiurlhf
        );
        //const isMatch = input.memberPassword === member.memberPassword;
        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        const result = await this.memberModel.findById(member._id).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;

    }

    
    public async getUsers(): Promise<Member[]> {
        const result = await this.memberModel
        .find({memberType: MemberType.USER})
        .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;

    }

    public async updateChosenUser(input: MemberUpdateInput): Promise<Member> {
        input._id = shapeIntoMongooseObjectId(input._id);
        const result = await this.memberModel
        .findByIdAndUpdate({_id: input._id}, input, { new: true})
        .exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;

    }


}


export default MemberService;
