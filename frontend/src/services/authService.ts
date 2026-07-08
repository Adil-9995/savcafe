import { api } from './api';

export const authService = {
  login: api.login.bind(api),
  getCurrentUser: api.getCurrentUser.bind(api),
  updateProfile: api.updateProfile.bind(api),
};

export default authService;
