"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAddressService = void 0;
const address_repo_1 = require("../repository/address.repo");
const errors_1 = require("../errors");
const tsyringe_1 = require("tsyringe");
function toResponse(address) {
    return {
        id: address.id,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartmentNumber: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
    };
}
let CustomerAddressService = class CustomerAddressService {
    getCustomerAddresses = async (userId) => {
        //     calling getAddressesByUserId to fetch addresses from the database
        //     return every property of user object except userID and created_at
        const addresses = await (0, address_repo_1.getAddressesByUserId)(userId);
        return addresses.map(toResponse);
    };
    getById = async (id) => {
        const address = await (0, address_repo_1.findAddressById)(id);
        if (!address)
            throw errors_1.AddressDoesNotExist;
        return {
            id: address.id,
            userId: address.userId,
            label: address.label,
            country: address.country,
            city: address.city,
            street: address.street,
            building: address.building,
            apartmentNumber: address.apartmentNumber,
            lat: address.lat,
            lng: address.lng,
        };
    };
    addCustomerAddress = async (userId, data) => {
        //   calling addCustomerAddress to add new customer address to the database
        if (data.isDefault) {
            await (0, address_repo_1.clearDefaultByUserId)(userId);
        }
        const address = await (0, address_repo_1.createAddress)({
            userId: userId,
            ...data
        });
        return toResponse(address);
    };
    updateCustomerAddress = async (userId, addressId, data) => {
        // Check if customer is authorized to access customer address
        const is_exist = await (0, address_repo_1.findAddressByCustomerID)(userId, addressId);
        // If not authorized throw a forbidden error
        if (!is_exist) {
            throw errors_1.AddressDoesNotExist;
        }
        if (data.isDefault) {
            await (0, address_repo_1.clearDefaultByUserId)(userId);
        }
        // Call updateAddress function of repository layer
        const updatedAddress = await (0, address_repo_1.updateAddress)(data, addressId);
        // Return only needed attributes of the returned addresses object
        return toResponse(updatedAddress);
    };
    deleteCustomerAddress = async (userId, addressId) => {
        // Check if customer is authorized to access customer address
        const is_exist = await (0, address_repo_1.findAddressByCustomerID)(userId, addressId);
        // If not authorized throw a forbidden error
        if (!is_exist) {
            throw errors_1.AddressDoesNotExist;
        }
        // Call delete function of repository layer
        await (0, address_repo_1.deleteAddress)(addressId);
    };
};
exports.CustomerAddressService = CustomerAddressService;
exports.CustomerAddressService = CustomerAddressService = __decorate([
    (0, tsyringe_1.injectable)()
], CustomerAddressService);
