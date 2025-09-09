<template>
  <nav class="navbar">
    <div class="container">
      <div class="d-flex justify-between align-center">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          NEOVOLT
        </router-link>

        <!-- Navigation Links -->
        <ul class="navbar-nav">
          <li>
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li>
            <router-link to="/products" class="nav-link">Products</router-link>
          </li>
          <li>
            <router-link to="/cart" class="nav-link">
              Cart ({{ cartStore.itemCount }})
            </router-link>
          </li>
          
          <!-- User Menu -->
          <li v-if="!authStore.isAuthenticated" class="d-flex align-center" style="gap: 15px;">
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Register</router-link>
          </li>
          
          <li v-else class="d-flex align-center" style="gap: 15px;">
            <router-link to="/profile" class="nav-link">Profile</router-link>
            <router-link to="/orders" class="nav-link">Orders</router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link">Admin</router-link>
            <button @click="logout" class="btn btn-secondary">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore()
    const cartStore = useCartStore()

    const logout = async () => {
      await authStore.logout()
      await cartStore.clearCart()
    }

    return {
      authStore,
      cartStore,
      logout
    }
  }
}
</script>