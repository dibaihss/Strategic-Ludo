import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
 
    board: {
        position: "absolute",
        width: "80%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
     
    },
    verticalContainer: {
        position: "absolute",
        top: 64,
        bottom: 80,
        width: 50,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100000
    },
    horizontalContainer: {
        position: "absolute",
        top: 0,
        width: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    verticalColumn: {
        width: "auto",
        padding: 3,
        marginHorizontal: 15,
    },
    horizontalRow: {
        width: "auto",
        padding: 3,
        marginVertical: 15,
        transform: [{ rotate: "-90deg" }],
    },
    verbBox: {
        backgroundColor: "#f0f4f8",
        borderWidth: 2,
        borderColor: "rgb(81 81 116)",
        padding: 20,
        margin: 1,
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
    controls: {
        position: 'absolute',
        bottom: -60,
        flexDirection: 'row',
        gap: 20,
        backgroundColor: '#ffffff',
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
        backgroundColor: '#e8ecf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d9e6',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#2a3f5f',
        fontWeight: '500',
    },
});
