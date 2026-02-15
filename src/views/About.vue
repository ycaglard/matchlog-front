<template>
  <div class="about-page">
    <div class="about-container">
      <h1 class="page-title">About MatchLog</h1>
      
      <section class="about-section">
        <h2>Welcome to MatchLog</h2>
        <p>
          MatchLog is your ultimate destination for tracking and discovering sports events. 
          Whether you're a passionate sports fan or just looking to stay updated on upcoming 
          matches and tournaments, MatchLog has you covered.
        </p>
      </section>

      <section class="about-section">
        <h2>What We Do</h2>
        <p>
          Our platform allows you to:
        </p>
        <ul class="features-list">
          <li>Discover upcoming sports events and matches</li>
          <li>Track events logged by your friends</li>
          <li>Stay informed about tournament news and updates</li>
          <li>Connect with other sports enthusiasts</li>
        </ul>
      </section>

      <section class="about-section">
        <h2>Our Mission</h2>
        <p>
          At MatchLog, we believe that sports bring people together. Our mission is to create 
          a community where sports fans can easily discover, share, and celebrate the events 
          they love. We're committed to providing you with the most up-to-date information 
          about matches, tournaments, and everything happening in the world of sports.
        </p>
      </section>

      <section class="about-section">
        <h2>Get Started</h2>
        <p>
          Ready to dive in? Start by exploring upcoming events, check out what your friends 
          are following, and stay updated with the latest tournament news. Join the MatchLog 
          community today!
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
// About page component
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 64px);
  padding: 2rem;
  background: #14181c;
}

.about-container {
  max-width: 900px;
  margin: 0 auto;
  background: #1a1f29;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  padding: 3rem;
  border: 1px solid #2c3440;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ff8000;
  margin-bottom: 2rem;
  text-align: center;
}

.about-section {
  margin-bottom: 2.5rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #ff8000;
  margin-bottom: 1rem;
}

.about-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #9ab;
  margin-bottom: 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.features-list li {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #9ab;
  padding: 0.75rem 0;
  padding-left: 2rem;
  position: relative;
}

.features-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #ff8000;
  font-weight: 700;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .about-page {
    padding: 1rem;
  }

  .about-container {
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .about-section h2 {
    font-size: 1.5rem;
  }

  .about-section p,
  .features-list li {
    font-size: 1rem;
  }
}

@media (prefers-color-scheme: dark) {
  /* Styles already dark */
}
</style>

