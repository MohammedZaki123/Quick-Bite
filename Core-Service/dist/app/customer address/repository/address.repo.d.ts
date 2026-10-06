import { CustomerAddress } from "../entity/address.entity";
export declare function findAddressByCustomerID(userId: number, addressId: number): Promise<Boolean>;
export declare function createAddress(address: Partial<CustomerAddress>): Promise<CustomerAddress>;
export declare function getAddressesByUserId(userId: number): Promise<CustomerAddress[]>;
export declare function updateAddress(address: Partial<CustomerAddress>, addressID: number): Promise<CustomerAddress>;
export declare function deleteAddress(addressID: number): Promise<void>;
export declare function clearDefaultByUserId(userId: number): Promise<void>;
export declare function findAddressById(id: number): Promise<CustomerAddress | undefined>;
