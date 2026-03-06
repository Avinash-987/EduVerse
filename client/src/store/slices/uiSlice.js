import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        sidebarOpen: true,
        notifications: [],
        searchQuery: '',
    },
    reducers: {
        toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
        setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
        addNotification: (state, action) => { state.notifications.push(action.payload); },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter((_, i) => i !== action.payload);
        },
        setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    },
});

export const { toggleSidebar, setSidebarOpen, addNotification, removeNotification, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
