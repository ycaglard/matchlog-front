<template>
  <div class="news-card" @click="$emit('viewDetails', news)">
    <div class="news-image">
      <img :src="news.image" :alt="news.title" />
    </div>
    <div class="news-content">
      <h3 class="news-title">{{ news.title }}</h3>
      <p class="news-excerpt">{{ news.excerpt }}</p>
      <div class="news-meta">
        <span class="news-date">{{ formatDate(news.date) }}</span>
        <span class="news-category">{{ news.category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  news: {
    type: Object,
    required: true
  }
})

defineEmits(['viewDetails'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.news-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 350px;
  min-width: 350px;
  flex-shrink: 0;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.news-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-excerpt {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.news-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.news-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e3a8a;
  background: #eff6ff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

@media (prefers-color-scheme: dark) {
  .news-card {
    background: #1f2937;
  }

  .news-image {
    background: #111827;
  }

  .news-title {
    color: #60a5fa;
  }

  .news-excerpt {
    color: #9ca3af;
  }

  .news-meta {
    border-top-color: #374151;
  }

  .news-date {
    color: #6b7280;
  }

  .news-category {
    color: #60a5fa;
    background: #1e3a8a;
  }
}
</style>

