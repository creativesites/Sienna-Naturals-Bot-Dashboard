"use client";
import { SignUp } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCopilotAction } from "@copilotkit/react-core";
import { motion } from "framer-motion";

export default function PremiumSignUpPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState("welcome");
    const [personalizedMessage, setPersonalizedMessage] = useState("Begin your journey to healthier, more beautiful natural hair");
    const [hairGoals, setHairGoals] = useState([]);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // CopilotKit Action for Hair Assessment
    useCopilotAction({
        name: "createHairProfile",
        description: "Creates a personalized hair profile and recommendations for new users",
        parameters: [
            {
                name: "hairType",
                type: "string",
                description: "User's hair type (3a, 3b, 3c, 4a, 4b, 4c, etc.)",
            },
            {
                name: "concerns",
                type: "string",
                description: "Main hair concerns (dryness, breakage, frizz, etc.)",
            },
            {
                name: "currentRoutine",
                type: "string",
                description: "Current hair care routine or products being used",
                required: false,
            },
            {
                name: "goals",
                type: "string", 
                description: "Hair goals and desired outcomes",
                required: false,
            }
        ],
        handler: async ({ hairType, concerns, currentRoutine, goals }) => {
            setIsLoading(true);
            setOnboardingStep("assessment");
            
            // Simulate AI hair analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const profileRecommendations = {
                "3a": {
                    routine: "Focus on lightweight moisturizing products and gentle cleansing",
                    products: "Curl enhancing cream, light leave-in conditioner, sulfate-free shampoo",
                    tips: "Scrunch drying, avoid heavy oils, use microfiber towel"
                },
                "3b": {
                    routine: "Balance moisture and protein with regular deep conditioning",
                    products: "Curl defining gel, moisturizing shampoo, weekly protein treatment",
                    tips: "Plopping method, regular trims, protective styling at night"
                },
                "3c": {
                    routine: "Heavy moisture focus with protective styling",
                    products: "Rich leave-in conditioner, curl butter, gentle co-wash",
                    tips: "Detangle when wet, use wide-tooth comb, seal with oil"
                },
                "4a": {
                    routine: "Moisture retention and gentle manipulation",
                    products: "Thick moisturizer, edge control, sulfate-free cleanser",
                    tips: "Protective styles, silk pillowcases, minimal heat styling"
                },
                "4b": {
                    routine: "Maximum moisture and gentle handling",
                    products: "Heavy cream moisturizer, natural oils, cleansing conditioner",
                    tips: "Stretch techniques, regular deep conditioning, gentle detangling"
                },
                "4c": {
                    routine: "Intensive moisture and protection focus",
                    products: "Rich butter-based products, natural oil blends, gentle cleansers",
                    tips: "Twist-outs, braid-outs, regular oil treatments, minimal manipulation"
                }
            };

            const recommendation = profileRecommendations[hairType?.toLowerCase()] || profileRecommendations["4a"];
            
            const personalizedPlan = `Based on your ${hairType} hair type and concerns about ${concerns}, I recommend: ${recommendation.routine}. 
            Key products: ${recommendation.products}. 
            Pro tips: ${recommendation.tips}. 
            ${goals ? `To achieve your goal of ${goals}, focus on consistent routines and patience.` : ''}`;
            
            setPersonalizedMessage(personalizedPlan);
            setHairGoals([hairType, concerns, goals].filter(Boolean));
            setOnboardingStep("recommendations");
            setIsLoading(false);
            
            return personalizedPlan;
        },
    });

    // CopilotKit Action for Platform Guidance
    useCopilotAction({
        name: "guideNewUser",
        description: "Provides onboarding guidance and explains platform features to new users",
        parameters: [
            {
                name: "question",
                type: "string", 
                description: "User's question about the platform or hair care",
            }
        ],
        handler: async ({ question }) => {
            setIsLoading(true);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const responses = {
                "how does this work": "Sienna Naturals uses AI to analyze your hair type, track your progress, and provide personalized product recommendations. You'll get a custom dashboard with insights and routine tracking.",
                "what makes this different": "We specialize in textured and natural hair with scientific backing. Our AI learns your unique hair patterns and adjusts recommendations based on your results and feedback.",
                "is this free": "We offer a comprehensive free tier with basic tracking and recommendations. Premium features include advanced analytics, expert consultations, and exclusive product access.",
                "how accurate": "Our hair analysis uses computer vision and machine learning trained on thousands of textured hair samples. Accuracy improves as you provide more data and feedback.",
                "products": "We partner with premium natural hair care brands and also offer our own scientifically-formulated products. All products are tested specifically for textured hair.",
                "privacy": "Your hair data and photos are encrypted and never shared. You control all data sharing preferences and can delete your information anytime."
            };
            
            const keywords = Object.keys(responses);
            const matchedKeyword = keywords.find(keyword => 
                question.toLowerCase().includes(keyword)
            );
            
            const response = matchedKeyword ? 
                responses[matchedKeyword] : 
                "I'm here to help you get started with Sienna Naturals! Ask me about how the platform works, hair analysis, products, or anything about natural hair care.";
            
            setPersonalizedMessage(response);
            setIsLoading(false);
            
            return response;
        },
    });

    // CopilotKit Action for Account Setup Assistance
    useCopilotAction({
        name: "assistAccountSetup",
        description: "Helps users with account creation issues and setup questions",
        parameters: [
            {
                name: "issue",
                type: "string",
                description: "The account setup issue or question",
            }
        ],
        handler: async ({ issue }) => {
            setIsLoading(true);
            
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            const setupHelp = {
                "email verification": "Check your email inbox and spam folder for the verification link. Click it to activate your account. If you don't see it, I can help you resend the verification.",
                "password requirements": "Your password needs at least 8 characters with a mix of letters, numbers, and symbols. Make it strong but memorable for your hair journey!",
                "profile picture": "You can add a profile picture later in settings. For hair analysis, we'll ask for specific hair photos with good lighting.",
                "social signup": "You can sign up with Google or Facebook for convenience. Your social data stays private and is only used for account creation.",
                "username": "Choose a username that represents you! It can be your name or something creative. You can change it later in your profile settings.",
                "notifications": "We'll send helpful reminders about your hair routine and new recommendations. You can customize all notification preferences after signup."
            };
            
            const keywords = Object.keys(setupHelp);
            const matchedKeyword = keywords.find(keyword => 
                issue.toLowerCase().includes(keyword.split(' ')[0])
            );
            
            const help = matchedKeyword ? 
                setupHelp[matchedKeyword] : 
                "I'm here to help with your account setup! Common questions include email verification, password requirements, or choosing a username. What specific issue are you experiencing?";
            
            setPersonalizedMessage(help);
            setIsLoading(false);
            
            return help;
        },
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="sienna-signup-container">
            <motion.div 
                className="sienna-signup-wrapper"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Left Panel - Onboarding Journey */}
                <motion.div className="sienna-signup-journey-panel" variants={itemVariants}>
                    <div className="journey-content">
                        {/* Header */}
                        <motion.div className="journey-header" variants={itemVariants}>
                            <div className="sienna-logo-container">
                                <Icon icon="solar:leaf-bold-duotone" className="sienna-logo-icon" />
                                <h1 className="sienna-brand-title">SIENNA NATURALS</h1>
                            </div>
                            <div className="brand-tagline">
                                <p>Your Natural Hair Journey Starts Here</p>
                            </div>
                        </motion.div>

                        {/* Journey Steps Indicator */}
                        <motion.div className="journey-steps" variants={itemVariants}>
                            <div className="steps-container">
                                <div className={`step ${onboardingStep === 'welcome' ? 'active' : onboardingStep !== 'welcome' ? 'completed' : ''}`}>
                                    <div className="step-icon">
                                        <Icon icon="solar:hand-heart-bold-duotone" />
                                    </div>
                                    <span className="step-label">Welcome</span>
                                </div>
                                <div className="step-connector"></div>
                                <div className={`step ${onboardingStep === 'assessment' ? 'active' : onboardingStep === 'recommendations' ? 'completed' : ''}`}>
                                    <div className="step-icon">
                                        <Icon icon="solar:chart-bold-duotone" />
                                    </div>
                                    <span className="step-label">Assessment</span>
                                </div>
                                <div className="step-connector"></div>
                                <div className={`step ${onboardingStep === 'recommendations' ? 'active' : ''}`}>
                                    <div className="step-icon">
                                        <Icon icon="solar:star-bold-duotone" />
                                    </div>
                                    <span className="step-label">Recommendations</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Personalized Message */}
                        <motion.div className="journey-message" variants={itemVariants}>
                            <div className="message-content">
                                <h2 className="message-title">
                                    {onboardingStep === 'welcome' && "Welcome to Your Hair Journey"}
                                    {onboardingStep === 'assessment' && "Analyzing Your Hair Profile"}
                                    {onboardingStep === 'recommendations' && "Your Personalized Plan"}
                                </h2>
                                <div className="message-text">
                                    {isLoading ? (
                                        <div className="ai-loading">
                                            <Icon icon="solar:loading-bold" className="loading-icon" />
                                            <span>AI Hair Expert is analyzing...</span>
                                        </div>
                                    ) : (
                                        <p>{personalizedMessage}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Hair Goals Display */}
                        {hairGoals.length > 0 && (
                            <motion.div className="hair-goals" variants={itemVariants}>
                                <h4 className="goals-title">Your Hair Profile</h4>
                                <div className="goals-tags">
                                    {hairGoals.map((goal, index) => (
                                        <span key={index} className="goal-tag">
                                            {goal}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Success Stories */}
                        <motion.div className="success-stories" variants={itemVariants}>
                            <h4 className="stories-title">Join Thousands of Natural Hair Enthusiasts</h4>
                            <div className="story-cards">
                                <div className="story-card">
                                    <div className="story-avatar">
                                        <Icon icon="solar:user-bold-duotone" />
                                    </div>
                                    <div className="story-content">
                                        <p>"Finally found products that work for my 4c hair!"</p>
                                        <span className="story-author">- Maya K.</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <div className="story-avatar">
                                        <Icon icon="solar:user-bold-duotone" />
                                    </div>
                                    <div className="story-content">
                                        <p>"The AI recommendations changed my hair routine completely."</p>
                                        <span className="story-author">- Zara M.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Time Widget */}
                        <motion.div className="journey-footer" variants={itemVariants}>
                            <div className="time-widget">
                                <div className="current-time">
                                    {currentTime.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                    })}
                                </div>
                                <div className="current-date">
                                    Start your journey today
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Background Elements */}
                    <div className="journey-background">
                        <div className="bg-pattern"></div>
                        <div className="floating-elements">
                            <div className="float-element element-1">
                                <Icon icon="solar:leaf-bold" />
                            </div>
                            <div className="float-element element-2">
                                <Icon icon="solar:heart-bold" />
                            </div>
                            <div className="float-element element-3">
                                <Icon icon="solar:star-bold" />
                            </div>
                            <div className="float-element element-4">
                                <Icon icon="solar:crown-bold" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel - Sign Up Form */}
                <motion.div className="sienna-signup-form-panel" variants={itemVariants}>
                    <div className="form-container">
                        {/* Form Header */}
                        <motion.div className="form-header" variants={itemVariants}>
                            <h2 className="form-title">Create Your Account</h2>
                            <p className="form-subtitle">
                                Join our community and unlock personalized hair care insights powered by AI.
                            </p>
                        </motion.div>

                        {/* CopilotKit Assistant Widgets */}
                        <motion.div className="copilot-widgets" variants={itemVariants}>
                            <div className="assistant-widget primary">
                                <div className="assistant-header">
                                    <Icon icon="solar:magic-stick-3-bold-duotone" className="assistant-icon" />
                                    <span className="assistant-label">AI Hair Assessment</span>
                                    <div className="assistant-status">
                                        <div className="status-dot"></div>
                                        <span>Ready</span>
                                    </div>
                                </div>
                                <div className="assistant-description">
                                    Get instant hair analysis and personalized recommendations after signup.
                                </div>
                            </div>

                            <div className="assistant-widget secondary">
                                <div className="assistant-header">
                                    <Icon icon="solar:question-circle-bold-duotone" className="assistant-icon" />
                                    <span className="assistant-label">Setup Assistant</span>
                                    <div className="assistant-status">
                                        <div className="status-dot"></div>
                                        <span>Online</span>
                                    </div>
                                </div>
                                <div className="assistant-description">
                                    Need help with account creation or have questions? Just ask!
                                </div>
                            </div>
                        </motion.div>

                        {/* Clerk Sign Up Component */}
                        <motion.div className="clerk-signup-container" variants={itemVariants}>
                            <SignUp 
                                appearance={{
                                    elements: {
                                        rootBox: "sienna-clerk-root",
                                        card: "sienna-clerk-card",
                                        headerTitle: "sienna-clerk-title",
                                        headerSubtitle: "sienna-clerk-subtitle", 
                                        socialButtons: "sienna-clerk-social",
                                        formButtonPrimary: "sienna-btn sienna-btn-primary",
                                        formFieldInput: "sienna-form-control",
                                        formFieldLabel: "sienna-form-label",
                                        footerAction: "sienna-clerk-footer",
                                        identityPreview: "sienna-clerk-preview",
                                        formResendCodeLink: "sienna-link-primary"
                                    },
                                    variables: {
                                        colorPrimary: "#91A996",
                                        colorText: "#131A19", 
                                        colorTextSecondary: "#817F7E",
                                        colorBackground: "#FFFFFF",
                                        colorInputBackground: "#FFFFFF",
                                        colorInputText: "#131A19",
                                        borderRadius: "8px",
                                        fontFamily: "'Helvetica Neue', Arial, sans-serif"
                                    }
                                }}
                            />
                        </motion.div>

                        {/* Benefits Highlight */}
                        <motion.div className="signup-benefits" variants={itemVariants}>
                            <div className="benefits-header">
                                <Icon icon="solar:gift-bold-duotone" className="benefits-icon" />
                                <span className="benefits-title">What You'll Get</span>
                            </div>
                            <div className="benefits-list">
                                <div className="benefit-item">
                                    <Icon icon="solar:check-circle-bold" className="benefit-icon" />
                                    <span>Personalized hair analysis</span>
                                </div>
                                <div className="benefit-item">
                                    <Icon icon="solar:check-circle-bold" className="benefit-icon" />
                                    <span>Product recommendations</span>
                                </div>
                                <div className="benefit-item">
                                    <Icon icon="solar:check-circle-bold" className="benefit-icon" />
                                    <span>Progress tracking tools</span>
                                </div>
                                <div className="benefit-item">
                                    <Icon icon="solar:check-circle-bold" className="benefit-icon" />
                                    <span>Expert community access</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Footer */}
                        <motion.div className="form-footer" variants={itemVariants}>
                            <div className="footer-links">
                                <div className="footer-item">
                                    <Icon icon="solar:shield-check-bold-duotone" className="footer-icon" />
                                    <span>Already have an account? <a href="/sign-in" className="sienna-link-primary">Sign in here</a></span>
                                </div>
                                <div className="footer-privacy">
                                    <span>By signing up, you agree to our Terms and Privacy Policy. Your hair data is always private and secure.</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Custom Styles */}
            <style jsx>{`
                .sienna-signup-container {
                    min-height: 100vh;
                    background: var(--sienna-gradient-pearl);
                    font-family: var(--sienna-font-primary);
                    overflow: hidden;
                    position: relative;
                }

                .sienna-signup-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 100vh;
                    max-width: 1600px;
                    margin: 0 auto;
                    box-shadow: var(--sienna-shadow-luxury);
                }

                /* Journey Panel Styles */
                .sienna-signup-journey-panel {
                    background: linear-gradient(135deg, var(--sienna-sage) 0%, var(--sienna-charcoal) 100%);
                    color: var(--sienna-white);
                    position: relative;
                    padding: 3rem;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }

                .journey-content {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .journey-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .sienna-logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }

                .sienna-logo-icon {
                    font-size: 2.5rem;
                    color: var(--sienna-white);
                    filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.2));
                }

                .sienna-brand-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: var(--sienna-white);
                    margin: 0;
                }

                .brand-tagline p {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.95rem;
                    margin: 0;
                    font-weight: 500;
                }

                /* Journey Steps */
                .journey-steps {
                    margin-bottom: 2rem;
                }

                .steps-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: var(--sienna-radius-lg);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                    transition: all var(--sienna-transition-medium);
                }

                .step-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1.2rem;
                    transition: all var(--sienna-transition-medium);
                }

                .step.active .step-icon {
                    background: var(--sienna-white);
                    color: var(--sienna-sage);
                    border-color: var(--sienna-white);
                    transform: scale(1.1);
                }

                .step.completed .step-icon {
                    background: var(--sienna-emerald);
                    color: var(--sienna-white);
                    border-color: var(--sienna-emerald);
                }

                .step-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .step.active .step-label {
                    color: var(--sienna-white);
                }

                .step-connector {
                    height: 2px;
                    background: rgba(255, 255, 255, 0.2);
                    flex: 1;
                    margin: 0 1rem;
                }

                /* Journey Message */
                .journey-message {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--sienna-radius-lg);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .message-title {
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: var(--sienna-white);
                }

                .message-text {
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                .ai-loading {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--sienna-white);
                }

                .loading-icon {
                    animation: spin 1s linear infinite;
                }

                /* Hair Goals */
                .hair-goals {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--sienna-radius-md);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .goals-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: var(--sienna-white);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .goals-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .goal-tag {
                    padding: 0.25rem 0.75rem;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--sienna-white);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                /* Success Stories */
                .success-stories {
                    margin-bottom: 2rem;
                }

                .stories-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: var(--sienna-white);
                    text-align: center;
                }

                .story-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .story-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--sienna-radius-md);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .story-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--sienna-white);
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .story-content p {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0 0 0.25rem 0;
                    font-style: italic;
                }

                .story-author {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 500;
                }

                /* Journey Footer */
                .journey-footer {
                    text-align: center;
                }

                .time-widget {
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--sienna-radius-md);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .current-time {
                    font-family: var(--sienna-font-mono);
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--sienna-white);
                    margin-bottom: 0.25rem;
                }

                .current-date {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                }

                /* Background Elements */
                .journey-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                }

                .bg-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
                    pointer-events: none;
                }

                .floating-elements {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }

                .float-element {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.15);
                    font-size: 1.5rem;
                    animation: float 8s ease-in-out infinite;
                }

                .element-1 { top: 15%; left: 8%; animation-delay: 0s; }
                .element-2 { top: 35%; right: 10%; animation-delay: 2s; }
                .element-3 { bottom: 35%; left: 15%; animation-delay: 4s; }
                .element-4 { bottom: 15%; right: 8%; animation-delay: 6s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
                    50% { transform: translateY(-15px) rotate(180deg); opacity: 0.6; }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Form Panel Styles */
                .sienna-signup-form-panel {
                    background: var(--sienna-white);
                    padding: 3rem;
                    display: flex;
                    align-items: center;
                    position: relative;
                    overflow-y: auto;
                }

                .form-container {
                    width: 100%;
                    max-width: 450px;
                    margin: 0 auto;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .form-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--sienna-charcoal);
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.02em;
                }

                .form-subtitle {
                    color: var(--sienna-terra);
                    line-height: 1.5;
                    margin: 0;
                    font-size: 0.95rem;
                }

                /* CopilotKit Widgets */
                .copilot-widgets {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .assistant-widget {
                    border-radius: var(--sienna-radius-md);
                    padding: 1rem;
                    transition: all var(--sienna-transition-medium);
                }

                .assistant-widget.primary {
                    background: linear-gradient(135deg, rgba(145, 169, 150, 0.15) 0%, rgba(45, 90, 39, 0.05) 100%);
                    border: 1px solid var(--sienna-sage);
                }

                .assistant-widget.secondary {
                    background: linear-gradient(135deg, rgba(129, 127, 126, 0.08) 0%, rgba(184, 134, 11, 0.05) 100%);
                    border: 1px solid rgba(129, 127, 126, 0.2);
                }

                .assistant-widget:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--sienna-shadow-soft);
                }

                .assistant-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .assistant-icon {
                    font-size: 1.1rem;
                }

                .assistant-widget.primary .assistant-icon {
                    color: var(--sienna-emerald);
                }

                .assistant-widget.secondary .assistant-icon {
                    color: var(--sienna-copper);
                }

                .assistant-label {
                    font-weight: 600;
                    color: var(--sienna-charcoal);
                    font-size: 0.9rem;
                }

                .assistant-status {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--sienna-emerald);
                }

                .status-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: var(--sienna-emerald);
                    animation: pulse 2s infinite;
                }

                .assistant-description {
                    font-size: 0.8rem;
                    color: var(--sienna-terra);
                    line-height: 1.4;
                }

                /* Signup Benefits */
                .signup-benefits {
                    margin-bottom: 1.5rem;
                    padding: 1.5rem;
                    background: rgba(145, 169, 150, 0.05);
                    border-radius: var(--sienna-radius-md);
                    border: 1px solid rgba(145, 169, 150, 0.2);
                }

                .benefits-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .benefits-icon {
                    color: var(--sienna-sage);
                    font-size: 1.1rem;
                }

                .benefits-title {
                    font-weight: 600;
                    color: var(--sienna-charcoal);
                    font-size: 0.9rem;
                }

                .benefits-list {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }

                .benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: var(--sienna-terra);
                }

                .benefit-icon {
                    color: var(--sienna-emerald);
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }

                /* Form Footer */
                .form-footer {
                    border-top: 1px solid rgba(129, 127, 126, 0.2);
                    padding-top: 1.5rem;
                }

                .footer-links {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .footer-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--sienna-terra);
                }

                .footer-icon {
                    color: var(--sienna-sage);
                    font-size: 1rem;
                }

                .footer-privacy {
                    font-size: 0.75rem;
                    color: rgba(129, 127, 126, 0.8);
                    line-height: 1.4;
                    text-align: center;
                }

                .sienna-link-primary {
                    color: var(--sienna-sage);
                    text-decoration: none;
                    font-weight: 600;
                    transition: color var(--sienna-transition-fast);
                }

                .sienna-link-primary:hover {
                    color: var(--sienna-charcoal);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .sienna-signup-wrapper {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                    }

                    .sienna-signup-journey-panel {
                        padding: 2rem;
                        min-height: 45vh;
                    }

                    .success-stories {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .sienna-signup-journey-panel,
                    .sienna-signup-form-panel {
                        padding: 1.5rem;
                    }

                    .form-title {
                        font-size: 1.5rem;
                    }

                    .sienna-brand-title {
                        font-size: 1.4rem;
                    }

                    .benefits-list {
                        grid-template-columns: 1fr;
                    }

                    .steps-container {
                        padding: 1rem;
                    }

                    .step-label {
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </div>
    );
}

