import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import Orders from '../views/Orders.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminProducts from '../views/AdminProducts.vue'
import AdminOrders from '../views/AdminOrders.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminCategories from '../views/AdminCategories.vue'
import AdminNewsletters from '../views/AdminNewsletters.vue'
import AdminFinance from '../views/AdminFinance.vue'
import Wishlist from '../views/Wishlist.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'
import PaymentCancel from '../views/PaymentCancel.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ShippingInfo from '../views/ShippingInfo.vue'
import Returns from '../views/Returns.vue'
import Warranty from '../views/Warranty.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: AdminCategories,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/newsletters',
    name: 'AdminNewsletters',
    component: AdminNewsletters,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/finance',
    name: 'AdminFinance',
    component: AdminFinance,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: PaymentSuccess
  },
  {
    path: '/payment/cancel',
    name: 'PaymentCancel',
    component: PaymentCancel
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/shipping',
    name: 'ShippingInfo',
    component: ShippingInfo
  },
  {
    path: '/returns',
    name: 'Returns',
    component: Returns
  },
  {
    path: '/warranty',
    name: 'Warranty',
    component: Warranty
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards can be added here if needed
// For now, we'll handle authentication in individual components

export default router