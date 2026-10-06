import { Request, Response , NextFunction} from "express";
import {CustomerAddressService} from "../service/address.service";
import {validateBody, validatePathParameter} from "../../../lib/validation/validate";
import {addCustomerAddressDto, editCustomerAddressesDTO} from "../dto/address.dto";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess} from "../../../lib/http/response";

@injectable()
export class CustomerAddressController {
    constructor(@inject(TOKENS.CustomerAddressService) private readonly customerAddressService: CustomerAddressService) {

    }
    getCustomerAddresses = async (req: Request, res: Response, next: NextFunction) => {
    //     use authenticate layer to get userID from the token stored in cookie
    //     call service layer customerAddresses function
    //     add function returned data to response and send with 200 status code
        try{
            const userId = req.user?.userId!;
            const addresses = await this.customerAddressService.getCustomerAddresses(userId);
            sendSuccess(res, addresses);
        }catch(error){
            next();
        }
    }

    addCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
        //     use authenticate layer to get userID from the token stored in cookie
        // call validateBody with addCustomerAddressDto to validate request body
        //     call service layer addCustomerAddress function
        try{
            const userId = req.user?.userId!;
            const validatedData = await validateBody(addCustomerAddressDto, req.body);
            const user = await this.customerAddressService.addCustomerAddress(userId, validatedData);
            sendSuccess(res, {
                message: "Address added successfully",
                address: user
            }, 201);
        }catch(error){
            next();
        }
    }

    editCustomerAddress = async (req: Request, res: Response, next: NextFunction)=>{
        try{
            // 1. Extract and validate customer address ID from path parameter
            const addressId = validatePathParameter(req.params.id, "Address ID");

            // 2. Validate request body input and return cleaned data
            const userId = req.user?.userId!;
            const validatedData = await validateBody(editCustomerAddressesDTO, req.body);

            // 3. Call update function of service layer
            const result = await this.customerAddressService.updateCustomerAddress(
                userId,
                addressId,
                validatedData
            );

            // 4. Return response
            sendSuccess(res, {
                message: "Address updated successfully",
                address: result
            });
        }catch(error){
            next(error);
        }
    }

    deleteCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
        try{
            // 1. Extract and validate customer address ID from path parameter
            const addressId = validatePathParameter(req.params.id, "Address ID");

            // 2. Get user ID from authenticated token
            const userId = req.user?.userId!;

            // 3. Call delete function of service layer
            await this.customerAddressService.deleteCustomerAddress(userId, addressId);

            // 4. Return 204 No Content (standard for successful deletion)
            sendSuccess(res, {message : "Address deleted"});
        }catch(error){
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.customerAddressService.getById(Number(req.params.id));
            sendSuccess(res, address);
        } catch (err) {
            next(err);
        }
    }
}


