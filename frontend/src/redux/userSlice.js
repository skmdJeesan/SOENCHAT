import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userData: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    updateUserPlan: (state, action) => {
      if (state.userData) {
        state.userData.plan = action.payload.plan
        state.userData.credits = (state.userData.credits || 0) + action.payload.credits
        state.userData.totalCredits = (state.userData.totalCredits || 0) + action.payload.credits
      }
    },
    updateCredits: (state, action) => {
      state.userData.credits = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUserData, updateUserPlan, updateCredits } = userSlice.actions
export default userSlice.reducer