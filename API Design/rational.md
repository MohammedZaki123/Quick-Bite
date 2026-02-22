# API Design Rules 
## Client input properties names must comply with attrbiute name in database
## Endpoints are being stored in sections based on their operations to be done when they are called by client
## In error response messages. 
### Be generic with login/auth (authenticaion failed) and server errors (internal_server_error)
### Be Specific in validation errors (invalid email format) and Business Logic Errors (cart is empty or the product in this branch is currently unavailable)

# Challenges
## Which should be the endpoints where client manually sends a request to server and which should be two way real time communication betwwen both parties

- Customer and Delivery should not send a request to server every time he want to check order status (Real time open communication)


# User Regiseration and Authentication
## Restaurant Member register to the system specifying his/her specific restaurant role

# Customer Viewpoint
## Customer does not care about restaurant only data. he wants to know the details of the nearest branch which belongs to restaurant with that specific ID


# Restaurant Staff + RBAC
## Restaurant owner and system admin can add or delete or edit status of any lower member (manager or staff) in the same restaurant regardless of their branch compared to owner's controlling branches
## restaurant member is special case as a system user because it is distinguished to three main roles (owner, staff, manager). so when user is registered to the system as a restaurant member another endpoint must be called alongside it which is POST/restaurants/{restaurantId}/members by restaurant owner 
## Security Concern:
### if restaurant_ID is not stored inside JWT of restaurant members, then for each endpoint request an additinal database opeation is requireed to check that member belongs to specified restaurant. But if restaurant_ID is explicitly invoke innside path parameter then it would be a redundant step. Unless we compare the one stored in JWT and the one stored in path which would spare server another DB call if data is not cached. 
