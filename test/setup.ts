import { getConnection } from 'typeorm';

global.beforeEach(async () => {
  const conn = getConnection();
  if (conn.isConnected) {
    // Clear all tables before each test
    const entities = conn.entityMetadatas;
    for (const entity of entities) {
      const repository = conn.getRepository(entity.name);
      await repository.clear();
    }
  }
});

global.afterEach(async () => {
  const conn = getConnection();
  if (conn.isConnected) {
    await conn.close();
  }
});
