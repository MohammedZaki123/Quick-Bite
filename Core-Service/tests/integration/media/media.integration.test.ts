import "reflect-metadata";
import request from "supertest";
import {storageStub} from "../../helpers/storage-stub";
import {truncateAll} from "../../helpers/db";

// Mock storage and email providers
jest.mock("../../../src/lib/storage/init", () => ({
    storageProvider: storageStub,
}));

import {createApp} from "../../../src/app";
import {db} from "../../../src/lib/knex/knex";
import {hashPassword, createAccessToken} from "../../../src/app/auth/utils";
import {SystemRole} from "../../../src/app/user/enums";
import {MediaStatus} from "../../../src/app/media/enums";

const app = createApp();

describe("Media Module Endpoints", () => {
    let adminToken: string;
    let restaurantUserToken: string;
    let otherRestaurantUserToken: string;
    let customerToken: string;
    let adminUserId: number;
    let restaurantUserId: number;
    let restaurantId: number;

    beforeEach(async () => {
        await truncateAll();
        storageStub.reset();

        const now = new Date();

        // 1. Create Admin User
        const [admin] = await db("users").insert({
            email: "admin@quickbite.com",
            phone: "01000000001",
            name: "Admin User",
            password_hash: await hashPassword("AdminPass123!"),
            system_role: SystemRole.SYSTEM_ADMIN,
            created_at: now,
            updated_at: now,
        }).returning(["id", "email", "system_role"]);
        adminUserId = Number(admin.id);
        adminToken = createAccessToken({
            userId: adminUserId,
            email: admin.email,
            role: SystemRole.SYSTEM_ADMIN,
        });

        // 2. Create Restaurant Owner / User
        const [restUser] = await db("users").insert({
            email: "owner@quickbite.com",
            phone: "01000000002",
            name: "Restaurant Owner",
            password_hash: await hashPassword("OwnerPass123!"),
            system_role: SystemRole.RESTAURANT_USER,
            created_at: now,
            updated_at: now,
        }).returning(["id", "email", "system_role"]);
        restaurantUserId = Number(restUser.id);

        // 3. Create Restaurant with ID 1
        const [rest] = await db("restaurants").insert({
            id: 1,
            owner_id: restaurantUserId,
            name: "Burger King Dokki",
            status: "active",
            created_at: now,
            updated_at: now,
            status_updated_at: now,
            logo_url: "https://example.com/logo.png",
            primary_country: "EG",
        }).returning(["id"]);
        restaurantId = Number(rest.id);

        // Token for restaurant user belonging to restaurant 1
        restaurantUserToken = createAccessToken({
            userId: restaurantUserId,
            email: restUser.email,
            role: SystemRole.RESTAURANT_USER,
            restaurantId: restaurantId,
        });

        // Token for restaurant user belonging to restaurant 2 (different restaurant)
        otherRestaurantUserToken = createAccessToken({
            userId: 999,
            email: "other@quickbite.com",
            role: SystemRole.RESTAURANT_USER,
            restaurantId: 2,
        });

        // 4. Create Customer User
        const [cust] = await db("users").insert({
            email: "customer@quickbite.com",
            phone: "01000000003",
            name: "Customer User",
            password_hash: await hashPassword("CustomerPass123!"),
            system_role: SystemRole.CUSTOMER,
            created_at: now,
            updated_at: now,
        }).returning(["id", "email", "system_role"]);
        customerToken = createAccessToken({
            userId: Number(cust.id),
            email: cust.email,
            role: SystemRole.CUSTOMER,
        });
    });

    describe("POST /api/media/upload-url", () => {
        const dummyInput = {
            fileName: "burger-menu.png",
            contentType: "image/png",
            restaurantId: 1,
        };

        it("allows System Admin to create an upload url with restaurantId = 1", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${adminToken}`])
                .send(dummyInput);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("mediaId");
            expect(res.body.data).toHaveProperty("uploadUrl");
            expect(res.body.data).toHaveProperty("mediaUrl");
            expect(res.body.data.uploadUrl).toContain("restaurants/1/");
            expect(res.body.data.uploadUrl).toContain("burger-menu.png");

            // Verify database row
            const mediaRow = await db("media").where("id", res.body.data.mediaId).first();
            expect(mediaRow).toBeDefined();
            expect(Number(mediaRow.restaurant_id)).toBe(1);
            expect(Number(mediaRow.uploaded_by)).toBe(adminUserId);
            expect(mediaRow.status).toBe(MediaStatus.PENDING);
        });

        it("allows Restaurant User to create an upload url for their restaurant (restaurantId = 1)", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${restaurantUserToken}`])
                .send(dummyInput);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("mediaId");
            expect(res.body.data.uploadUrl).toContain("restaurants/1/");

            const mediaRow = await db("media").where("id", res.body.data.mediaId).first();
            expect(mediaRow).toBeDefined();
            expect(Number(mediaRow.restaurant_id)).toBe(1);
            expect(Number(mediaRow.uploaded_by)).toBe(restaurantUserId);
            expect(mediaRow.status).toBe(MediaStatus.PENDING);
        });

        it("rejects Restaurant User trying to upload for a different restaurant", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${otherRestaurantUserToken}`])
                .send(dummyInput); // dummyInput has restaurantId = 1, but user belongs to restaurant 2

            expect(res.status).toBe(403);
        });

        it("rejects Customer role", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${customerToken}`])
                .send(dummyInput);

            expect(res.status).toBe(403);
        });

        it("rejects unauthenticated requests", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .send(dummyInput);

            expect(res.status).toBe(401);
        });

        it("rejects invalid content-type not in allowed list", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${adminToken}`])
                .send({
                    fileName: "document.pdf",
                    contentType: "application/pdf",
                    restaurantId: 1,
                });

            expect(res.status).toBe(400);
        });

        it("returns 404 if specified restaurantId does not exist (for admin)", async () => {
            const res = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${adminToken}`])
                .send({
                    fileName: "photo.jpg",
                    contentType: "image/jpeg",
                    restaurantId: 999999,
                });

            expect(res.status).toBe(404);
        });
    });

    describe("POST /api/media/:id/confirm", () => {
        let createdMediaId: number;

        beforeEach(async () => {
            // Create a pending media entry
            const uploadRes = await request(app)
                .post("/api/media/upload-url")
                .set("Cookie", [`access_token=${restaurantUserToken}`])
                .send({
                    fileName: "burger-menu.png",
                    contentType: "image/png",
                    restaurantId: 1,
                });

            createdMediaId = uploadRes.body.data.mediaId;
        });

        it("allows uploader to confirm the upload", async () => {
            const res = await request(app)
                .post(`/api/media/${createdMediaId}/confirm`)
                .set("Cookie", [`access_token=${restaurantUserToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.media.status).toBe(MediaStatus.UPLOADED);

            // Verify db updated
            const row = await db("media").where("id", createdMediaId).first();
            expect(row.status).toBe(MediaStatus.UPLOADED);
        });

        it("is idempotent when confirming already uploaded media", async () => {
            // Confirm first time
            await request(app)
                .post(`/api/media/${createdMediaId}/confirm`)
                .set("Cookie", [`access_token=${restaurantUserToken}`]);

            // Confirm second time
            const res = await request(app)
                .post(`/api/media/${createdMediaId}/confirm`)
                .set("Cookie", [`access_token=${restaurantUserToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.media.status).toBe(MediaStatus.UPLOADED);
        });

        it("allows System Admin to confirm an upload created by another user", async () => {
            const res = await request(app)
                .post(`/api/media/${createdMediaId}/confirm`)
                .set("Cookie", [`access_token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.data.media.status).toBe(MediaStatus.UPLOADED);
        });

        it("rejects non-owner, non-admin users from confirming", async () => {
            const res = await request(app)
                .post(`/api/media/${createdMediaId}/confirm`)
                .set("Cookie", [`access_token=${otherRestaurantUserToken}`]);

            expect(res.status).toBe(403);
        });

        it("returns 404 for non-existent media id", async () => {
            const res = await request(app)
                .post("/api/media/888888/confirm")
                .set("Cookie", [`access_token=${adminToken}`]);

            expect(res.status).toBe(404);
        });

        it("returns 400 for invalid media id path parameter", async () => {
            const res = await request(app)
                .post("/api/media/invalid-id/confirm")
                .set("Cookie", [`access_token=${adminToken}`]);

            expect(res.status).toBe(400);
        });
    });
});
