import React from "react";
import "./css/cardList.css"; // Import the external CSS file

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
        <div className="card-list-container">
            {data.map((item) => (

                <div key={item.title} className="card">
                    {/* Image */}
                    {item.image && <img src={item.image} alt={item.title} className="card-image" />}

                    {/* Title */}
                    {item.isDetail ? (
                        <h3 className={`card-title ${!item.image ? "w-full" : ""}`}>
                            <a href={item.detail_link} dangerouslySetInnerHTML={{ __html: item.title }} />
                        </h3>
                    ) : (
                        <h3 className={`card-title ${!item.image ? "w-full" : ""}`} dangerouslySetInnerHTML={{ __html: item.title }} />
                    )}

                    {/* Description */}
                    {item.description && (
                        <div className="card-description" dangerouslySetInnerHTML={{ __html: item.description }} />
                    )}

                    {/* Additional Fields */}
                    <div className="additional-fields">
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



export default CardList;
