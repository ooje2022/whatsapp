import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chats",
  initialState: {
    chatsData: {},
  },
  reducers: {
    setChatsData: (state, action) => {
      state.chatsData = { ...action.payload.chatsData };
    },
  },
});
export const setChatsData = chatSlice.actions.setChatsData;
export default chatSlice.reducer;
/* import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chats",
  initialState: {
    chatsData: {},
  },
  reducers: {
    setChatsData: (state, action) => {
      //Make a copy and same updates from payload unto the state.chatsData
      state.chatsData = { ...action.payload.chatsData };
    },
  },
});

export const setChatsData = chatSlice.actions.setChatsData;

export default chatSlice.reducer;
 */
