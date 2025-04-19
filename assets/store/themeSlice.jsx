import { createSlice } from '@reduxjs/toolkit';

const themes = {
    standard: {
        name: 'standard',
        colors: {
            blue: 'rgb(0 123 255)',
            red: '#f88',
            yellow: 'yellow',
            green: '#8f8',
            background: '#ffffff',
            border: {
                transparent: "rgba(81, 81, 116, 0.7)"
            },
            button: '#f0f0f0',
            buttonText: '#2a3f5f',
            buttonBorder: '#ccc',
            shadowColor: "#fff"
        }
    },
    classic: {
        name: 'classic',
        colors: {
            blue: '#88f',
            red: '#f88',
            yellow: '#ff8',
            green: '#8f8',
            background: '#ffffff',
            border: '#000000',
            button: '#e8ecf4',
            buttonText: '#2a3f5f',
            buttonBorder: '#d1d9e6',
            shadowColor: "#fff"
        }
    },
    dark: {
        name: 'dark',
        colors: {
            blue: '#4466cc',
            red: '#cc4444',
            yellow: 'rgb(220 87 250)',
            green: '#44cc44',
            background: '#2d2d2d',
            border: '#ffffff',
            selected: 'black',
            button: '#3d3d3d',
            buttonText: '#ffffff',
            buttonBorder: '#555555',
            shadowColor: "#fff"
        }
    },
    // pastel: {
    //     name: 'pastel',
    //     colors: {
    //         blue: '#a8d8ff',
    //         red: '#ffb3b3',
    //         yellow: '#ffffb3',
    //         green: '#b3ffb3',
    //         background: '#f0f4f8',
    //         border: '#7c7c7c',
    //         button: '#dce4ed',
    //         buttonText: '#4a5568',
    //         buttonBorder: '#cbd5e0'
    //     }
    // },
    // neon: {
    //     name: 'neon',
    //     colors: {
    //         blue: '#00ffff',
    //         red: '#ff0066',
    //         yellow: '#ffff00',
    //         green: '#00ff66',
    //         background: '#1a1a1a',
    //         border: '#00ff00',
    //         button: '#2d2d2d',
    //         buttonText: '#00ff00',
    //         buttonBorder: '#00ff00'
    //     }
    // },
    // retro: {
    //     name: 'retro',
    //     colors: {
    //         blue: '#4040ff',
    //         red: '#ff4040',
    //         yellow: '#ffff40',
    //         green: '#40ff40',
    //         background: '#c0c0c0',
    //         border: '#808080',
    //         button: '#a0a0a0',
    //         buttonText: '#000000',
    //         buttonBorder: '#606060'
    //     }
    // },
    // ocean: {
    //     name: 'ocean',
    //     colors: {
    //         blue: '#1e88e5',
    //         red: '#e57373',
    //         yellow: '#fff176',
    //         green: '#81c784',
    //         background: '#e3f2fd',
    //         border: '#0d47a1',
    //         button: '#bbdefb',
    //         buttonText: '#1565c0',
    //         buttonBorder: '#2196f3'
    //     }
    // },
    // forest: {
    //     name: 'forest',
    //     colors: {
    //         blue: '#3f51b5',
    //         red: '#f44336',
    //         yellow: '#ffd700',
    //         green: '#2e7d32',
    //         background: '#dcedc8',
    //         border: '#33691e',
    //         button: '#c5e1a5',
    //         buttonText: '#1b5e20',
    //         buttonBorder: '#558b2f'
    //     }
    // },
    // candy: {
    //     name: 'candy',
    //     colors: {
    //         blue: '#29b6f6',
    //         red: '#ff8a80',
    //         yellow: '#ffee58',
    //         green: '#9ccc65',
    //         background: '#fce4ec',
    //         border: '#c2185b',
    //         button: '#f8bbd0',
    //         buttonText: '#880e4f',
    //         buttonBorder: '#ec407a'
    //     }
    // }
};

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        current: themes.dark,
        themes
    },
    reducers: {
        setTheme: (state, action) => {
            state.current = themes[action.payload];
        }
    }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;