"use client";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const ImageUrlRepeater = ({ imageUrls, setImageUrls }) => {
    // Add a new image URL
    const handleAdd = () => {
        setImageUrls([...imageUrls, ""]); // Add an empty string for a new URL
    };

    // Remove an image URL by index
    const handleRemove = (index) => {
        const updatedImageUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(updatedImageUrls);
    };

    // Update an image URL by index
    const handleChange = (index, value) => {
        const updatedImageUrls = imageUrls.map((item, i) =>
            i === index ? value : item
        );
        setImageUrls(updatedImageUrls);
    };

    return (
        <div>
            {imageUrls.map((url, index) => (
                <div key={index} className="mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={url}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="form-control"
                        />
                        <button
                            type="button"
                            style={{ minWidth: "40px" }}
                            className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            onClick={() => handleRemove(index)}
                        >
                            <Icon icon="mdi:trash-outline" className="icon text-xl" />
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                className="d-flex align-items-center gap-6 px-8 py-4 bg-primary-50 radius-4 bg-hover-primary-100 flex-shrink-0 mb-24"
                onClick={handleAdd}
            >
                <i className="ri-edit-2-fill" /> Add New Image
            </button>
        </div>
    );
};

export default ImageUrlRepeater;