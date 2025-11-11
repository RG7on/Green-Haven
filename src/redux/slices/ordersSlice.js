import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return userData.token
  }
  return null
}

const initialState = {
  orders: [],
  currentOrder: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

// Async thunk to create order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create order')
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to fetch user's orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch orders')
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to fetch single order
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch order')
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    clearCurrentOrder(state) {
      state.currentOrder = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentOrder = action.payload
        state.orders.unshift(action.payload) // Add to beginning
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.orders = action.payload
        state.error = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentOrder = action.payload
        state.error = null
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentOrder } = ordersSlice.actions
export default ordersSlice.reducer
