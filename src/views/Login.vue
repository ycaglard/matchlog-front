<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../clients/authClient.js'
import { setUser, setError as setAuthError, clearError } from '../store/authStore.js'

const router = useRouter()
const { loading, error, login } = useAuth()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    setAuthError('Please enter both username and password')
    return
  }

  clearError()
  
  try {
    const result = await login({
      username: username.value,
      password: password.value
    })
    
    // User is already set in the useAuth composable
    // Just need to update the global store
    const { user } = useAuth()
    setUser(user.value)
    
    console.log('Login successful:', result)
    
    // Redirect to home page
    router.push('/')
  } catch (err) {
    console.error('Login failed:', err)
    setAuthError(err.message || 'Login failed. Please check your credentials.')
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to your MatchLog account</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group-checkbox">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
                :disabled="loading"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="login-footer">
          <p class="register-prompt">
            Don't have an account?
            <a @click.prevent="goToRegister" class="register-link">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #14181c;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: #1a1f29;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 3rem;
  border: 1px solid #2c3440;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ff8000;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  font-size: 1rem;
  color: #9ab;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group-checkbox {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #9ab;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff8000;
}

.login-button {
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

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #e67700;
  box-shadow: 0 10px 20px rgba(255, 128, 0, 0.3);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #2c3440;
}

.register-prompt {
  font-size: 0.875rem;
  color: #9ab;
  margin: 0;
}

.register-link {
  color: #ff8000;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #ffb347;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

@media (prefers-color-scheme: dark) {
  /* Styles already dark */
}
</style>
