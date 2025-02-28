// app/conversations/[conversationId]/page.jsx
"use client";
import { useState, useEffect, use } from 'react'; // Import use
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';


const ConversationDetailPage = ({ params }) => {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const conversationId = use(params);

    useEffect(() => {
        const fetchConversation = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/conversations/${conversationId.conversationId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setConversation(data);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching conversation details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId.conversationId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!conversation) {
        return <div>Conversation not found.</div>;
    }

    return (
        <div className='chat-wrapper'>
            {/*  We're not showing the sidebar on the detail page  */}
            <div className='chat-main card'>
                <div className='chat-sidebar-single active'>
                    {/* Replace with actual user details if you have them */}
                    <div className='info'>
                        <h6 className='text-md mb-0'>Conversation with User: {conversation.user_id}</h6>
                        <p className='mb-0'>Conversation ID: {conversation.conversation_id}</p>
                    </div>
                    <div className='action d-inline-flex align-items-center gap-3'>
                        {/*  Remove call/video buttons, not relevant here  */}
                        <Link href="/conversations" className="text-blue-500 hover:underline">
                            <Icon icon="akar-icons:arrow-back" className="mr-1" /> Back to Conversations
                        </Link>
                    </div>
                </div>
                {/* chat-sidebar-single end */}
                <div className='chat-message-list'>
                    {conversation.chat_history.map((message, index) => (
                        <div key={index} className={`chat-single-message ${message.role === 'user' ? 'right' : 'left'}`}>
                            {/*  Add user image if you have it  */}
                            {message.role !== 'user' && (
                                <div className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'>
                                    <Icon icon="mdi:user-circle" className="text-4xl" />
                                </div>
                            )}
                            <div className='chat-message-content'>
                                <p className='mb-3'>{message.content}</p>
                                {/*  You might not have a separate timestamp for each message  */}
                                {/* <p className='chat-time mb-0'>
                  <span>6.30 pm</span>
                </p> */}
                            </div>
                        </div>
                    ))}
                </div>
                <form className='chat-message-box'>
                    <input type='text' name='chatMessage' placeholder='Write message' disabled /> {/* Disabled input */}
                    <div className='chat-message-box-action'>
                        {/*  Removed link/gallery buttons  */}
                        <button
                            type='submit'
                            className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
                            disabled // Disable the send button
                        >
                            Send
                            <Icon icon='f7:paperplane' />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConversationDetailPage;