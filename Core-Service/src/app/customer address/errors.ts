import {AppError} from "../../lib/error/AppError";

export const AddressDoesNotExist = new AppError('Address Not Found', 404);


// 403: Giving an info that resource exist but you cannot access it
// 404: giving info that resource does not exist for this user
// export const cannotAccessAddress = new AppError('Not Found', 404);

export const invalidAddressParameter = new AppError('Invalid customer address ID', 400)


