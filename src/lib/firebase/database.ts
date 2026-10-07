import { getDatabase, type Database } from "firebase/database";
import { app } from "./app";
import { firebaseConfig } from "./config";

export const db: Database = getDatabase(app, firebaseConfig.databaseURL);
