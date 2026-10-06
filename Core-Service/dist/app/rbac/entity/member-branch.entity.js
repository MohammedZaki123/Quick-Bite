"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberBranch = void 0;
class MemberBranch {
    memberId;
    branchId;
    createdAt;
    constructor(data) {
        this.memberId = data.memberId;
        this.branchId = data.branchId;
        this.createdAt = data.createdAt ?? new Date();
    }
}
exports.MemberBranch = MemberBranch;
