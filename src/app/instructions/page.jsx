"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

const InstructionsPage = () => {
    const router = useRouter();

    // State for the bot instructions
    const [instruction, setInstruction] = useState({
        instruction_id: null,
        instruction_text: "",
        category: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the bot instructions on page load
    useEffect(() => {
        const fetchInstructions = async () => {
            try {
                const response = await fetch("/api/bot-instructions");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.instruction) {
                    setInstruction(data.instruction); // Set the single instruction
                } else {
                    setError("Bot instructions not found");
                }
            } catch (error) {
                setError(error.message);
                console.error("Error fetching bot instructions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructions();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInstruction((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Send a PUT request to update the bot instructions
            const response = await fetch("/api/bot-instructions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(instruction),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to update bot instructions");
            }

            // Redirect to the instructions page after successful update
            router.push("/instructions");
        } catch (error) {
            setError(error.message);
            console.error("Error updating bot instructions:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center gap-8 pb-24">
                <p>
                    <strong>Loading Bot Instructions...</strong>
                </p>
                <Icon icon="eos-icons:loading" className="icon" />
            </div>
        );
    }

    return (
        <MasterLayout>
            <Breadcrumb title='Additional Bot Instructions' />
            {loading? 
                <div className='d-flex align-items-center justify-content-between gap-8 pb-24' 
                style={{
                    display:'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                >
                    <p><strong>Loading Product</strong></p>
                        <Hearts
                            height="80"
                            width="80"
                            color="#4fa94d"
                            ariaLabel="hearts-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                    </div>:
                <div className="row gy-4">
                    <div className='col-xxl-9 col-lg-8'>
                        <div className='card h-100 p-0 radius-12'>
                            <div className='card-body py-32'>
                                <div>
                                   
                                    <form onSubmit={handleSubmit}>
                                    <h1 className="text-2xl font-bold mb-4">Additional Bot Instructions</h1>
                                        {/* Instruction Text */}
                                        <div className="mb-4">
                                            <label className="form-label">Instruction Text</label>
                                            <textarea
                                                name="instruction_text"
                                                value={instruction.instruction_text}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows={5}
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="mb-4">
                                            <label className="form-label">Category</label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={instruction.category}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                readOnly
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="btn rounded-pill btn-primary-600 radius-8 px-20 py-11 d-flex align-items-center gap-2 mt-24"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="d-flex align-items-center gap-2">
                                                    <Icon icon="eos-icons:loading" className="icon" />
                                                    Updating...
                                                </span>
                                            ) : (
                                                "Update Instructions"
                                            )}
                                        </button>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="mt-4 text-danger">
                                                <strong>Error:</strong> {error}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-3 col-lg-4">
                        <div className="card h-100">
                            <img
                                src="https://www.siennanaturals.com/cdn/shop/files/DNA_desktop_1600x.png"
                                className="card-img-top"
                                alt="Additional Bot Instructions"
                            />
                            <div className="card-body px-24">
                                <h5 className="card-title text-lg text-primary-light mb-6">
                                    Additional Bot Instructions
                                </h5>
                                <p className="card-text text-neutral-600">
                                    Use this section to add or update custom instructions for the bot. 
                                    These instructions will guide the bot's behavior and responses. 
                                    Ensure the instructions are clear and concise for optimal performance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </MasterLayout>
        
    );
};

export default InstructionsPage;