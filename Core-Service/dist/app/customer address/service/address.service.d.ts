import { addCustomerAddressDto, editCustomerAddressesDTO } from "../dto/address.dto";
export declare class CustomerAddressService {
    getCustomerAddresses: (userId: number) => Promise<{
        id: any;
        label: any;
        country: any;
        city: any;
        street: any;
        building: any;
        apartmentNumber: any;
        type: any;
        lat: any;
        lng: any;
        isDefault: any;
    }[]>;
    getById: (id: number) => Promise<{
        id: number;
        userId: number;
        label: string;
        country: string;
        city: string;
        street: string;
        building: string | null;
        apartmentNumber: string | null;
        lat: number;
        lng: number;
    }>;
    addCustomerAddress: (userId: number, data: addCustomerAddressDto) => Promise<{
        id: any;
        label: any;
        country: any;
        city: any;
        street: any;
        building: any;
        apartmentNumber: any;
        type: any;
        lat: any;
        lng: any;
        isDefault: any;
    }>;
    updateCustomerAddress: (userId: number, addressId: number, data: editCustomerAddressesDTO) => Promise<{
        id: any;
        label: any;
        country: any;
        city: any;
        street: any;
        building: any;
        apartmentNumber: any;
        type: any;
        lat: any;
        lng: any;
        isDefault: any;
    }>;
    deleteCustomerAddress: (userId: number, addressId: number) => Promise<void>;
}
