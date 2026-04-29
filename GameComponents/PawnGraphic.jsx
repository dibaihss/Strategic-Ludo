import React from 'react';
import PropTypes from 'prop-types';
import { SvgXml } from 'react-native-svg/lib/commonjs/xml';

const CHESS_PAWN_PATH_PRIMARY = 'M27.819 33.653C28.46 32.997 29 32.072 29 30.801c0-3.149-3.645-6.753-5-9.801c-1.333-3-2.104-5.875-.083-6.688l.17-.073c.578-.218.913-.47.913-.739c0-.46-.97-.872-2.494-1.147A6.98 6.98 0 0 0 25 7a7 7 0 1 0-14 0a6.98 6.98 0 0 0 2.494 5.353C11.97 12.628 11 13.04 11 13.5c0 .269.335.521.914.739c.056.024.106.048.169.073C14.104 15.125 13.333 18 12 21c-1.355 3.048-5 6.652-5 9.801c0 1.271.54 2.196 1.181 2.852C7.432 34.058 7 34.515 7 35c0 .351.233.687.639 1H28.36c.407-.313.64-.649.64-1c0-.485-.432-.942-1.181-1.347z';
const CHESS_PAWN_PATH_SECONDARY = 'M22.001 4.75a.752.752 0 0 1-.672-.415c-.03-.058-.866-1.585-3.329-1.585s-3.298 1.527-3.333 1.593a.752.752 0 0 1-1.008.32a.746.746 0 0 1-.33-.999C13.378 3.566 14.576 1.25 18 1.25c3.424 0 4.621 2.316 4.671 2.415a.749.749 0 0 1-.67 1.085zM22 14a.504.504 0 0 1-.224-.053c-.004-.001-.988-.447-3.776-.447c-2.789 0-3.772.446-3.782.45a.502.502 0 0 1-.665-.234a.498.498 0 0 1 .224-.664c.113-.056 1.192-.552 4.223-.552c3.03 0 4.11.496 4.224.553A.5.5 0 0 1 22 14zM10 34.5a.5.5 0 0 1-.049-.997C10 33.497 15.01 33 18 33s7.999.497 8.05.503a.498.498 0 0 1 .447.547a.498.498 0 0 1-.547.447C25.9 34.492 20.94 34 18 34c-2.941 0-7.9.492-7.95.497L10 34.5z';

const NAMED_COLOR_MAP = {
    black: '#000000',
    blue: '#0000ff',
    green: '#008000',
    red: '#ff0000',
    white: '#ffffff',
    yellow: '#ffff00',
};

const clampColorChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = ({ red, green, blue }) => `#${[red, green, blue].map((channel) => clampColorChannel(channel).toString(16).padStart(2, '0')).join('')}`;

const parseColorToRgb = (value) => {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
        return {
            red: Number.parseInt(trimmed.slice(1, 3), 16),
            green: Number.parseInt(trimmed.slice(3, 5), 16),
            blue: Number.parseInt(trimmed.slice(5, 7), 16),
        };
    }

    if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
        return {
            red: Number.parseInt(`${trimmed[1]}${trimmed[1]}`, 16),
            green: Number.parseInt(`${trimmed[2]}${trimmed[2]}`, 16),
            blue: Number.parseInt(`${trimmed[3]}${trimmed[3]}`, 16),
        };
    }

    const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(trimmed);
    if (rgbMatch) {
        const channels = rgbMatch[1]
            .trim()
            .split(/[\s,/]+/)
            .filter(Boolean)
            .slice(0, 3)
            .map(Number);

        if (channels.length === 3 && channels.every((channel) => Number.isFinite(channel))) {
            return {
                red: channels[0],
                green: channels[1],
                blue: channels[2],
            };
        }
    }

    const namedColor = NAMED_COLOR_MAP[trimmed.toLowerCase()];
    if (namedColor) {
        return parseColorToRgb(namedColor);
    }

    return null;
};

const normalizeHexColor = (value, fallback = '#31373D') => {
    const rgbColor = parseColorToRgb(value);
    if (!rgbColor) return fallback;

    return rgbToHex(rgbColor);
};

const darkenHexColor = (value, amount = 0.28) => {
    const normalized = normalizeHexColor(value);
    const hex = normalized.slice(1);
    const channels = [0, 2, 4].map((offset) => {
        const channel = Number.parseInt(hex.slice(offset, offset + 2), 16);
        return Math.max(0, Math.round(channel * (1 - amount)));
    });

    return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

const createPawnSvgXml = (fillColor) => {
    const primary = normalizeHexColor(fillColor);
    const secondary = darkenHexColor(primary);

    return `
        <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path fill="${primary}" d="${CHESS_PAWN_PATH_PRIMARY}" />
            <path fill="${secondary}" d="${CHESS_PAWN_PATH_SECONDARY}" />
        </svg>
    `;
};

export default function PawnGraphic({ accessibilityLabel, fillColor, nativeID, style, testID }) {
    return (
        <SvgXml
            accessibilityLabel={accessibilityLabel}
            nativeID={nativeID}
            testID={testID}
            xml={createPawnSvgXml(fillColor)}
            style={style}
        />
    );
}

PawnGraphic.propTypes = {
    accessibilityLabel: PropTypes.string,
    fillColor: PropTypes.string,
    nativeID: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    testID: PropTypes.string,
};

PawnGraphic.defaultProps = {
    accessibilityLabel: undefined,
    fillColor: '#31373D',
    nativeID: undefined,
    style: undefined,
    testID: undefined,
};