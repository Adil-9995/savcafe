import { api } from './api';

export const categoryService = {
  getCategories: api.getCategories.bind(api),
  addCategory: api.addCategory.bind(api),
  updateCategory: api.updateCategory.bind(api),
  deleteCategory: api.deleteCategory.bind(api),
};

export default categoryService;
