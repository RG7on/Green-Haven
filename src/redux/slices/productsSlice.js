import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProducts } from '../../services/api.js'

export const loadProducts = createAsyncThunk('products/load', async () => {
  const response = await fetchProducts()
  // Handle both old format (array) and new format ({ success: true, data: [] })
  return response.data || response
})

const initialState = { items: [], selected: null, status: 'idle', error: null }

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action) { state.selected = action.payload },
  },
  extraReducers: builder => {
    builder
      .addCase(loadProducts.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(loadProducts.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload })
      .addCase(loadProducts.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message })
  }
})

export const { selectProduct } = productsSlice.actions
export default productsSlice.reducer
