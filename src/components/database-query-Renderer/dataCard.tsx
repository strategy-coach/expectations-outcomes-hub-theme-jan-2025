import React from "react";

// Define the type of data for the cards
type CardData = {
    id: number;
    title: string;
    description: string;
    image?: string; // Optional image for the card
};

type CardListProps = {
    data: { [key: string]: any }[]; // Array of objects with dynamic keys
};

const CardList: React.FC<CardListProps> = ({ data }) => {
    return (
        <div style={styles.cardListContainer}>
            {data.map((item) => (
                <div key={item.title} style={styles.card}>
                    {/* Image */}
                    {item.image && (
                        <img src={item.image} alt={item.title} style={styles.cardImage} />
                    )}

                    {/* Title */}
                    {item.isDetail ? (
                        <h3 style={styles.cardTitle}>
                            <a href={item.detail_link} dangerouslySetInnerHTML={{ __html: item.title }} />
                        </h3>
                    ) : (
                        <h3 style={styles.cardTitle} dangerouslySetInnerHTML={{ __html: item.title }} />
                    )}

                    {/* Description */}
                    {item.description && (
                        <div style={styles.cardDescription} dangerouslySetInnerHTML={{ __html: item.description }} />
                    )}

                    {/* Additional Fields */}
                    <div style={styles.additionalFields}>
                        {Object.entries(item)
                            .filter(([key]) => !["title", "description", "image", "isDetail", "detail_link"].includes(key))
                            .map(([key, value]) => (
                                <p key={key}>
                                    <b>{formatKey(key)}</b>: {value}
                                </p>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Utility function to format key names (optional)
const formatKey = (key: string) => {
    return key
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
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
        textAlign: "left",
        transition: "transform 0.3s, box-shadow 0.3s",
    },
    cardImage: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "8px",
        marginBottom: "10px",
    },
    cardTitle: {
        fontSize: "18px",
        margin: "10px 0",
    },
    cardDescription: {
        fontSize: "14px",
        color: "#555",
    },
    additionalFields: {
        marginTop: "10px",
    },
};

export default CardList;
