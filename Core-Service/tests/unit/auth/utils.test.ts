import {hashPassword, comparePassword} from "../../../src/app/auth/utils";

describe("comparePassword", () => {
    it("matches the hash produced by the hash password correctly", async () => {
        const password = "StrongPass";
        const hashedPassword = await hashPassword(password);

        const isMatch = await comparePassword(password, hashedPassword);
        expect(isMatch).toBe(true);
        const isNotMatch = await comparePassword("WrongPass", hashedPassword);
        expect(isNotMatch).toBe(false);
    })
})