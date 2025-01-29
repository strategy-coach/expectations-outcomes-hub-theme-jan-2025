import React from "react";

// Define the type of data for the cards
type CardData = {
    id: number;
    title: string;
    description: string;
    imageUrl?: string; // Optional image for the card
};

type CardListProps = {
    data: { [key: string]: any }[]; // Array of objects with dynamic keys
};

const CardList: React.FC<CardListProps> = ({ data }) => {
    console.log(data)
    return (
        <div style={styles.cardListContainer}>
            {data.map((item) => (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    {item.description ? <p style={styles.cardDescription}>{item.description}</p> : ""}
                </div>
            ))}
        </div>
    );
};

// Styles for the card list and cards
const styles: { [key: string]: React.CSSProperties } = {
    cardListContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        textAlign: "center",
        transition: "transform 0.3s, box-shadow 0.3s",
    },
    cardImage: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "8px",
    },
    cardTitle: {
        fontSize: "18px",
        margin: "10px 0",
    },
    cardDescription: {
        fontSize: "14px",
        color: "#555",
    },
};

export default CardList;
