import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: 'p1', name: 'Large Ceramic Caladium Potted Plant', price: 7.5, currency: 'OMR', description: 'Caladium variety description...', image: '/plants/caladium.jpg' },
    { id: 'p2', name: 'Euphorbia Natural Cactus Potted Plant', price: 22, currency: 'OMR', description: 'Cactus variety description...', image: '/plants/cactus.jpg' },
    { id: 'p3', name: 'Alocasia Natural Polly Plant In White Pot', price: 45, currency: 'OMR', description: 'Alocasia variety description...', image: '/plants/alocasia.jpg' },
  ],
  selected: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action) {
      state.selected = action.payload
    },
  },
})

export const { selectProduct } = productsSlice.actions
export default productsSlice.reducer
