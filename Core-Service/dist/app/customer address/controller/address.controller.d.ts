import { Request, Response, NextFunction } from "express";
import { CustomerAddressService } from "../service/address.service";
export declare class CustomerAddressController {
    private readonly customerAddressService;
    constructor(customerAddressService: CustomerAddressService);
    getCustomerAddresses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addCustomerAddress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editCustomerAddress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCustomerAddress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
