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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #fecaca;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
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
  color: #374151;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.login-button {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.register-prompt {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.register-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #764ba2;
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
  .login-card {
    background: #1f2937;
  }

  .login-title {
    color: #60a5fa;
  }

  .login-subtitle {
    color: #9ca3af;
  }

  .form-label {
    color: #d1d5db;
  }

  .form-input {
    background: #111827;
    border-color: #374151;
    color: #f9fafb;
  }

  .form-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .form-input:disabled {
    background: #0f172a;
  }

  .checkbox-label {
    color: #d1d5db;
  }

  .login-footer {
    border-top-color: #374151;
  }

  .register-prompt {
    color: #9ca3af;
  }

  .register-link {
    color: #60a5fa;
  }

  .register-link:hover {
    color: #93c5fd;
  }
}
</style>
