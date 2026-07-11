import { api } from './api';

export const cashierService = {
  getCashiers: api.getCashiers.bind(api),
  addCashier: api.addCashier.bind(api),
  updateCashier: api.updateCashier.bind(api),
  deleteCashier: api.deleteCashier.bind(api),
  resetCashierPassword: api.resetCashierPassword.bind(api),
};

export default cashierService;
