import {CreateRestaurantDTO, PatchRestaurantDTO, PatchRestaurantStatusDTO} from "../dto/restaurant.dto";
import {SystemRole} from "../../user/enums";
import {RestaurantDoesNotExist} from "../errors";
import {
    createRestaurant,
    getAllRestaurants,
    findRestaurantById,
    updatedRestaurantStatus,
    updateRestaurant
} from "../repository/restaurant.repo";
import {Restaurant} from "../entity/restaurant.entity";
import {RegisterRestaurantDTO} from "../../auth/dto/auth.dto";
import {RestaurantStatus} from "../enum";
// import {Transaction} from "knex";
import {Knex} from "knex";
import {NotAuthorized} from "../../../lib/auth/errors";
import {findUserExistsByEmailOrPhone} from "../../user/repository/user.repo";
import {UserAlreadyExistsError} from "../../auth/error";
import {db} from "../../../lib/knex/knex";
import {inject, injectable} from "tsyringe";
import {buildPaginationResult, FilterParams, PaginationParams} from "../../../lib/http/pagination/cursor-pagination";
import {TOKENS} from "../../../lib/di/tokens";
import {CreateUserData, UserService} from "../../user/service/user.service";
import {MemberService} from "../../rbac/service/member.service";
import {insertOutboxEvent} from "../../../lib/events/outbox.repo";
import {EVENT_TYPES} from "../../../lib/events/event-types";

@injectable()
export class RestaurantService {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService,
                @inject(TOKENS.MemberService)  private readonly memberService: MemberService) {
    }
    // TODO: the business logic of registering user should be implemented only in auth module service layer and be called by restaurant service layer
    // TODO: the business logic of creating a restaurant should be implemented only in restaurant module service layer and be called by auth service layer
    createWithOwner = async (userRole: SystemRole, data: CreateRestaurantDTO) => {
        if(userRole !== SystemRole.SYSTEM_ADMIN){
            throw NotAuthorized;
        }
        if(await findUserExistsByEmailOrPhone(data.owner.email,data.owner.phone)){
            throw UserAlreadyExistsError;
        }

        const trx = await db.transaction();
        const now =  new Date();
        const userData: CreateUserData = {
            email : data.owner.email,
            phone: data.owner.phone,
            name: data.owner.name,
            password: data.owner.password,
            role: SystemRole.RESTAURANT_USER,
        }
        try {
            const user = await this.userService.create(userData,trx)

            const restaurant = await createRestaurant(new Restaurant({
                ownerId: user.id,
                name: data.name,
                logoURL: data.logoURL ?? "",
                primaryCountry: data.primaryCountry,
                status: RestaurantStatus.PENDING,
                createdAt: now,
                updatedAt: now,
                statusUpdatedAt: now,
            }), trx);

            const member = await this.memberService.createOwner(restaurant.id, user.id, trx);

            await trx.commit();

            return {
                restaurant,
                owner: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    systemRole: user.systemRole,
                },
            };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    createRestaurant = async (userId: number, data: RegisterRestaurantDTO, trx: Knex)=>{
//  call createRestaurant function of repository layer
//   return restaurant object except createdAt and updatedAt
//    checking role should be in controller layer or middleware
        const now = new Date();
        const restaurant = await createRestaurant(new Restaurant({
            ownerId: userId,
            name: data.name,
            primaryCountry: data.primaryCountry,
            logoURL: data.logoURL,
            status: RestaurantStatus.PENDING,
            createdAt: now,
            updatedAt: now,
            statusUpdatedAt: now
        }), trx);

        return restaurant;
}
    getAllRestaurants = async (params: PaginationParams, filters: FilterParams[]) => {
        const restaurants = await getAllRestaurants(params,filters);
        return buildPaginationResult(restaurants,params.limit, params.sortBy);
    }
   // getRestaurants = async (data: GetRestaurantsQueryDTO) => {
   // // call branch module service layer to get restaurant IDs of branches giving lat and lng values
   //     //   NOTE: DO NOT CALL getRestaurantById function based on length of list to avoid n + 1 problem
   //     // check if list returned from branch service layer is not empty
   //     // call repository layer getRestaurants and give returned IDs in a list
   // // store result in a list of type restaurants and return to controller all attributes except createdAt updatedAt and status
   //     const IDs = await branchService.findNearBy(data.lat,data.lng);
   //     if(IDs.length === 0){
   //         return [];
   //     }
   //     const restaurants = await getRestaurants(IDs);
   //
   //     return this.filterRestaurants(restaurants);
   //
   // }

   getRestaurant = async (addressID: number) => {
        const restaurant = await findRestaurantById(addressID);

        if(!restaurant){
            throw RestaurantDoesNotExist
        }
        return {
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
            primaryCountry: restaurant.primaryCountry,
        }
   }

   editRestaurant = async (restaurantID: number,userId: number, role: SystemRole, data: PatchRestaurantDTO) => {
   //     if user role is not System Admin and restaurant owner id is not equal to userId input variable
   //     throw unauthorized error
   //      service layer does not care about properties to be updated
   //     this was handled in DTO structural validation logic
   //     call update restaurant of repo layer
       const result = await findRestaurantById(restaurantID);

       if(!result){
           throw RestaurantDoesNotExist
       }

       if(role !== SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(result.ownerId)){
           throw NotAuthorized;
       }

       const restaurant = await updateRestaurant(restaurantID, data);

       return {
           id: restaurant.id,
           name: restaurant.name,
           logoURL: restaurant.logoURL,
           status: restaurant.status,
           primaryCountry: restaurant.primaryCountry,
           updatedAt: restaurant.updatedAt
       }

   }

   editRestaurantStatus = async (restaurantID: number, role: SystemRole,data: PatchRestaurantStatusDTO) => {
   //

       if(role !== SystemRole.SYSTEM_ADMIN){
           throw NotAuthorized
       }

       const res = await findRestaurantById(restaurantID);
       if (!res) {
           throw RestaurantDoesNotExist;
       }

       const trx = await db.transaction();
       try {
           const updated = await updatedRestaurantStatus(restaurantID, data.status, trx);
           if (data.status === "suspended") {
               await insertOutboxEvent(trx, {
                   aggregateType: "restaurants",
                   aggregateId: restaurantID,
                   eventType: EVENT_TYPES.RESTAURANT_SUSPENDED,
                   payload: {restaurantId: restaurantID},
               });
           }
           await trx.commit();
           return updated;
       }catch(err){
              await trx.rollback();
                throw err;
       }
   }

   // private filterRestaurants(restaurants: Restaurant[]){
   //      const filteredRestaurants : Partial<Restaurant> [] = [];
   //
   //      for(let i = 0 ; i < restaurants.length; i++){
   //          filteredRestaurants.push({
   //              id: restaurants[i].id,
   //              name: restaurants[i].name,
   //              status: restaurants[i].status,
   //              primaryCountry: restaurants[i].primaryCountry,
   //          })
   //      }
   //      return filteredRestaurants;
   // }

}
