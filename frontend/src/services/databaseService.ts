import { api } from './api';

export const databaseService = {
  getStats: api.getStats.bind(api),
  clearDatabase: api.clearDatabase.bind(api),
  listBackups: api.listBackups.bind(api),
  createBackup: api.createBackup.bind(api),
  restoreBackup: api.restoreBackup.bind(api),
  deleteBackup: api.deleteBackup.bind(api),
};

export default databaseService;
