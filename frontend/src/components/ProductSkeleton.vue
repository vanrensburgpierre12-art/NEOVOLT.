<template>
  <div class="product-skeleton">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-category"></div>
      <div class="skeleton-description"></div>
      <div class="skeleton-description short"></div>
      <div class="skeleton-footer">
        <div class="skeleton-price"></div>
        <div class="skeleton-rating"></div>
      </div>
      <div class="skeleton-button"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductSkeleton'
}
</script>

<style scoped>
.product-skeleton {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 10px;
  animation: shimmer 2s infinite;
}

.skeleton-category {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 15px;
  animation: shimmer 2s infinite;
}

.skeleton-description {
  height: 14px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 2s infinite;
}

.skeleton-description.short {
  width: 70%;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.skeleton-price {
  height: 20px;
  width: 80px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

.skeleton-rating {
  height: 16px;
  width: 100px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

.skeleton-button {
  height: 40px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.2) 50%, rgba(0, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>