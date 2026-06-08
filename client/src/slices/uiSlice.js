import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isMobileMenuOpen: false,
    theme: 'light',
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
  },
})

export const { toggleMobileMenu, closeMobileMenu, setTheme } = uiSlice.actions
export default uiSlice.reducer