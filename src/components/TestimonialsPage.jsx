"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const TestimonialsPage = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [formData, setFormData] = useState({ name: "", testimonial: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch testimonials on page load
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await fetch("/api/testimonials");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTestimonials(data.testimonials);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching testimonials:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission (add or update testimonial)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = editingTestimonial
                ? `/api/testimonials/${editingTestimonial.testimonial_id}`
                : "/api/testimonials";
            const method = editingTestimonial ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to save testimonial");
            }

            // Refresh testimonials after saving
            const fetchResponse = await fetch("/api/testimonials");
            const fetchData = await fetchResponse.json();
            setTestimonials(fetchData.testimonials);

            // Reset form
            setFormData({ name: "", testimonial: "" });
            setEditingTestimonial(null);
        } catch (error) {
            setError(error.message);
            console.error("Error saving testimonial:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            testimonial: testimonial.testimonial,
        });
    };

    // Handle delete button click
    const handleDelete = async (testimonial_id) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            try {
                const response = await fetch(`/api/testimonials/${testimonial_id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete testimonial");
                }

                // Refresh testimonials after deletion
                const fetchResponse = await fetch("/api/testimonials");
                const fetchData = await fetchResponse.json();
                setTestimonials(fetchData.testimonials);
            } catch (error) {
                setError(error.message);
                console.error("Error deleting testimonial:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center gap-8 pb-24">
                <p>
                    <strong>Loading Testimonials...</strong>
                </p>
                <Icon icon="eos-icons:loading" className="icon" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Testimonials</h1>

            {/* Testimonials Table */}
            <div className="card mb-4">
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Testimonial</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((testimonial) => (
                                <tr key={testimonial.testimonial_id}>
                                    <td>{testimonial.name}</td>
                                    <td>{testimonial.testimonial}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleEdit(testimonial)}
                                        >
                                            <Icon icon="mdi:pencil" />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(testimonial.testimonial_id)}
                                        >
                                            <Icon icon="mdi:trash" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Testimonial Form */}
            <div className="card mt-24">
                <div className="card-body">
                    <h2 className="text-xl font-bold mb-4">
                        {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="mb-4">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        {/* Testimonial Field */}
                        <div className="mb-4">
                            <label className="form-label">Testimonial</label>
                            <textarea
                                name="testimonial"
                                value={formData.testimonial}
                                onChange={handleInputChange}
                                className="form-control"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn rounded-pill btn-primary-600 radius-8 px-20 py-11 d-flex align-items-center gap-2 mt-24" disabled={loading}>
                            {loading ? (
                                <span className="d-flex align-items-center gap-2">
                                    <Icon icon="eos-icons:loading" className="icon" />
                                    Saving...
                                </span>
                            ) : (
                                editingTestimonial ? "Update Testimonial" : "Add Testimonial"
                            )}
                        </button>

                        {/* Cancel Button (only in edit mode) */}
                        {editingTestimonial && (
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => {
                                    setFormData({ name: "", testimonial: "" });
                                    setEditingTestimonial(null);
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 text-danger">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestimonialsPage;