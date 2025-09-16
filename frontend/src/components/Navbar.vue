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
            <router-link to="/wishlist" class="nav-link">
              Wishlist ({{ wishlistStore.itemCount }})
            </router-link>
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
            
            <!-- Admin Dropdown -->
            <div v-if="authStore.isAdmin" class="admin-dropdown">
              <button @click="toggleAdminMenu" class="nav-link admin-toggle">
                Admin ▼
              </button>
              <div v-if="showAdminMenu" class="admin-menu">
                <router-link to="/admin" class="admin-menu-item">Dashboard</router-link>
                <router-link to="/admin/products" class="admin-menu-item">Products</router-link>
                <router-link to="/admin/categories" class="admin-menu-item">Categories</router-link>
                <router-link to="/admin/users" class="admin-menu-item">Users</router-link>
                <router-link to="/admin/orders" class="admin-menu-item">Orders</router-link>
                <router-link to="/admin/newsletters" class="admin-menu-item">Newsletters</router-link>
              </div>
            </div>
            
            <button @click="logout" class="btn btn-secondary">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore()
    const cartStore = useCartStore()
    const wishlistStore = useWishlistStore()
    const showAdminMenu = ref(false)

    const logout = async () => {
      await authStore.logout()
      await cartStore.clearCart()
    }

    const toggleAdminMenu = () => {
      showAdminMenu.value = !showAdminMenu.value
    }

    onMounted(() => {
      wishlistStore.fetchWishlist()
    })

    return {
      authStore,
      cartStore,
      wishlistStore,
      showAdminMenu,
      logout,
      toggleAdminMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(26, 26, 46, 0.95);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 900;
  color: #00ffff;
  text-decoration: none;
  text-shadow: 0 0 20px #00ffff;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  text-shadow: 0 0 30px #00ffff;
  transform: scale(1.05);
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 30px;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.nav-link.router-link-active {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.admin-dropdown {
  position: relative;
}

.admin-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.admin-toggle:hover {
  color: #00ffff;
}

.admin-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 0;
  min-width: 150px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.admin-menu-item {
  display: block;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.admin-menu-item:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

@media (max-width: 768px) {
  .navbar-nav {
    flex-direction: column;
    gap: 15px;
  }
  
  .admin-menu {
    position: static;
    margin-top: 10px;
  }
}
</style>