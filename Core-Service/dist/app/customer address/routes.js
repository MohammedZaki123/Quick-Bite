"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerAddressRouter = void 0;
const express_1 = require("express");
const guard_1 = require("../../lib/auth/guard");
const container_1 = require("../../lib/di/container");
const tokens_1 = require("../../lib/di/tokens");
const idempotency_1 = require("../../lib/idempotency/idempotency");
const api_key_1 = require("../../lib/auth/api-key");
exports.customerAddressRouter = (0, express_1.Router)();
const customerAddressController = container_1.container.resolve(tokens_1.TOKENS.CustomerAddressController);
exports.customerAddressRouter.get('/', guard_1.authenticate, customerAddressController.getCustomerAddresses);
exports.customerAddressRouter.post('/', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), customerAddressController.addCustomerAddress);
// if the following attributes changes the lat and lng must also exist in input to be updated:
// label, country, city, street, building, apartmentNumber
exports.customerAddressRouter.patch('/:id', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), customerAddressController.editCustomerAddress);
exports.customerAddressRouter.delete('/:id', guard_1.authenticate, customerAddressController.deleteCustomerAddress);
exports.customerAddressRouter.get('/internal/:id', api_key_1.requireInternalApiKey, customerAddressController.getById);
