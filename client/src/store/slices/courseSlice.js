import { createSlice } from '@reduxjs/toolkit';

const courseSlice = createSlice({
    name: 'courses',
    initialState: {
        courses: [],
        selectedCourse: null,
        filters: {
            category: '',
            level: '',
            search: '',
            priceRange: [0, 10000], // INR range
        },
        loading: false,
    },
    reducers: {
        setCourses: (state, action) => { state.courses = action.payload; },
        setSelectedCourse: (state, action) => { state.selectedCourse = action.payload; },
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
        clearFilters: (state) => {
            state.filters = { category: '', level: '', search: '', priceRange: [0, 10000] };
        },
        setLoading: (state, action) => { state.loading = action.payload; },
    },
});

export const { setCourses, setSelectedCourse, setFilters, clearFilters, setLoading } = courseSlice.actions;
export default courseSlice.reducer;
