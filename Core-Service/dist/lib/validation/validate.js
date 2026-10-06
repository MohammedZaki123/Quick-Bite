"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidLongitude = exports.IsValidLatitude = void 0;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validatePathParameter = validatePathParameter;
const class_validator_1 = require("class-validator");
const AppError_1 = require("../error/AppError");
const class_transformer_1 = require("class-transformer");
async function validateBody(cls, body) {
    // const register = new DTO(body)
    // Mapping the request body to the DTO class instance to use the class-validator decorators for structural validation
    // which can be used across all modules and their endpoints
    // const instance = Object.assign(new cls(), body);
    const instance = (0, class_transformer_1.plainToInstance)(cls, body);
    const errors = await (0, class_validator_1.validate)(instance, { whitelist: true });
    if (errors.length > 0) {
        console.log(errors[0].children);
        console.log(errors.length);
        const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
        throw new AppError_1.AppError(messages.join('\n'), 400);
    }
    // a filtered and clean instance of the DTO class with only the properties defined in the class and
    // validated according to the decorators is returned
    return instance;
}
async function validateQuery(cls, query) {
    const instance = (0, class_transformer_1.plainToInstance)(cls, query, {
        enableImplicitConversion: true
    });
    const errors = await (0, class_validator_1.validate)(instance, {
        whitelist: true,
        forbidNonWhitelisted: true
    });
    if (errors.length > 0) {
        const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
        throw new AppError_1.AppError(messages.join(', \n'), 400);
    }
    return instance;
}
/**
 * Validates a path parameter is a valid positive integer.
 *
 * This function should be used to validate all ID parameters from the URL path.
 * Examples: /addresses/:id, /restaurants/:id, /orders/:id
 *
 * @param paramValue - The path parameter value (typically from req.params)
 * @param paramName - The name of the parameter for error messages (e.g., "Address ID", "Restaurant ID")
 * @returns The validated number as a positive integer
 * @throws AppError with status 400 if validation fails
 *
 * @example
 * ```typescript
 * // In controller
 * const addressId = validatePathParameter(req.params.id, "Address ID");
 * // addressId is guaranteed to be a positive integer or error is thrown
 * ```
 */
function validatePathParameter(paramValue, paramName = "ID") {
    // Check if parameter exists
    if (!paramValue) {
        throw new AppError_1.AppError(`${paramName} is required`, 400);
    }
    // Convert to number
    const numValue = Number(paramValue);
    // Check if conversion was successful (not NaN)
    if (isNaN(numValue)) {
        throw new AppError_1.AppError(`${paramName} must be a valid number`, 400);
    }
    // Check if it's a positive integer
    if (!Number.isInteger(numValue) || numValue <= 0) {
        throw new AppError_1.AppError(`${paramName} must be a positive integer`, 400);
    }
    return numValue;
}
/**
 * Custom validator for latitude: must be a decimal string with up to 7 decimal places and within -90 to 90
 */
let IsValidLatitude = class IsValidLatitude {
    validate(value) {
        if (value === undefined || value === null) {
            return true; // Let @IsOptional handle this
        }
        // Convert to string if it's a number
        const stringValue = String(value);
        // Check if it's a valid decimal format
        const decimalRegex = /^-?\d{1,2}(\.\d{1,7})?$/;
        if (!decimalRegex.test(stringValue)) {
            return false;
        }
        // Check if value is within -90 to 90
        const numValue = parseFloat(stringValue);
        return !isNaN(numValue) && numValue >= -90 && numValue <= 90;
    }
    defaultMessage() {
        return 'latitude must be a decimal number between -90 and 90 with up to 7 decimal places';
    }
};
exports.IsValidLatitude = IsValidLatitude;
exports.IsValidLatitude = IsValidLatitude = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidLatitude', async: false })
], IsValidLatitude);
/**
 * Custom validator for longitude: must be a decimal string with up to 7 decimal places and within -180 to 180
 */
let IsValidLongitude = class IsValidLongitude {
    validate(value) {
        if (value === undefined || value === null) {
            return true; // Let @IsOptional handle this
        }
        // Convert to string if it's a number
        const stringValue = String(value);
        // Check if it's a valid decimal format
        const decimalRegex = /^-?\d{1,3}(\.\d{1,7})?$/;
        if (!decimalRegex.test(stringValue)) {
            return false;
        }
        // Check if value is within -180 to 180
        const numValue = parseFloat(stringValue);
        return !isNaN(numValue) && numValue >= -180 && numValue <= 180;
    }
    defaultMessage() {
        return 'longitude must be a decimal number between -180 and 180 with up to 7 decimal places';
    }
};
exports.IsValidLongitude = IsValidLongitude;
exports.IsValidLongitude = IsValidLongitude = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidLongitude', async: false })
], IsValidLongitude);
