import { getConnection } from 'typeorm';

global.beforeEach(async () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        try {
    const conn = getConnection();
    if ((conn as any).isConnected) {
      const entities = (conn as any).entityMetadatas;
      for (const entity of entities) {
        const repository = (conn as any).getRepository(entity.name);
        await repository.clear();
      }
    }
  } catch (_) {
    // No active connection yet; skip
  }
});

global.afterEach(async () => {
  try {
    const conn = getConnection();
    if ((conn as any).isConnected) {
      await (conn as any).close();
    }
  } catch (_) {
    // No connection; skip
  }
});
