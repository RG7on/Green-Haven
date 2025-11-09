import { createSlice } from '@reduxjs/toolkit'
import img1 from '../../assets/test_palceholders/1.png'
import img2 from '../../assets/test_palceholders/2.png'
import img3 from '../../assets/test_palceholders/3.png'

const initialState = {
  items: [
  { id: 'p1', name: 'Large Ceramic Caladium Potted Plant', price: 7.5, currency: 'OMR', description: 'Beautiful Caladium plant with vibrant leaves, perfect for indoor decoration. Easy to care for and thrives in indirect sunlight.', image: img1 },
  { id: 'p2', name: 'Euphorbia Natural Cactus Potted Plant', price: 22, currency: 'OMR', description: 'Low-maintenance cactus variety that adds a touch of desert beauty to your space. Requires minimal watering.', image: img2 },
  { id: 'p3', name: 'Alocasia Natural Polly Plant In White Pot', price: 45, currency: 'OMR', description: 'Stunning Alocasia Polly with dramatic arrow-shaped leaves. A statement piece for any room that loves humidity.', image: img3 },
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
