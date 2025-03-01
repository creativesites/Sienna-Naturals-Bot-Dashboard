
"use client";
import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import randomName from "@scaleway/random-name";

const ChatMessageLayer = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/conversations?search=${searchQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConversations(data);
        // If there are conversations, select the first one by default.
        if (data.length > 0) {
          setSelectedConversation(data[0]);
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [searchQuery]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  const renderButtons = (buttons) => {
    if (!buttons) {
      return null;
    }
    return (
        <div className="km-cta-multi-button-container">
          {buttons.map((button, buttonIndex) => (
              <button
                  key={buttonIndex}
                  className="km-cta-button km-link-button km-custom-widget-text-color km-undecorated-link km-carousel-card-button"
                  // Use onClick for buttons without a URL, or Link for buttons with a URL
                  {...(button.action?.type === 'link' && button.action.payload?.url ? {
                    onClick: () => window.open(button.action.payload.url, '_blank', 'noopener noreferrer')
                  } : {
                    onClick: () => console.log("Button clicked, no URL", button) // Placeholder action
                  })
                  }

                  title={button.name}
              >
                {button.name}
                {/* Optional: Add an icon if your button design includes one */}
                <span>
                <svg width="12" height="12" viewBox="0 0 12 12">
                <path className="km-custom-widget-stroke" fill="none" stroke="#5553B7" d="M8.111 5.45v2.839A.711.711 0 0 1 7.4 9H1.711A.711.711 0 0 1 1 8.289V2.6a.71.71 0 0 1 .711-.711H4.58M5.889 1h2.667C8.8 1 9 1.199 9 1.444v2.667m-.222-2.889L4.503 5.497"></path>
                </svg>
              </span>
              </button>
          ))}
        </div>
    );
  };

  const renderCard = (contentItem) => {
    const { header, title, subtitle, description, buttons } = contentItem;
    return (
        <div key={contentItem.message} id="tns2-mw" className="tns-ovh">
          <div className="tns-inner" id="tns2-iw" style={{ margin: "0px" }}>
            <div className="mck-msg-box-rich-text-container km-card-message-container  km-div-slider  tns-slider tns-carousel tns-subpixel tns-calc tns-horizontal" id="tns2" style={{ transitionDuration: "0s", transform: "translate3d(0%, 0px, 0px)" }}>
              <div className="km-carousel-card-template km-single-card tns-item tns-slide-active" id="tns2-item0">
                <div className="km-carousel-card-header-container">

                  {header?.imgSrc && <div className="km-carousel-card-header km-carousel-card-header-with-img"><img className="km-carousel-card-img" src={header.imgSrc} />
                    <div className="n-vis"></div>
                  </div>}
                  <div className="km-carousel-card-content-wrapper  km-carousel-card-info-wrapper-with-buttons"><div className="km-carousel-card-title-wrapper">
                    <div className="km-carousel-card-title" title={title}>{title}</div>
                    <div className="km-carousel-card-title-extension"></div>
                  </div>
                    <div className="km-carousel-card-sub-title" title={subtitle}>{subtitle}</div>
                    <div className="km-carousel-card-description-wrapper"><div className="km-carousel-card-description" title={description}>{description}</div></div></div>
                </div>
                <div className="km-carousel-card-footer">
                  {renderButtons(buttons)}
                </div>
              </div>
            </div>
          </div>
        </div>
    );

  }
  // Function to safely render message content
  const renderMessageContent = (message) => {
    if (message.role === 'user') {
      // User messages: Remove timestamp and "User Said:"
      return <p className='mb-3'>{message.content.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - User Said: /, '')}</p>;
    } else if (message.role === 'assistant' && Array.isArray(message.content)) {
      // Assistant messages can be an array of objects
      return message.content.map((contentItem, index) => {
        if (typeof contentItem.message === 'string' && contentItem.message.startsWith('<html>')) {
          // Render HTML content
          return <div key={index} dangerouslySetInnerHTML={{ __html: contentItem.message }} />;
        }  else if (typeof contentItem === 'string') {
          return <p key={index} className='mb-3'>{contentItem}</p>;
        } else if (typeof contentItem.message === 'string') {
          // Handle cases where contentItem.message exists
          return <p key={index} className='mb-3'>{contentItem.message}</p>
        } else if(contentItem.metadata?.templateId === '10'){
          return renderCard(contentItem)
        }
        return null;
      });
    }
    return null; // Or some default content if the structure doesn't match
  };
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
                <div
                    key={conversation.conversation_id}
                    className={`chat-sidebar-single ${selectedConversation?.conversation_id === conversation.conversation_id ? 'active' : ''}`}
                    onClick={() => handleConversationClick(conversation)}
                    style={{ cursor: 'pointer' }}
                >
                  {/* Placeholder for user image */}
                  <div className='img'>
                    <Icon icon="mdi:user-circle" className="text-4xl" />
                  </div>
                  <div className='info'>
                    {/* Display user name if available, otherwise user ID */}
                    <h6 className='text-sm mb-1'>{conversation.user_name || `User ID: ${conversation.user_id}`}</h6>
                    <p className='mb-0 text-xs'>{conversation.summary || 'No summary available'}</p>
                  </div>
                  <div className='action text-end'>
                    <p className='mb-0 text-neutral-400 text-xs lh-1'>
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </div>
        <div className='chat-main card'>
          <div className='chat-sidebar-single active'>
            <div className='info'>
              <h6 className='text-md mb-0'>
                {/* Display user name if available */}
                {selectedConversation ? (selectedConversation.user_name || `Conversation with User: ${selectedConversation.user_id}`) : 'Select a Conversation'}
              </h6>
              <p className='mb-0'>
                {selectedConversation ? `Conversation ID: ${selectedConversation.conversation_id}` : ''}
              </p>
            </div>
            <div className='action d-inline-flex align-items-center gap-3'>
              {/* Removed unnecessary buttons */}
            </div>
          </div>
          <div className='chat-message-list'>
            {selectedConversation && selectedConversation.chat_history ? (
                selectedConversation.chat_history.map((message, index) => {
                  // Parse the timestamp ONLY for user messages.  For assistant messages,
                  // we'll use the conversation's creation date (or you could add a timestamp
                  // to the assistant messages in the database if you need more precise timing).
                  const messageTime = message.role === 'user'
                      ? new Date(message.content.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)?.[0] || selectedConversation.created_at)
                      : new Date(selectedConversation.created_at); // Use conversation creation time for assistant

                  return (
                      <div key={index} className={`chat-single-message ${message.role === 'user' ? 'right' : 'left'}`}>
                        {message.role !== 'user' && (
                            <div className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'>
                              <Icon icon="mdi:user-circle" className="text-4xl" />
                            </div>
                        )}
                        <div className='chat-message-content'>
                          {renderMessageContent(message)}
                          <p className='chat-time mb-0'>
                            <span>{messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>
                      </div>
                  );
                })
            ) : (
                <p>Select a conversation to view details.</p>
            )}
          </div>
          <form className='chat-message-box'>
            <input type='text' name='chatMessage' placeholder='Write message' disabled />
            <div className='chat-message-box-action'>
              <button
                  type='submit'
                  className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
                  disabled
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

