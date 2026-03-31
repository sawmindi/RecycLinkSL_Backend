import databaseSetup from "../startup/database";
import seed from "./seed";

require('dotenv').config();

async function runSeed() {
    await databaseSetup();

    await seed();

}

runSeed();
