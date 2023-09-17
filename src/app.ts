import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { Model } from 'objection';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import knex from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import bodyParser from 'body-parser';
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  //public SubscriptionsController = new SubscriptionsController();

  constructor(routes: Routes[]) {
    this.app = express();
    this.http = require('http').createServer(this.app);
    this.io = require('socket.io')(this.http, {
      cors: {
        origin: '*',
      },
    });

    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.app.post('/webhook-premium', express.raw({ type: 'application/json' }), (request, response) => {
      let event = request.body;

      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(request.body, signature, process.env.STRIPE_WEBHOOK_SIGNATURE_PREMIUM);
        if (event.type === 'checkout.session.completed') {
          this.SubscriptionsController.getWebHookPremium(event);
          return response.status(200).json({ receveid: true });
        }
      } catch (err) {
        console.log(`⚠️ Webhook signature verification failed.`, err.message);
      }

      response.send();
    });

    this.app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '50mb',
        parameterLimit: 100000,
      }),
    );

    this.app.use(
      bodyParser.json({
        limit: '50mb',
        parameterLimit: 100000,
      }),
    );

    /*this.app.use(
      bodyParser.raw({
        limit: '50mb',
        inflate: true,
        parameterLimit: 100000,
      }),
    );*/

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeUploadsFolder();
    this.initializeErrorHandling();
    this.initSocketIo();
  }

  public listen() {
    this.http.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public initSocketIo() {
    this.io.on('connection', (socket: any) => {
      console.log('Socket connected');

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    });
  }

  public getServer() {
    return this.app;
  }

  public getSocketInstance() {
    return this.io;
  }

  private connectToDatabase() {
    Model.knex(knex);
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeUploadsFolder() {
    this.app.use(express.static('src/public'));
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
