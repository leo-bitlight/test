# About

This is a demo project showcasing RGB20 asset trading.

# Building and Running

#### 1. Install dependencies

```
yarn install

# or
# npm install
```

#### 2. Set environment variables

Setting the `DATABASE_URL` in the .env file.

```
# .evn file
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=ey..."
```

#### 3. Init database

```
npx prisma migrate dev --name init
```

#### 4. Build

```
npm run build
```

#### 5. Run

```
npm run dev
```