import app from './app.js';

import connectDB from './database/connectDB.js';
import { createServer } from 'http';
import logger from './utils/logger.js';
import { SERVER_HOSTNAME, SERVER_PORT } from './config/config.env.js';

const Main = async () => {
    try {
        await connectDB().catch((err) => {
            logger.error(err.message);

            process.exit(1);
        });

        const server = createServer(app);
        server.listen(SERVER_PORT, () => {
            logger.info(`Server running at http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
        });
    } catch (error: any) {
        logger.error('Something went wrong when connecting to server', error.message);
        process.exit(1);
    }
};

Main();
