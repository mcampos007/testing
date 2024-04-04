// Importación de Módulos
import express from 'express';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import {  addLogger } from './utils/new_logger.js';
import methodOverride from 'method-override';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import config from './config/config.js';
import MongoSingleton from './config/mongodb-singleton.js';
import cors from 'cors';
import initSocket from './socketManager.js';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpres from 'swagger-ui-express'

import ViewsRouter from './routes/views.router.js';
import sessionRouter from './routes/sessions.routes.js';
import ProductsRouter from './routes/mongo/products.routes.js';
import CartsRouter from './routes/mongo/carts.routes.js';
import MessagesRouter from './routes/chat/messages.routes.js';
import PasswordRouter from './routes/mongo/password.routes.js';
import { createMessage } from './controllers/messages.controller.js';
import UsersExtendRouter from './routes/custom/users.extend.router.js';
import axios from 'axios';
import emailRouter from './routes/mensajeria/email.router.js';
import smsRouter from './routes/mensajeria/sms.router.js';
import MockingRouter from './routes/mocking.routes.js';

//Configuración del Servidor express
const { privatekey: PRIVATE_KEY, port: PORT } = config;

const app = express();

const cookieParserMiddleware = cookieParser(PRIVATE_KEY);
app.use(cookieParserMiddleware);

app.use(addLogger);


//Configuración de la conexión a MongoDB y sesiones
const MONGO_URL = config.urlMongo; 
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      //mongoOptions --> opciones de confi para el save de las sessions
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 10 * 60,
    }),

    secret: PRIVATE_KEY,
    resave: false, // guarda en memoria
    saveUninitialized: true, //lo guarda a penas se crea
  })
);

//documentacion
const swaggerOptions = {
  definition:{
      openapi:'3.0.1',
      info:{
          title:"Documentacion de  la API",
          description: "Documentación de la API ecommerce"
      }
  },
  apis:[`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpres.serve, swaggerUiExpres.setup(specs))


//Configuración de CORS
const corsOptions = {
  // Permitir solo solicitudes desde un cliente específico
  origin: 'http://127.0.0.1:5501',

  // Configura los métodos HTTP permitidos
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

  // Configura las cabeceras permitidas
  allowedHeaders: 'Content-Type,Authorization',

  // Configura si se permiten cookies en las solicitudes
  credentials: true,
};
app.use(cors(corsOptions));

//Configuración de Passport y middleware adicionales
initializePassport();

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

//Configuración del motor de vistas Handlebars:
//Inicializndo el motor
app.engine(
  'hbs',
  handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

//Configuración de rutas:
const viewsRouter = new ViewsRouter()
app.use('/', viewsRouter.getRouter());
const usersExtendRouter = new UsersExtendRouter();
app.use('/api/extend/users', usersExtendRouter.getRouter());
const productRouter = new ProductsRouter();
app.use('/api/products', productRouter.getRouter());
const cartRouter = new CartsRouter();
app.use('/api/carts', cartRouter.getRouter());
app.use('/api/sessions', sessionRouter);
const messageRouter = new MessagesRouter();
app.use('/api/chat', messageRouter.getRouter());
app.use('/api/email', emailRouter);
app.use('/api/sms', smsRouter);
const mockingRouter = new MockingRouter();
app.use('/mockingproducts', mockingRouter.getRouter());
const passwordRouter = new PasswordRouter()
app.use('/api/password', passwordRouter.getRouter())
//Inicio del servidor y configuración de sockets
const httpServer = app.listen(PORT, () => {
  // console.log(`Server run on port: ${PORT}`);
  //process.exit(5);
  //consolelog();
});
const mongoInstance = async () => {
  try {
    await MongoSingleton.getInstance();
  } catch (error) {
    //console.log(error);
    process.exit();
  }
};
mongoInstance();

initSocket(httpServer);


