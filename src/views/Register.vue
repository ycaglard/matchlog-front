<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../clients/authClient.js'
import { setUser, setError as setAuthError, clearError } from '../store/authStore.js'

const router = useRouter()
const { loading, error, register } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordMismatch = ref(false)

const handleRegister = async () => {
  // Validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    setAuthError('Please fill in all fields')
    return
  }

  if (password.value !== confirmPassword.value) {
    passwordMismatch.value = true
    setAuthError('Passwords do not match')
    return
  }

  if (password.value.length < 6) {
    setAuthError('Password must be at least 6 characters long')
    return
  }

  clearError()
  passwordMismatch.value = false
  
  try {
    const result = await register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    
    // User is already set and logged in via the useAuth composable
    const { user } = useAuth()
    setUser(user.value)
    
    console.log('Registration successful:', result)
    
    // Redirect to home page
    router.push('/')
  } catch (err) {
    console.error('Registration failed:', err)
    setAuthError(err.message || 'Registration failed. Please try again.')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-title">Create Account</h1>
          <p class="register-subtitle">Join MatchLog and start tracking your favorite events</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Choose a username"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :class="{ 'input-error': passwordMismatch }"
              placeholder="Create a password"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'input-error': passwordMismatch }"
              placeholder="Confirm your password"
              required
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            class="register-button"
            :disabled="loading"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="register-footer">
          <p class="login-prompt">
            Already have an account?
            <a @click.prevent="goToLogin" class="login-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #14181c;
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: #1a1f29;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 3rem;
  border: 1px solid #2c3440;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ff8000;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  font-size: 0.9rem;
  color: #9ab;
  margin: 0;
  line-height: 1.5;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-message {
  padding: 1rem;
  background: rgba(255, 128, 0, 0.1);
  color: #ff8000;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 128, 0, 0.3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cdd;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #445566;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  background: #2c3440;
  color: #cdd;
}

.form-input:focus {
  outline: none;
  border-color: #ff8000;
  box-shadow: 0 0 0 3px rgba(255, 128, 0, 0.1);
}

.form-input:disabled {
  background: #1a1f29;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-error {
  border-color: #ff4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1) !important;
}

.register-button {
  padding: 1rem;
  background: #ff8000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #e67700;
  box-shadow: 0 10px 20px rgba(255, 128, 0, 0.3);
}

.register-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #2c3440;
}

.login-prompt {
  font-size: 0.875rem;
  color: #9ab;
  margin: 0;
}

.login-link {
  color: #ff8000;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #ffb347;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .register-form {
    gap: 1rem;
  }
}

@media (prefers-color-scheme: dark) {
  /* Styles already dark */
}
</style>
