import {Router} from "express";
import {CustomerAddressController} from "./controller/address.controller";
import {authenticate} from "../../lib/auth/guard";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {idempotency} from "../../lib/idempotency/idempotency";
import {requireInternalApiKey} from "../../lib/auth/api-key";

export const customerAddressRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);

customerAddressRouter.get('/', authenticate, customerAddressController.getCustomerAddresses);
customerAddressRouter.post('/', authenticate, idempotency({strict: false}), customerAddressController.addCustomerAddress);

// if the following attributes changes the lat and lng must also exist in input to be updated:
// label, country, city, street, building, apartmentNumber
customerAddressRouter.patch('/:id', authenticate, idempotency({strict: false}), customerAddressController.editCustomerAddress);
customerAddressRouter.delete('/:id', authenticate, customerAddressController.deleteCustomerAddress);

customerAddressRouter.get('/internal/:id', requireInternalApiKey, customerAddressController.getById);



