import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const initialState = {
  items: [], // Cart items from backend
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return userData.token
  }
  return null
}

// Async thunk to fetch user's cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch cart')
      }

      return data.data.items || []
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to add item to cart
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to add to cart')
      }

      return data.data.items || []
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to update cart item quantity
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update cart')
      }

      return data.data.items || []
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to remove item from cart
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to remove from cart')
      }

      return data.data.items || []
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk to clear cart
export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        return rejectWithValue('No authentication token')
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to clear cart')
      }

      return []
    } catch (error) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    // Local actions for backwards compatibility (if needed)
    addToCart(state, action) {
      const { productId, qty = 1 } = action.payload
      const existing = state.items.find(i => i.product === productId || i.product._id === productId)
      if (existing) existing.quantity += qty
      else state.items.push({ product: productId, quantity: qty })
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => 
        (i.product !== action.payload && i.product._id !== action.payload)
      )
    },
    changeQty(state, action) {
      const { productId, qty } = action.payload
      const item = state.items.find(i => i.product === productId || i.product._id === productId)
      if (item) item.quantity = qty
    },
    clearCart(state) { 
      state.items = [] 
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { addToCart, removeFromCart, changeQty, clearCart, clearError } = cartSlice.actions
export default cartSlice.reducer
