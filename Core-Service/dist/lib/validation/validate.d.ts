import { ValidatorConstraintInterface } from "class-validator";
export declare function validateBody<T extends Object>(cls: new () => T, body: unknown): Promise<T>;
export declare function validateQuery<T extends object>(cls: new () => T, query: unknown): Promise<T>;
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
export declare function validatePathParameter(paramValue: string | string[], paramName?: string): number;
/**
 * Custom validator for latitude: must be a decimal string with up to 7 decimal places and within -90 to 90
 */
export declare class IsValidLatitude implements ValidatorConstraintInterface {
    validate(value: any): boolean;
    defaultMessage(): string;
}
/**
 * Custom validator for longitude: must be a decimal string with up to 7 decimal places and within -180 to 180
 */
export declare class IsValidLongitude implements ValidatorConstraintInterface {
    validate(value: any): boolean;
    defaultMessage(): string;
}
