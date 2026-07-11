import { api } from './api';

export const productService = {
  getProducts: api.getProducts.bind(api),
  addProduct: api.addProduct.bind(api),
  updateProduct: api.updateProduct.bind(api),
  deleteProduct: api.deleteProduct.bind(api),
  toggleProductStatus: api.toggleProductStatus.bind(api),
};

export default productService;
