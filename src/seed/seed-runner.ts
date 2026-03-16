import databaseSetup from "../startup/database";
import * as mongoose from 'mongoose';
import seed from "./seed";

require('dotenv').config();

async function runSeed() {
    await databaseSetup();

    await seed();

    //await mongoose.disconnect();
}

runSeed();
