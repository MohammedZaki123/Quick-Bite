import {
    createAddress, findAddressByCustomerID, getAddressesByUserId, updateAddress, deleteAddress,
    clearDefaultByUserId, findAddressById
} from "../repository/address.repo";
import {addCustomerAddressDto, editCustomerAddressesDTO} from "../dto/address.dto";
import {CustomerAddress} from "../entity/address.entity";

import {AddressDoesNotExist} from "../errors";
import {injectable} from "tsyringe";

function toResponse(address: any) {
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

@injectable()
export class CustomerAddressService {
    getCustomerAddresses = async (userId: number) => {
    //     calling getAddressesByUserId to fetch addresses from the database
    //     return every property of user object except userID and created_at
        const addresses = await getAddressesByUserId(userId);
        return addresses.map(toResponse);
    }

    getById = async (id: number) => {
        const address = await findAddressById(id);
        if (!address) throw AddressDoesNotExist;
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
    }

    addCustomerAddress = async (userId: number, data: addCustomerAddressDto) =>{
    //   calling addCustomerAddress to add new customer address to the database
        if(data.isDefault){
            await clearDefaultByUserId(userId);
        }
        const address = await createAddress({
            userId : userId,
            ...data
        });

        return toResponse(address);
    }
    updateCustomerAddress = async (userId: number, addressId: number ,data: editCustomerAddressesDTO)=>{
        // Check if customer is authorized to access customer address
        const is_exist = await findAddressByCustomerID(userId, addressId);

        // If not authorized throw a forbidden error
        if(!is_exist){
            throw AddressDoesNotExist
        }
        if(data.isDefault){
            await clearDefaultByUserId(userId);
        }

        // Call updateAddress function of repository layer
        const updatedAddress = await updateAddress(data, addressId);

        // Return only needed attributes of the returned addresses object
        return toResponse(updatedAddress);
    }

    deleteCustomerAddress = async (userId: number, addressId: number) => {
        // Check if customer is authorized to access customer address
        const is_exist = await findAddressByCustomerID(userId, addressId);

        // If not authorized throw a forbidden error
        if(!is_exist){
            throw AddressDoesNotExist
        }

        // Call delete function of repository layer
        await deleteAddress(addressId);
    }

}


