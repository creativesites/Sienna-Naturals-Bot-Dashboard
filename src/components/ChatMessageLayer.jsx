
"use client";
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';


const ChatMessageLayer = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state
  const [selectedConversation, setSelectedConversation] = useState(null); // Add selected conversation state

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Include the search query in the API request
        const response = await fetch(`/api/conversations?search=${searchQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [searchQuery]); // Refetch when searchQuery changes

  // New useEffect for fetching conversation details
  useEffect(() => {
    const fetchConversationDetails = async (conversationId) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSelectedConversation(data);
      } catch (error) {
        console.error("Error fetching conversation details:", error);
        // Optionally set an error state specific to detail fetching
      }
    };

    if (selectedConversation) {
      fetchConversationDetails(selectedConversation.conversation_id);
    }
  }, [selectedConversation?.conversation_id]); // Dependency on conversationId

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation); // Optimistically set, then fetch details
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
      <div className='chat-wrapper'>
        <div className='chat-sidebar card'>
          <div className='chat-search'>
          <span className='icon'>
            <Icon icon='iconoir:search' />
          </span>
            <input
                type='text'
                name='search'
                autoComplete='off'
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className='chat-all-list'>
            {conversations.map((conversation) => (
                // REMOVE THE LINK, and add onClick
                <div
                    key={conversation.conversation_id}
                    className={`chat-sidebar-single ${selectedConversation?.conversation_id === conversation.conversation_id ? 'active' : ''}`}
                    onClick={() => handleConversationClick(conversation)}
                    style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
                >
                  {/* You'll likely want to fetch user details (like name and image) separately */}
                  {/* <div className='img'>
                    <img src='assets/images/chat/2.png' alt='image_icon' />
                </div> */}
                  <div className='info'>
                    <h6 className='text-sm mb-1'>User ID: {conversation.user_id}</h6>
                    <p className='mb-0 text-xs'>{conversation.summary || 'No summary available'}</p>
                  </div>
                  <div className='action text-end'>
                    <p className='mb-0 text-neutral-400 text-xs lh-1'>
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                    {/* You might not have a notification count, so remove or replace this: */}
                    {/* <span className='w-16-px h-16-px text-xs rounded-circle bg-warning-main text-white d-inline-flex align-items-center justify-content-center'>
                    8
                    </span> */}
                  </div>
                </div>
            ))}
          </div>
        </div>
        <div className='chat-main card'>
          <div className='chat-sidebar-single active'>
            {/* Replace with actual user details if you have them */}
            <div className='info'>
              <h6 className='text-md mb-0'>
                {selectedConversation ? `Conversation with User: ${selectedConversation.user_id}` : 'Select a Conversation'}
              </h6>
              <p className='mb-0'>
                {selectedConversation ? `Conversation ID: ${selectedConversation.conversation_id}` : ''}
              </p>
            </div>
            <div className='action d-inline-flex align-items-center gap-3'>
              {/*  Remove call/video buttons, not relevant here  */}

            </div>
          </div>
          <div className='chat-message-list'>
            {selectedConversation?.chat_history?.length && selectedConversation ? (
                selectedConversation.chat_history.map((message, index) => (
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
                ))
            ) : (
                <p>Select a conversation to view details.</p>
            )}
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
export default ChatMessageLayer;

