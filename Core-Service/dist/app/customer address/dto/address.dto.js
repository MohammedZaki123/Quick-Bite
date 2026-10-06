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
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCustomerAddressesDTO = exports.addCustomerAddressDto = exports.IsRequiredIfLocationFieldExists = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../enums");
/**
 * Custom validator that ensures lat and lng are required if any location-related field is provided
 */
let IsRequiredIfLocationFieldExists = class IsRequiredIfLocationFieldExists {
    validate(value, args) {
        const dto = args.object;
        // Check if any location-related field exists
        const hasLocationField = dto.country !== undefined ||
            dto.city !== undefined ||
            dto.street !== undefined ||
            dto.building !== undefined ||
            dto.apartmentNumber !== undefined;
        // If location field exists, this field (lat or lng) is required
        if (hasLocationField) {
            return value !== undefined && value !== null;
        }
        // Otherwise, it's optional
        return true;
    }
    defaultMessage(args) {
        return `${args.property} is required when updating location-related fields (country, city, street, building, apartmentNumber)`;
    }
};
exports.IsRequiredIfLocationFieldExists = IsRequiredIfLocationFieldExists;
exports.IsRequiredIfLocationFieldExists = IsRequiredIfLocationFieldExists = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isRequiredIfLocationFieldExists', async: false })
], IsRequiredIfLocationFieldExists);
class addCustomerAddressDto {
    label;
    country;
    city;
    street;
    building;
    apartmentNumber;
    type;
    // @Validate(IsValidLatitude)
    lat;
    // @Validate(IsValidLongitude)
    lng;
    isDefault;
}
exports.addCustomerAddressDto = addCustomerAddressDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "building", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "apartmentNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.AddressType),
    __metadata("design:type", String)
], addCustomerAddressDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], addCustomerAddressDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], addCustomerAddressDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], addCustomerAddressDto.prototype, "isDefault", void 0);
class editCustomerAddressesDTO {
    label;
    country;
    city;
    street;
    building;
    apartmentNumber;
    type;
    // @Validate(IsRequiredIfLocationFieldExists)
    // @Validate(IsValidLatitude)
    lat;
    // @Validate(IsRequiredIfLocationFieldExists)
    // @Validate(IsValidLongitude)
    lng;
    isDefault;
}
exports.editCustomerAddressesDTO = editCustomerAddressesDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "building", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "apartmentNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.AddressType),
    __metadata("design:type", String)
], editCustomerAddressesDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], editCustomerAddressesDTO.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], editCustomerAddressesDTO.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], editCustomerAddressesDTO.prototype, "isDefault", void 0);
