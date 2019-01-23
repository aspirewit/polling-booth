# Polling Booth

## Preconditions
1. MySQL
2. Redis

## How to run?

### 1. Create database

### 2. Setting environment variables
```shell
export POLLING_BOOTH_DATABASE_HOST='<database host>'            # 127.0.0.1
export POLLING_BOOTH_DATABASE_NAME='<database name>'            # polling_booth_development
export POLLING_BOOTH_DATABASE_USERNAME='<database username>'    # root
export POLLING_BOOTH_DATABASE_PASSWORD='<database password>'    # root
```

### 3. Setting configurations
```shell
cp config/settings.js.example config/settings.js
```

**NOTE:** This `settings.js` file is a example and need to be adjusted according to the actual situation.

### 4. Other steps
```shell
npm install         # Install dependencies
npm run migrate:up  # Execute database migration
```

### 5. Start
```shell
npm run debug
```

You can visit [http://localhost:3000/swagger](http://localhost:3000/swagger) to view the API document.

## Admin user
Email: admin@example.com  
Password: abcd1234

## Docs
1. API - [http://localhost:3000/swagger](http://localhost:3000/swagger)

## TODO
1. Testcase
2. Dockerizing
