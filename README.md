# Quick-Bite 
### A scalable, multi-region food ordering and delivery platform connecting customers, restaurants, delivery agents, and admins, with strong consistency for money and orders, and clear operational ownership.

## Project Properties
### multi-region
### high write orders
### strong cosistent for payments
### Read heavy discovery (List of restaurants menu, price, single menu item)
### Real-time orders
### Real-time tracking status
### real-time location tracking (Out of scope but can be done later)



## System Project Architecture 
### Decisions:
- Core Services in system architecture needs  relational DB over NO SQL even though some modules (Restaurant or Menu) could be eventual consistent without facing major problems
- System is split into services based on the database behavior similarities
- Modules such as restaurant, user, auth, menu are read-heavy
- Modules such as orders, payment are write heavy 
- Later, system user size can grow exponantialy compared to restaurant in this case user and auth must be splitted to another service with another database
- Module such as analytics can tolerate consistency over availability (Join operations rate are low)
- Real time communication between order and customer (web sockets)

### Services:
#### Core Platform

#### Order Service
##### Delivery Feature Logic
###### by Promixity


#### Analytics
- API contract  

### Devops Decisions:
- Horizontal Scaling
- Load Balancing
- Read Replicas according to benchmark-testing results
- Multi Availability Zone Deployment


## DataBase Design Decisions:

### Context: Menu Items can be updated or deleted after orders are placed

Decision: Store item_name and item_price directly in order_item table 

Consequences:
    Historical order data remains accurate
    Data Duplication 
    Must ensure consistency at insert time
### Context: User Entity must only connected to its sub entities (Customer, Restaurant Employee) and each entity to responsible to its own context

Reasoning: 
- God Entity (User which has relationship with every other entity)
- Each sub-entity record has the same permissions. for example all customers can place orders. All delivery agents can deliver an order (delivery and order entities). But, in user entity each record has its own permissions with may differ from each other


### Entity Relationships
#### User Relationships:
- Customer, Restaurant, Delivery Agent all inherit from User entity. (One to One relationship)


#### Customer Relationships:
- Customer can place many orders. (One to Many relationship)
- A customer has on active cart at a time. (One to One relationship)


#### Delivery Agent Relationships:
- A delivery agent can perform many deliveries. (One to Many relationship)
- A delivery agent can have many earnings or none  ( One to Many relationship)

#### Delivery:
- Many deliveries performed by one agent (Many to One relationships)
- A delivery is for exactly one order (Many to One relationships)

#### Earning Relationships:
- An earning record belongs to one delivery agent. (Many to One relationship)

#### Order Relationships:
-  An order contains many order items (One to many)
- An order has many status change records (Order_Status_History entity) (One to many) (NOT PERMANENT)
- An order has exactly one payment record (One to One)
- An order may have one delivery assignment (One to One)
- An order may create balance transactions (One to many)

#### Menu_Item Relationships:
- A menu item appears in many order items (One to many)
- A menu item belongs to exactly one restaurant (Many to one)
- A menu item can belong to many cart_item (one to many)
- 

#### Admin Relationships:
- admin can process many payouts (One to many relationships)
- 

#### Restaurant Member Relationships:
- A restaurant member can only work at one restaurant at a time. (many to one relationship)
- A member must only assign to one role at a time (One to one relationship OR many to one).


#### Restaurant Relationships:
- A restaurant has many custom roles (Not compliant to PRD)
- A restaurant has many menu items (One to many relationship)
- A restaurant receives many orders (One to many relationship)
-  A restaurant receives many payouts (One to many relationships) (NOT PERMANENT)
- restaurant can be linked to many carts (One to many relationship)


#### Cart:
- cart belongs to exactly one customer (many to one relationship)
- A cart can have many cart items (One to many relationship)
- cart locked to exactly one restaurant (many to one relationship)


#### Cart_Item:
- cart_item can only belong to one cart (Many to one relationship)
- A cart_item references exactly one menu item (Many to one relationship)

#### Role:
-  A role can have many restaurant members assigned to it. (one to many relationship).
- A role has many permissions (one to many)

#### Permission:
- A permission can be granted to many roles (one to many)

#### ROLE_PERMISSION (Many to Many Entity)
- Permission and role entity joins together in this entity

#### Payment: 
- A payment is associated with exactly one order (One to one relationship)

#### Payment Transaction:
- A payment transaction is associated with exactly one payment (One to one relationship)

#### Payout:
- A payout is processed by exactly one admin (Many to one relationship)

## Order Processing Lifecycle

### Entities used and their api endpoints
- Customer: calling POST /orders endpoint, choose payment method (cash or online payment).  Use cart_item youtube 
- Order: order instance inserted into database with status set into pending. Inserting order_items   
- Payment
- payment transaction
- restaurant 
- restaurant staff
- restaurant manager
- delivery agent
### 
