import { api } from './api';

export const billService = {
  createBill: api.createBill.bind(api),
  getBills: api.getBills.bind(api),
  getBillDetails: api.getBillDetails.bind(api),
};

export default billService;
