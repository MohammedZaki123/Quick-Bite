# Bastion seeding

## Install
```bash
sudo dnf install -y postgresql15
printf '[mongodb-org-7.0]\nname=MongoDB\nbaseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/\ngpgcheck=0\nenabled=1\n' | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
sudo dnf install -y mongodb-mongosh
curl -sO https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

## Create files (paste, then Ctrl+O Enter Ctrl+X)
```bash
nano seed-core.sql
nano seed-order.sql
nano seed-analytics.js
```

## Run
```bash
# core
PGPASSWORD='O3ReLp1fURLSIku80cg6' psql "host=core-database.c1qgi6ik6b5l.eu-north-1.rds.amazonaws.com port=5432 user=postgres dbname=quickbite_core sslmode=require" -v ON_ERROR_STOP=1 -f seed-core.sql

# order eg
PGPASSWORD='<x_KeL6[Nu_<~46NpdIj6o2u15h~' psql "host=quickbite-order-eg-database.c1qgi6ik6b5l.eu-north-1.rds.amazonaws.com port=5432 user=postgres dbname=quickbite_order_service sslmode=require" -v ON_ERROR_STOP=1 -v region=eg -v currency=EGP -v rest_start=1 -v rest_end=700 -v n_orders=1000000 -v p_online=50 -f seed-order.sql

# order ksa
PGPASSWORD='123456789' psql "host=quickbite-order-ksa-database.c1qgi6ik6b5l.eu-north-1.rds.amazonaws.com port=5432 user=postgres dbname=quickbite_order_service sslmode=require" -v ON_ERROR_STOP=1 -v region=ksa -v currency=SAR -v rest_start=701 -v rest_end=1000 -v n_orders=400000 -v p_online=0 -f seed-order.sql

# analytics
mongosh "mongodb://quickbite:123456789@docdb-2026-06-09-02-24-30.cluster-c1qgi6ik6b5l.eu-north-1.docdb.amazonaws.com:27017/analytics?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false&authMechanism=SCRAM-SHA-1" seed-analytics.js
```
