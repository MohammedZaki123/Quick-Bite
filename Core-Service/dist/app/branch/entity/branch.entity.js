"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
class Branch {
    id;
    restaurantId;
    countryCode;
    addressText;
    label;
    lat;
    lng;
    isActive;
    opensAt;
    closesAt;
    acceptOrders;
    createdAt;
    updatedAt;
    deliveryRadius;
    deliveryFee;
    currency;
    commission; // SMALLINT
    location;
    constructor(data) {
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.lat = data.lat;
        this.lng = data.lng;
        this.countryCode = data.countryCode;
        this.label = data.label;
        this.isActive = data.isActive;
        this.opensAt = data.opensAt;
        this.closesAt = data.closesAt;
        this.addressText = data.addressText;
        this.acceptOrders = data.acceptOrders;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.currency = data.currency;
        this.commission = data.commission ?? 0;
        this.deliveryRadius = data.deliveryRadius ?? 0;
        this.deliveryFee = data.deliveryFee ?? 0;
    }
}
exports.Branch = Branch;
