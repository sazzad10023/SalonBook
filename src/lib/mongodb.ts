import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _salonbookMongoClient?: MongoClient;
  _salonbookMongoClientPromise?: Promise<MongoClient>;
};

function createConnectionPromise(client: MongoClient) {
  globalForMongo._salonbookMongoClientPromise = client.connect().catch((error) => {
    globalForMongo._salonbookMongoClientPromise = undefined;
    throw error;
  });
}

/**
 * Returns the shared MongoClient instance. The connection is started
 * immediately, so both the MongoDB adapter and plain DB helpers use the same
 * topology instead of creating one per Next.js module context.
 */
export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URL;

  if (!uri) {
    throw new Error("MONGODB_URL is not set");
  }

  if (!globalForMongo._salonbookMongoClient) {
    const client = new MongoClient(uri);
    globalForMongo._salonbookMongoClient = client;
    createConnectionPromise(client);
  } else if (!globalForMongo._salonbookMongoClientPromise) {
    createConnectionPromise(globalForMongo._salonbookMongoClient);
  }

  return globalForMongo._salonbookMongoClient;
}

export async function getConnectedMongoClient(): Promise<MongoClient> {
  const client = getMongoClient();

  if (!globalForMongo._salonbookMongoClientPromise) {
    createConnectionPromise(client);
  }

  return globalForMongo._salonbookMongoClientPromise as Promise<MongoClient>;
}

export async function getDb() {
  const client = await getConnectedMongoClient();
  return client.db("salonbook");
}
