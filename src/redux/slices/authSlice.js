import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Use proxy in development, full URL in production
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Debug: Log the API URL being used
if (import.meta.env.DEV) {
  console.log('API_URL:', API_URL)
  console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL)
} else {
  // In production, if no VITE_API_URL is set, we need to construct it
  console.log('Production API_URL:', API_URL)
}

// Get user from localStorage
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

const initialState = {
  user: userFromStorage,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

// Async thunk for user registration
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text())
        return rejectWithValue(`Server error: Expected JSON response but got ${contentType || 'unknown'}`)
      }

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed')
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data))

      return data.data
    } catch (error) {
      console.error('Registration error:', error)
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for user login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const url = `${API_URL}/auth/login`
      console.log('Attempting login to:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      console.log('Login response status:', response.status, response.statusText)
      console.log('Login response URL:', response.url)

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        console.error('Content-Type:', contentType)
        console.error('Status:', response.status)
        return rejectWithValue(`Server error: Expected JSON response but got ${contentType || 'unknown'}. Status: ${response.status}`)
      }

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed')
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data))

      return data.data
    } catch (error) {
      console.error('Login error:', error)
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        return rejectWithValue('No authentication token')
      }
      const userData = JSON.parse(user)
      const token = userData.token

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Update failed')
      }

      // Update user data in localStorage with token
      const updatedUser = { ...data.data, token }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload
      state.status = 'succeeded'
      state.error = null
    },
    logout(state) {
      state.user = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('user')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { loginSuccess, logout, clearError } = authSlice.actions
export default authSlice.reducer
