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
exports.PatchBranchStatusDTO = exports.PatchBranchDTO = exports.AddBranchDTO = void 0;
const class_validator_1 = require("class-validator");
const enum_1 = require("../enum");
class AddBranchDTO {
    lat;
    lng;
    countryCode;
    label;
    // i think it needs custom validation specifically to check if it is a valid time
    opensAt;
    // i think it needs custom validation specifically to check if it is a valid time
    closesAt;
    addressText;
    currency;
    deliveryRadius;
}
exports.AddBranchDTO = AddBranchDTO;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddBranchDTO.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddBranchDTO.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsISO31661Alpha2)({ message: 'Invalid country code' }),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "countryCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "opensAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "closesAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "addressText", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enum_1.Currency),
    __metadata("design:type", String)
], AddBranchDTO.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddBranchDTO.prototype, "deliveryRadius", void 0);
// @ValidatorConstraint({ name: 'isRequiredIfLocationFieldExists', async: false })
// export class IsRequiredIfLocationFieldExists implements ValidatorConstraintInterface {
//     validate(value: any, args: ValidationArguments) {
//         const dto = args.object as PatchBranchDTO;
//
//         // Check if any location-related field exists
//         const hasLocationField =
//             dto.countryCode !== undefined ||
//             dto.label !== undefined ||
//             dto.addressText !== undefined ||
//             dto.deliveryRadius !== undefined;
//
//         // If location field exists, this field (lat or lng) is required
//         if (hasLocationField) {
//             return value !== undefined && value !== null;
//         }
//
//         // Otherwise, it's optional
//         return true;
//     }
//
//     defaultMessage(args: ValidationArguments) {
//         return `${args.property} is required when updating location-related fields (country, city, street, building, apartmentNumber)`;
//     }
// }
class PatchBranchDTO {
    // @Validate(IsRequiredIfLocationFieldExists)
    lat;
    // @Validate(IsRequiredIfLocationFieldExists)
    Lng;
    label;
    // i think it needs custom validation specifically to check if it is a valid time
    opensAt;
    // i think it needs custom validation specifically to check if it is a valid time
    closesAt;
    addressText;
    acceptOrders;
    currency;
    deliveryFee;
    deliveryRadius;
}
exports.PatchBranchDTO = PatchBranchDTO;
__decorate([
    (0, class_validator_1.IsOptional)()
    // @Validate(IsValidLatitude)
    ,
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PatchBranchDTO.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
    // @Validate(IsValidLongitude)
    ,
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PatchBranchDTO.prototype, "Lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PatchBranchDTO.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchBranchDTO.prototype, "opensAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchBranchDTO.prototype, "closesAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PatchBranchDTO.prototype, "addressText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatchBranchDTO.prototype, "acceptOrders", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enum_1.Currency),
    __metadata("design:type", String)
], PatchBranchDTO.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PatchBranchDTO.prototype, "deliveryFee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PatchBranchDTO.prototype, "deliveryRadius", void 0);
class PatchBranchStatusDTO {
    isActive;
    commission;
}
exports.PatchBranchStatusDTO = PatchBranchStatusDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatchBranchStatusDTO.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PatchBranchStatusDTO.prototype, "commission", void 0);
// export class PutBranchDTO {
//     @IsInt()
//     deliveryRadius!: number
// }
