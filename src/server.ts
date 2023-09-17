import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import MediasRoute from '@routes/medias.route';
import validateEnv from '@utils/validateEnv';
validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new MediasRoute()]);

app.listen();
export const socketInstance = app.getSocketInstance();
