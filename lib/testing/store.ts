import path from 'path';
import fs from 'fs';
import LowDBStore from 'origami-store-lowdb';

const getDBPath = (location: string) =>
    path.join(location, 'store.db.json');

let LOCATION: string;

export const storeCreate = async (location: string | true) => {
    LOCATION = (location === true) ? getDBPath(process.cwd()) : location;
    // @ts-ignore
    const s = new LowDBStore({
        type: 'lowdb',
        database: LOCATION
    });
    await s.connect();
    return s;
}

export const storeRemove = (location: string = LOCATION) => {
    try { fs.unlinkSync(location); }
    catch { }
}
