import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    centerCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#000',
        overflow: 'hidden',
        zIndex: 1,
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -36 },
            { translateY: -35 }
        ],
    },
    centerQuadrants: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    quadrant: {
        width: '50%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    cross: {
        position: "absolute",
        width: "90%",
        height: "90%",
        justifyContent: "center",
        alignItems: "center",
    },
    verticalContainer: {
        position: "absolute",
        top: 80,  // Reduced from 100 to give more room
        bottom: 80, // Reduced from 100 to give more room
        width: 50,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    horizontalContainer: {
        position: "absolute",
        left: 80,  // Reduced from 100
        right: 80, // Reduced from 100
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    verticalColumn: {
        width: "auto",
        padding: 3,
        marginHorizontal: 15, // Added margin between columns
    },
    horizontalRow: {
        width: "auto",
        padding: 3,
        marginVertical: 15, // Added margin between rows
        transform: [{ rotate: "-90deg" }],
    },
    verbBox: {
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 6,
        margin: 2,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    verbText: {
        textAlign: 'center',
        fontSize: 14,
    },
    corner: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 10,
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    red: {
        backgroundColor: "#f88",
    },
    yellow: {
        backgroundColor: "#ff8",
    },
    blue: {
        backgroundColor: "#88f",
    },
    green: {
        backgroundColor: "#8f8",
    },
    left: {
        top: 20,
        left: 20,
    },
    top: {
        top: 20,
        right: 20,
    },
    bottom: {
        bottom: 20,
        left: 20,
    },
    right: {
        bottom: 20,
        right: 20,
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        margin: 5,
        borderWidth: 1,
        borderColor: "#000",
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden', // Add this to keep player within circle
    },
    cornerPlayer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -10 },
            { translateY: -10 }
        ],
    },
    controls: {
        position: 'absolute',
        bottom: -60,
        flexDirection: 'row',
        gap: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});