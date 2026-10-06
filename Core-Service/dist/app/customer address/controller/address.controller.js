"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAddressController = void 0;
const address_service_1 = require("../service/address.service");
const validate_1 = require("../../../lib/validation/validate");
const address_dto_1 = require("../dto/address.dto");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
let CustomerAddressController = class CustomerAddressController {
    customerAddressService;
    constructor(customerAddressService) {
        this.customerAddressService = customerAddressService;
    }
    getCustomerAddresses = async (req, res, next) => {
        //     use authenticate layer to get userID from the token stored in cookie
        //     call service layer customerAddresses function
        //     add function returned data to response and send with 200 status code
        try {
            const userId = req.user?.userId;
            const addresses = await this.customerAddressService.getCustomerAddresses(userId);
            (0, response_1.sendSuccess)(res, addresses);
        }
        catch (error) {
            next();
        }
    };
    addCustomerAddress = async (req, res, next) => {
        //     use authenticate layer to get userID from the token stored in cookie
        // call validateBody with addCustomerAddressDto to validate request body
        //     call service layer addCustomerAddress function
        try {
            const userId = req.user?.userId;
            const validatedData = await (0, validate_1.validateBody)(address_dto_1.addCustomerAddressDto, req.body);
            const user = await this.customerAddressService.addCustomerAddress(userId, validatedData);
            (0, response_1.sendSuccess)(res, {
                message: "Address added successfully",
                address: user
            }, 201);
        }
        catch (error) {
            next();
        }
    };
    editCustomerAddress = async (req, res, next) => {
        try {
            // 1. Extract and validate customer address ID from path parameter
            const addressId = (0, validate_1.validatePathParameter)(req.params.id, "Address ID");
            // 2. Validate request body input and return cleaned data
            const userId = req.user?.userId;
            const validatedData = await (0, validate_1.validateBody)(address_dto_1.editCustomerAddressesDTO, req.body);
            // 3. Call update function of service layer
            const result = await this.customerAddressService.updateCustomerAddress(userId, addressId, validatedData);
            // 4. Return response
            (0, response_1.sendSuccess)(res, {
                message: "Address updated successfully",
                address: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteCustomerAddress = async (req, res, next) => {
        try {
            // 1. Extract and validate customer address ID from path parameter
            const addressId = (0, validate_1.validatePathParameter)(req.params.id, "Address ID");
            // 2. Get user ID from authenticated token
            const userId = req.user?.userId;
            // 3. Call delete function of service layer
            await this.customerAddressService.deleteCustomerAddress(userId, addressId);
            // 4. Return 204 No Content (standard for successful deletion)
            (0, response_1.sendSuccess)(res, { message: "Address deleted" });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const address = await this.customerAddressService.getById(Number(req.params.id));
            (0, response_1.sendSuccess)(res, address);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.CustomerAddressController = CustomerAddressController;
exports.CustomerAddressController = CustomerAddressController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.CustomerAddressService)),
    __metadata("design:paramtypes", [address_service_1.CustomerAddressService])
], CustomerAddressController);
