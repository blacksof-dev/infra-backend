import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — production allows only the three live domains;
  // development additionally allows localhost:3000
  const productionOrigins = [
    'https://tif-admin.vercel.app',
    'https://theinfravisionfoundation.org',
    'https://www.theinfravisionfoundation.org',
  ];

  const allowedOrigins = isProduction
    ? productionOrigins
    : [...productionOrigins, 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Swagger — only available in development
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Infra backend admin panel')
      .setDescription('Infra backend admin panel with all the modules')
      .setVersion('1.0')
      .addTag('Authentication', 'Admin authentication endpoints')
      .addTag('Admin Management', 'CRUD operations for admin users')
      .addTag('Social Profiles', 'CRUD for social media profiles')
      .addTag('Organisation', 'Organisation details (public read, admin write)')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Admin Panel Backend running on port ${port}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!isProduction) {
    console.log(
      `📖 Swagger documentation available at http://localhost:${port}/docs`,
    );
  }
}
bootstrap();
