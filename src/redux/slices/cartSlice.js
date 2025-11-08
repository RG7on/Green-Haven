import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], // {productId, qty}
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { productId, qty = 1 } = action.payload
      const existing = state.items.find(i => i.productId === productId)
      if (existing) existing.qty += qty
      else state.items.push({ productId, qty })
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i.productId !== action.payload)
    },
    changeQty(state, action) {
      const { productId, qty } = action.payload
      const item = state.items.find(i => i.productId === productId)
      if (item) item.qty = qty
    },
    clearCart(state) { state.items = [] },
  },
})

export const { addToCart, removeFromCart, changeQty, clearCart } = cartSlice.actions
export default cartSlice.reducer
