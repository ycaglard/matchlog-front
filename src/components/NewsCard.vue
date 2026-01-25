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
        <span class="news-category">
          <template v-if="news.category === 'Football'">
            <img src="/icons/football.png" alt="Football" class="news-icon" />
          </template>
          <template v-else-if="news.category === 'Multi-Sport'">
            <img src="/icons/multisport.png" alt="Multi-Sport" class="news-icon" />
          </template>
          <template v-else-if="news.category === 'Tennis'">
            <img src="/icons/tennis.png" alt="Tennis" class="news-icon" />
          </template>
          <template v-else-if="news.category === 'Basketball'">
            <img src="/icons/basketball.png" alt="Basketball" class="news-icon" />
          </template>
          <template v-else-if="news.category === 'Volleyball'">
            <img src="/icons/volleyball.png" alt="Volleyball" class="news-icon" />
          </template>
          <template v-else>
          </template>
          {{ news.category }}
        </span>
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
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 340px;
  min-width: 340px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #1e3a8a;
}

.news-image {
  width: 100%;
  height: 190px;
  overflow: hidden;
  background: #f3f4f6;
  position: relative;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.news-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  background: white;
}

.news-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: Georgia, 'Times New Roman', serif;
  letter-spacing: -0.2px;
}

.news-excerpt {
  font-size: 0.875rem;
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
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
  margin-top: auto;
}

.news-date {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.news-category {
  font-size: 0.688rem;
  font-weight: 700;
  color: #1e3a8a;
  background: #eff6ff;
  padding: 0.375rem 0.875rem;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 0.4em;
}

@media (prefers-color-scheme: dark) {
  .news-card {
    background: #1f2937;
    border-color: #374151;
  }

  .news-card:hover {
    border-color: #60a5fa;
  }

  .news-image {
    background: #111827;
  }

  .news-content {
    background: #1f2937;
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

