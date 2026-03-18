export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER ?? 'auth_user',
    password: process.env.POSTGRES_PASSWORD ?? '',
    db: process.env.POSTGRES_DB ?? 'auth_db',
  },
  mongo: {
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/ecommerce',
  },
  storage: {
    driver: process.env.STORAGE_DRIVER ?? 'local',
    uploadsDest: process.env.UPLOADS_DEST ?? './uploads',
    aws: {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:8080',
  },
});
