import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Use proxy in development, full URL in production
const API_URL = import.meta.env.VITE_API_URL || '/api'

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

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed')
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data))

      return data.data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for user login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed')
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data))

      return data.data
    } catch (error) {
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
