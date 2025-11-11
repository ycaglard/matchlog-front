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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
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

.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.login-prompt {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.login-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #764ba2;
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
  .register-card {
    background: #1f2937;
  }

  .register-title {
    color: #60a5fa;
  }

  .register-subtitle {
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

  .register-footer {
    border-top-color: #374151;
  }

  .login-prompt {
    color: #9ca3af;
  }

  .login-link {
    color: #60a5fa;
  }

  .login-link:hover {
    color: #93c5fd;
  }
}
</style>
