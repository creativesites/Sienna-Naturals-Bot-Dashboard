"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
// import {
//   useCopilotReadable,
//   useCopilotAction,
// } from "@copilotkit/react-core";
// import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { CopilotTextarea } from "@copilotkit/react-textarea";
import "@copilotkit/react-textarea/styles.css";
import DataTable from "@/components/chatbot/DataTable";
import dynamic from "next/dynamic";
import { useDownloadExcel } from "react-export-table-to-excel";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { htmlToText } from "html-to-text";
import { toast } from "react-toastify";



const ChatMessageLayer = ({ user_id }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(user_id || "");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isCorrectionMode, setCorrectionMode] = useState(false);
  const [isCorrectionModalOpen, setCorrectionModalOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [corrections, setCorrections] = useState({}); // Store corrections as { conversation_id: [{ id, message_index, correction_note, ... }] }
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'recent', 'corrected', 'long'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_asc', 'date_desc', 'messages_count'

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
        console.log('convs data: ', data)
        const processedData = data.map(conv => ({
          ...conv,
          chat_history: processAndCleanChatHistory(conv.chat_history || [])
        }));
        setConversations(processedData);
        setFilteredConversations(processedData);

        // Fetch corrections for all conversations
        const correctionPromises = data.map(conv =>
          fetch(`/api/corrections?conversation_id=${conv.conversation_id}`)
            .then(res => res.json())
            .then(res => ({ [conv.conversation_id]: res.corrections || [] }))
        );
        const correctionResults = await Promise.all(correctionPromises);
        const correctionMap = Object.assign({}, ...correctionResults);
        setCorrections(correctionMap);

        if (processedData.length > 0) {
          setSelectedConversation(processedData[0]);
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

  // Function to process and clean chat history
  const processAndCleanChatHistory = (chatHistory) => {
    const cleanedHistory = [];
    const seenSystemMessages = new Set();

    for (const message of chatHistory) {
      // Skip duplicate system messages
      if (message.role === 'system') {
        const messageKey = JSON.stringify(message.content);
        if (seenSystemMessages.has(messageKey)) {
          continue;
        }
        seenSystemMessages.add(messageKey);
      }

      // Process user messages
      if (message.role === 'user') {
        const cleanedContent = message.content.replace(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - User Said: /,
          ''
        );
        cleanedHistory.push({
          ...message,
          content: cleanedContent,
          timestamp: extractTimestampFromUserMessage(message.content)
        });
      }
      // Process assistant messages
      else if (message.role === 'assistant') {
        try {
          const parsedContent = typeof message.content === 'string' && message.content.startsWith('{') 
            ? JSON.parse(message.content)
            : message.content;
          
          let processedContent = parsedContent;
          
          // If it's the parsed JSON structure with messages array
          if (parsedContent && parsedContent.messages && Array.isArray(parsedContent.messages)) {
            processedContent = parsedContent.messages.map(msg => {
              if (msg.messageType === 'html' && msg.payload && msg.payload.message) {
                return {
                  message: msg.payload.message,
                  messageType: 'html'
                };
              }
              return msg;
            });
          }
          
          cleanedHistory.push({
            ...message,
            content: processedContent
          });
        } catch (error) {
          // If parsing fails, keep original content
          cleanedHistory.push(message);
        }
      }
      // Keep other message types as-is
      else {
        cleanedHistory.push(message);
      }
    }

    return cleanedHistory;
  };

  // Extract timestamp from user message
  const extractTimestampFromUserMessage = (content) => {
    const match = content.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
    return match ? match[1] : null;
  };

  // Filter and sort conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.user_name && conv.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        conv.conversation_id.includes(searchQuery) ||
        conv.chat_history.some(msg => 
          msg.content && typeof msg.content === 'string' && 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'recent':
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(conv => new Date(conv.created_at) > twentyFourHoursAgo);
        break;
      case 'corrected':
        filtered = filtered.filter(conv => corrections[conv.conversation_id]?.length > 0);
        break;
      case 'long':
        filtered = filtered.filter(conv => conv.chat_history.length > 10);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'messages_count':
        filtered.sort((a, b) => b.chat_history.length - a.chat_history.length);
        break;
      default:
        break;
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, filterBy, sortBy, corrections]);

  // useCopilotReadable({
  //   description: `Selected conversation: User ID: ${selectedConversation?.user_id}, Conversation ID: ${selectedConversation?.conversation_id}`,
  //   value: selectedConversation?.chat_history,
  // });

  // useCopilotChatSuggestions(
  //   {
  //     instructions: `You're viewing a specific conversation between the Myavana chatbot and a user. Based on the chat history, suggest 1–2 relevant next actions such as summarizing this conversation, identifying key hair concerns, recommending products, or exporting for training data.`,
  //     minSuggestions: 1,
  //     maxSuggestions: 2,
  //   },
  //   [selectedConversation?.chat_history]
  // );

  // useCopilotAction({
  //   name: "identifyHairConcerns",
  //   description: "Identify key hair concerns in the selected conversation",
  //   parameters: [],
  //   handler: async () => {
  //     if (!selectedConversation) return "No conversation selected.";
  //     try {
  //       const response = await fetch(
  //         `/api/conversation-concerns?conversation_id=${selectedConversation.conversation_id}`
  //       );
  //       const data = await response.json();
  //       return `Key hair concerns: ${
  //         data.concerns.join(", ") || "None identified."
  //       }`;
  //     } catch (error) {
  //       return "Error identifying hair concerns.";
  //     }
  //   },
  //   render: ({ status, result }) => (
  //     <div className="myavana-copilot-card">
  //       <span>HAIR CONCERNS</span>
  //       <p>
  //         {status === "complete" && result
  //           ? result
  //           : "Identifying hair concerns..."}
  //       </p>
  //     </div>
  //   ),
  // });

  // useCopilotAction({
  //   name: "recommendProducts1",
  //   description: "Recommend Myavana products based on the selected conversation",
  //   parameters: [],
  //   handler: async () => {
  //     if (!selectedConversation) return "No conversation selected.";
  //     try {
  //       const response = await fetch(
  //         `/api/conversation-concerns?conversation_id=${selectedConversation.conversation_id}`
  //       );
  //       const data = await response.json();
  //       const suggestions = {
  //         dryness: "Myavana Hydrating Shampoo",
  //         breakage: "Myavana Strengthening Conditioner",
  //       };
  //       const products = data.concerns
  //         .map((concern) => suggestions[concern] || `No product for ${concern}`)
  //         .filter(Boolean);
  //       return `Recommended products: ${products.join(", ") || "None"}`;
  //     } catch (error) {
  //       return "Error recommending products.";
  //     }
  //   },
  //   render: ({ status, result }) => (
  //     <div className="myavana-copilot-card">
  //       <span>PRODUCT RECOMMENDATIONS</span>
  //       <p>
  //         {status === "complete" && result
  //           ? result
  //           : "Recommending products..."}
  //       </p>
  //     </div>
  //   ),
  // });

  // useCopilotAction({
  //   name: "exportForTraining1",
  //   description: "Export the selected conversation for bot training",
  //   parameters: [],
  //   handler: async () => {
  //     if (!selectedConversation) return "No conversation selected.";
  //     try {
  //       const response = await fetch(`/api/training-data`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           conversation_id: selectedConversation.conversation_id,
  //         }),
  //       });
  //       return response.ok
  //         ? "Conversation exported for training."
  //         : "Error exporting conversation.";
  //     } catch (error) {
  //       return "Error exporting for training.";
  //     }
  //   },
  //   render: ({ status, result }) => (
  //     <div className="myavana-copilot-card">
  //       <span>EXPORT FOR TRAINING</span>
  //       <p>
  //         {status === "complete" && result ? result : "Exporting conversation..."}
  //       </p>
  //     </div>
  //   ),
  // });

  // useCopilotAction({
  //   name: "generateConversationReport1",
  //   description: "Generate a report on all conversations",
  //   parameters: [
  //     {
  //       name: "timeframe",
  //       type: "string",
  //       description: "Timeframe for analysis (e.g., 'weekly', 'monthly')",
  //       enum: ["weekly", "monthly"],
  //       required: true,
  //     },
  //   ],
  //   handler: async ({ timeframe }) => {
  //     try {
  //       const response = await fetch(`/api/conversations?timeframe=${timeframe}`);
  //       const data = await response.json();
  //       const totalMessages = data.reduce(
  //         (sum, conv) => sum + (conv.chat_history?.length || 0),
  //         0
  //       );
  //       return `Conversation Report (${timeframe}): ${data.length} conversations, ${totalMessages} messages.`;
  //     } catch (error) {
  //       return "Error generating report.";
  //     }
  //   },
  //   render: ({ status, result, args }) => (
  //     <div className="myavana-copilot-card">
  //       <span>CONVERSATION REPORT</span>
  //       <p>
  //         {status === "complete" && result
  //           ? result
  //           : `Generating report for ${args.timeframe}...`}
  //       </p>
  //     </div>
  //   ),
  // });

  // useCopilotAction({
  //   name: "displayConversationsTable1",
  //   description: "Display a table of conversations for a timeframe",
  //   parameters: [
  //     {
  //       name: "timeframe",
  //       type: "string",
  //       description: "Timeframe for analysis (e.g., 'weekly', 'monthly')",
  //       enum: ["weekly", "monthly"],
  //       required: true,
  //     },
  //   ],
  //   handler: async ({ timeframe }) => {
  //     try {
  //       const response = await fetch(`/api/conversations?timeframe=${timeframe}`);
  //       const data = await response.json();
  //       const tableData = data.map((conv) => ({
  //         "User ID": conv.user_id,
  //         "User Name": conv.user_name || "N/A",
  //         Messages: conv.chat_history?.length || 0,
  //         Date: new Date(conv.created_at).toLocaleDateString(),
  //       }));
  //       return { tableData };
  //     } catch (error) {
  //       return { error: "Error fetching conversations data." };
  //     }
  //   },
  //   render: ({ status, result, args }) => {
  //     if (status !== "complete" || !result || result.error) {
  //       return (
  //         <div className="myavana-copilot-card">
  //           <span>CONVERSATIONS TABLE</span>
  //           <p>
  //             {result?.error ||
  //               `Fetching conversations for ${args.timeframe}...`}
  //           </p>
  //         </div>
  //       );
  //     }

  //     return (
  //       <div className="myavana-copilot-card">
  //         <span>CONVERSATIONS TABLE</span>
  //         <DataTable
  //           headers={["User ID", "User Name", "Messages", "Date"]}
  //           data={result.tableData}
  //           title={`Conversations (${args.timeframe})`}
  //         />
  //       </div>
  //     );
  //   },
  // });

  // useCopilotAction({
  //   name: "flagChatsForTraining1",
  //   description: "Identify conversations suitable for bot training",
  //   parameters: [],
  //   handler: async () => {
  //     try {
  //       const response = await fetch(
  //         "/api/conversations?training_flagged=true"
  //       );
  //       const data = await response.json();
  //       return `Chats flagged for training: ${
  //         data
  //           .map(
  //             (conv) =>
  //               `Conversation ${conv.conversation_id} (${
  //                 conv.user_name || conv.user_id
  //               })`
  //           )
  //           .join(", ") || "None"
  //       }`;
  //     } catch (error) {
  //       return "Error identifying chats for training.";
  //     }
  //   },
  //   render: ({ status, result }) => (
  //     <div className="myavana-copilot-card">
  //       <span>CHATS FOR TRAINING</span>
  //       <p>{status === "complete" && result ? result : "Identifying chats..."}</p>
  //     </div>
  //   ),
  // });
  // Update corrections after saving a new one
  const handleSaveCorrection = async () => {
    if (!selectedConversation || currentMessageIndex === null || !correctionNote) return;

    try {
      const response = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConversation.conversation_id,
          message_index: currentMessageIndex,
          correction_note: correctionNote,
        }),
      });
      if (response.ok) {
        const newCorrection = await response.json();
        setCorrections({
          ...corrections,
          [selectedConversation.conversation_id]: [
            ...(corrections[selectedConversation.conversation_id] || []),
            newCorrection.correction,
          ],
        });
        toast.success("Correction saved!");
        setCorrectionModalOpen(false);
      } else {
        toast.error("Error saving correction.");
      }
    } catch (error) {
      toast.error("Error saving correction.");
      console.error("Error saving correction:", error);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCorrectionToggle = () => {
    setCorrectionMode(!isCorrectionMode);
  };

  const handleOpenCorrectionModal = (index) => {
    setCurrentMessageIndex(index);
    setCorrectionNote("");
    setCorrectionModalOpen(true);
  };

  const renderButtons = (buttons) => {
    if (!buttons) return null;
    return (
      <div className="km-cta-multi-button-container">
        {buttons.map((button, buttonIndex) => (
          <button
            key={buttonIndex}
            className="km-cta-button km-link-button km-custom-widget-text-color km-undecorated-link km-carousel-card-button"
            {...(button.action?.type === "link" && button.action.payload?.url
              ? {
                  onClick: () =>
                    window.open(
                      button.action.payload.url,
                      "_blank",
                      "noopener noreferrer"
                    ),
                }
              : {
                  onClick: () => console.log("Button clicked, no URL", button),
                })}
            title={button.name}
          >
            {button.name}
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  className="km-custom-widget-stroke"
                  fill="none"
                  stroke="#5553B7"
                  d="M8.111 5.45v2.839A.711.711 0 0 1 7.4 9H1.711A.711.711 0 0 1 1 8.289V2.6a.71.71 0 0 1 .711-.711H4.58M5.889 1h2.667C8.8 1 9 1.199 9 1.444v2.667m-.222-2.889L4.503 5.497"
                />
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
          <div
            className="mck-msg-box-rich-text-container km-card-message-container km-div-slider tns-slider tns-carousel tns-subpixel tns-calc tns-horizontal"
            id="tns2"
            style={{
              transitionDuration: "0s",
              transform: "translate3d(0%, 0px, 0px)",
            }}
          >
            <div
              className="km-carousel-card-template km-single-card tns-item tns-slide-active"
              id="tns2-item0"
            >
              <div className="km-carousel-card-header-container">
                {header?.imgSrc && (
                  <div className="km-carousel-card-header km-carousel-card-header-with-img">
                    <img className="km-carousel-card-img" src={header.imgSrc} />
                    <div className="n-vis"></div>
                  </div>
                )}
                <div className="km-carousel-card-content-wrapper km-carousel-card-info-wrapper-with-buttons">
                  <div className="km-carousel-card-title-wrapper">
                    <div className="km-carousel-card-title" title={title}>
                      {title}
                    </div>
                    <div className="km-carousel-card-title-extension"></div>
                  </div>
                  <div className="km-carousel-card-sub-title" title={subtitle}>
                    {subtitle}
                  </div>
                  <div className="km-carousel-card-description-wrapper">
                    <div className="km-carousel-card-description" title={description}>
                      {description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="km-carousel-card-footer">{renderButtons(buttons)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessageContent = (message, index) => {
    // Find correction for this message
    const correction = corrections[selectedConversation?.conversation_id]?.find(
      (c) => c.message_index === index
    );

    if (message.role === "user") {
      const content = message.content;

      // Handle image uploads
      const imageMatch = content.match(/User uploaded an image:\s*(https?:\/\/[^\s,]+),?/);
      if (imageMatch) {
        const imageUrl = imageMatch[1];
        const textAfterImage = content.replace(/User uploaded an image:\s*https?:\/\/[^\s,]+,?\s*/, '').replace('and said: undefined', '').trim();
        return (
          <div className="user-message-with-image">
            <div className="uploaded-image-container mb-3">
              <img src={imageUrl} alt="User uploaded image" className="uploaded-image" />
            </div>
            {textAfterImage && textAfterImage !== 'undefined' && (
              <p className="mb-3 user-text-with-image">{textAfterImage}</p>
            )}
          </div>
        );
      }
      return <div className="user-message"><p className="mb-3">{content}</p></div>;
    } else if (message.role === "assistant") {
      return (
        <div className={`bot-message-container ${correction ? 'has-correction' : ''}`}>
          {Array.isArray(message.content) ? (
            <div className="assistant-message-content">
              {message.content.map((contentItem, subIndex) => {
                // Handle HTML content
                if (contentItem.messageType === "html" && contentItem.message) {
                  return (
                    <div key={subIndex} className="html-message" dangerouslySetInnerHTML={{ __html: contentItem.message }} />
                  );
                }
                // Handle string content
                else if (typeof contentItem === "string") {
                  return (
                    <div key={subIndex} className="text-message">
                      <p className="mb-3">{contentItem}</p>
                    </div>
                  );
                }
                // Handle object with message property
                else if (contentItem.message) {
                  if (typeof contentItem.message === "string" && contentItem.message.startsWith("<html>")) {
                    return (
                      <div key={subIndex} className="html-message" dangerouslySetInnerHTML={{ __html: contentItem.message }} />
                    );
                  } else {
                    return (
                      <div key={subIndex} className="text-message">
                        <p className="mb-3">{contentItem.message}</p>
                      </div>
                    );
                  }
                }
                // Handle card templates
                else if (contentItem.metadata?.templateId === "10") {
                  return renderCard(contentItem);
                }
                return null;
              })}
            </div>
          ) : typeof message.content === 'string' ? (
            <div className="assistant-message-content">
              {message.content.startsWith('<') ? (
                <div className="html-message" dangerouslySetInnerHTML={{ __html: message.content }} />
              ) : (
                <div className="text-message">
                  <p className="mb-3">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="assistant-message-content">
              <div className="text-message">
                <p className="mb-3">Message content could not be displayed</p>
              </div>
            </div>
          )}

          {correction && (
            <div className="correction-note">
              <Icon icon="solar:info-circle-bold color-light-coral" className="me-2" />
              <strong>Correction:</strong> {correction.correction_note}
            </div>
          )}
          {isCorrectionMode && (
            <button className="edit-button" onClick={() => handleOpenCorrectionModal(index)} title="Add correction">
              <svg className="edit-svgIcon" viewBox="0 0 512 512">
                <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
              </svg>
            </button>
          )}
        </div>
      );
    }
    
    // Handle system messages
    if (message.role === "system") {
      return (
        <div className="system-message">
          <Icon icon="solar:settings-bold" className="me-2" />
          <span className="system-label">System:</span>
          <p className="mb-0">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</p>
        </div>
      );
    }
    
    return (
      <div className="unknown-message">
        <p className="mb-3">Unknown message type: {message.role}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pan-loader">
        <div className="panWrapper">
          <div className="pan">
            <div className="food"></div>
            <div className="panBase"></div>
            <div className="panHandle"></div>
          </div>
          <div className="panShadow"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-sidebar card">
        <div className="chat-search-section">
          <div className="chat-search">
            <span className="icon">
              <Icon icon="iconoir:search" />
            </span>
            <input
              type="text"
              name="search"
              autoComplete="off"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="chat-filters">
            <div className="filter-group">
              <label className="filter-label">Filter:</label>
              <select 
                className="filter-select"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All Conversations</option>
                <option value="recent">Recent (24h)</option>
                <option value="corrected">With Corrections</option>
                <option value="long">Long Conversations (10+ messages)</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Sort:</label>
              <select 
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="messages_count">Most Messages</option>
              </select>
            </div>
          </div>
        </div>
        <div className="conversation-stats">
          <div className="stats-summary">
            <span className="stat-item">
              <Icon icon="solar:chat-round-bold" className="me-1" />
              {filteredConversations.length} conversations
            </span>
            {filterBy === 'corrected' && (
              <span className="stat-item text-warning">
                <Icon icon="solar:pen-bold" className="me-1" />
                With corrections
              </span>
            )}
          </div>
        </div>
        
        <div className="chat-all-list">
          {filteredConversations.map((conversation) => {
            const lastUserMessage = conversation.chat_history
              .slice()
              .reverse()
              .find((message) => message.role === "user");
            
            const clippedMessage = lastUserMessage
              ? truncateText(lastUserMessage.content)
              : "No recent messages";
            
            const messageCount = conversation.chat_history.filter(msg => msg.role !== 'system').length;
            const correctionCount = corrections[conversation.conversation_id]?.length || 0;

            return (
              <div
                key={conversation.conversation_id}
                className={`chat-sidebar-single ${
                  selectedConversation?.conversation_id === conversation.conversation_id
                    ? "active"
                    : ""
                }`}
                onClick={() => handleConversationClick(conversation)}
                style={{ cursor: "pointer" }}
              >
                <div className="myavana-row">
                  <div className="img">
                    <Icon icon="mdi:user-circle" className="text-4xl" />
                  </div>
                  <div className="info">
                    <div className="conversation-header">
                      <h6 className="text-sm mb-1 text-heading-color">
                        {conversation.user_name || `User ${conversation.user_id.slice(-6)}`}
                      </h6>
                      <div className="conversation-badges">
                        {correctionCount > 0 && (
                          <span className="correction-badge" title={`${correctionCount} corrections added`}>
                            <Icon icon="solar:pen-bold" />
                            {correctionCount}
                          </span>
                        )}
                        {messageCount > 15 && (
                          <span className="message-count-badge" title="Long conversation">
                            <Icon icon="solar:chat-round-dots-bold" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="conversation-meta">
                      <span className="message-count">{messageCount} messages</span>
                      <span className="conversation-id">ID: {conversation.conversation_id}</span>
                    </div>
                  </div>
                </div>
                <p className="mb-0 text-xs">{clippedMessage}</p>
                <div className="action">
                  <div className="conversation-time">
                    <p className="mb-0 text-neutral-400 text-xs lh-1">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                    <p className="mb-0 text-neutral-500 text-xs lh-1">
                      {new Date(conversation.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat-main card">
        <ChatSidebar
          selectedConversation={selectedConversation}
          onCorrectionToggle={handleCorrectionToggle}
          isCorrectionMode={isCorrectionMode}
          corrections={corrections}
        />
        <div className="chat-message-list">
          {selectedConversation && selectedConversation.chat_history ? (
            selectedConversation.chat_history.map((message, index) => {
              const messageTime = message.timestamp 
                ? new Date(message.timestamp)
                : new Date(selectedConversation.created_at);
              
              // Skip system messages in display
              if (message.role === 'system') {
                return null;
              }

              return (
                <div
                  key={index}
                  className={`chat-single-message ${message.role === "user" ? "right" : "left"}`}
                >
                  {message.role !== "user" && (
                    <div className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden">
                      <img
                        className="text-4xl chat-img-bot"
                        src="https://s3.amazonaws.com/kommunicate-prod.s3/profile_pic/17400778604881740077858695-image879.png"
                        alt=""
                      />
                    </div>
                  )}
                  <div className="chat-message-content">
                    {renderMessageContent(message, index)}
                    <p className="chat-time mb-0">
                      <span>
                        {messageTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Select a conversation to view details.</p>
          )}
        </div>
      </div>

      {/* Correction Modal */}
      {isCorrectionModalOpen && (
        <div className="correction-modal">
          <div className="correction-modal-content">
            <h3>Add Correction Note</h3>

            <CopilotTextarea
                className="w-full p-4 border border-gray-300 rounded-md myvana-textarea"
                value={
                    corrections[selectedConversation?.conversation_id]?.find(
                        (c) => c.message_index === currentMessageIndex
                    )?.correction_note || correctionNote
                }
                onChange={(e) => setCorrectionNote(e.target.value)}
                placeholder="Enter how the bot should have responded..."
                autosuggestionsConfig={{
                  purpose: "Suggest improved responses for the Myavana chatbot based on the conversation context.",
                  fewShotExamples: [
                    {
                      user: "How can I know what type of hair I have?",
                      assistant:
                          "Instead of suggesting HairAI™, provide a brief explanation of hair types (e.g., 1A to 4C) and recommend observing strand thickness and curl pattern.",
                    },
                  ],
                }}
            />
            <div className="correction-modal-actions">
              <button onClick={handleSaveCorrection}>Save</button>
              <button onClick={() => setCorrectionModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatSidebar = ({ selectedConversation, onCorrectionToggle, isCorrectionMode, corrections }) => {
  const tableRef = useRef(null);
  const [localCorrections, setLocalCorrections] = useState([]); // Store corrections for this conversation

  // Fetch corrections for the selected conversation
  useEffect(() => {
    if (selectedConversation?.conversation_id) {
      const fetchCorrections = async () => {
        try {
          const response = await fetch(`/api/corrections?conversation_id=${selectedConversation.conversation_id}`);
          const data = await response.json();
          setLocalCorrections(data.corrections || []);
        } catch (error) {
          console.error("Error fetching corrections:", error);
        }
      };
      fetchCorrections();
    } else {
      setLocalCorrections([]);
    }
  }, [selectedConversation?.conversation_id]);

  // Prepare data for export
  const exportData = selectedConversation?.chat_history?.map((msg) => {
    let content = "";
    if (msg.role === "user") {
      content = msg.content.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - User Said: /, "");
      if (content.includes("User uploaded an image")) {
        content = content.replace(/, and said: undefined/, "");
      }
    } else if (msg.role === "assistant") {
      if (Array.isArray(msg.content)) {
        content = msg.content.map(item => item.message || "").join("\n");
      } else {
        content = msg.content || "";
      }
      content = htmlToText(content, {
        wordwrap: false,
        selectors: [
          { selector: "a", format: "skip" },
          { selector: "img", format: "skip" },
          { selector: "head", format: "skip" },
          { selector: "style", format: "skip" },
        ],
      });
    }

    return {
      Role: msg.role,
      Content: content,
      Timestamp: msg.created_at || selectedConversation.created_at || "N/A",
    };
  }) || [];

  // Export to Excel configuration
  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `Conversation_${selectedConversation?.conversation_id || "Unknown"}_${new Date().toISOString().split("T")[0]}`,
    sheet: "Conversation",
  });

  // Format conversation for clipboard
  const clipboardText = selectedConversation?.chat_history
    ?.map((msg) => {
      let content = "";
      if (msg.role === "user") {
        content = msg.content.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - User Said: /, "");
        if (content.includes("User uploaded an image")) {
          content = content.replace(/, and said: undefined/, "");
        }
      } else if (msg.role === "assistant") {
        if (Array.isArray(msg.content)) {
          content = msg.content.map(item => item.message || "").join("\n");
        } else {
          content = msg.content || "";
        }
        content = htmlToText(content, {
          wordwrap: false,
          selectors: [
            { selector: "a", format: "skip" },
            { selector: "img", format: "skip" },
            { selector: "head", format: "skip" },
            { selector: "style", format: "skip" },
          ],
        });
      }
      return `${msg.role.toUpperCase()} (${msg.created_at || selectedConversation.created_at || "N/A"}):\n${content}\n`;
    })
    .join("\n") || "";

  // Handle copy success
  const handleCopy = () => {
    toast.success("Conversation copied to clipboard!");
  };

  // Check if conversation has corrections
  const hasCorrections = (corrections[selectedConversation?.conversation_id] || []).length > 0;

  return (
    <div className="chat-sidebar-single active">
      <div className="info">
        <h6 className="text-md mb-0 text-heading-color">
          {selectedConversation
            ? selectedConversation.user_name || `Conversation with User: ${selectedConversation.user_id}`
            : "Select a Conversation"}
          {hasCorrections && (
            <span className="correction-badge" title="Corrections added">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"
                ></path>
              </svg>
            </span>
          )}
        </h6>
        {selectedConversation && (
          <div className="conversation-details text-white">
            <p className="mb-1 text-xs text-muted">
              ID: {selectedConversation.conversation_id}
            </p>
            <div className="conversation-stats-inline">
              <span className="stat-badge">
                <Icon icon="solar:chat-round-dots-bold" className="me-1" />
                {selectedConversation.chat_history.filter(msg => msg.role !== 'system').length} messages
              </span>
              <span className="stat-badge">
                <Icon icon="solar:calendar-bold" className="me-1" />
                {new Date(selectedConversation.created_at).toLocaleDateString()}
              </span>
              {hasCorrections && (
                <span className="stat-badge correction">
                  <Icon icon="solar:pen-bold" className="me-1" />
                  {(corrections[selectedConversation.conversation_id] || []).length} corrections
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="action d-inline-flex align-items-center gap-3">
        <div className="menu">

          <ul className="myavana-chat-header-icons">
            {/* User Profile */}
            <li className="icon-content">
                <a
              href={`/users/${selectedConversation?.user_id || ""}`}
              data-chat-icon="user-profile"
            >
                <div className="filled"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none"></rect>
                  <circle
                    cx="128"
                    cy="96"
                    r="64"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                    strokeWidth="16"
                  ></circle>
                  <path
                    d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></path>
                </svg>
              
            </a>
            <div className="myavana-chat-item-header-button-tooltip">User Profile</div>
            </li>
            {/* Export Chat */}
            <li className="icon-content">
              <a
                onClick={onDownload}
                data-chat-icon="export-chat"
                disabled={!selectedConversation}
              >
                <div className="filled"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none"></rect>
                  <path
                    d="M80,32H176a32,32,0,0,1,32,32v96l-40,40H80a32,32,0,0,1-32-32V64A32,32,0,0,1,80,32Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></path>
                  <polyline
                    points="208 152 232 128 208 104"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></polyline>
                  <line
                    x1="184"
                    y1="128"
                    x2="112"
                    y2="128"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></line>
                </svg>
              </a>
            <div className="myavana-chat-item-header-button-tooltip"> Export Chat </div>
            </li>
            {/* Copy Chat */}
            <CopyToClipboard text={clipboardText} onCopy={handleCopy}>
            <li className="icon-content">             
              <a
              data-chat-icon="copy-chat"
                disabled={!selectedConversation}
              >
                <div className="filled"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none"></rect>
                  <path
                    d="M184,64H40V216a8,8,0,0,0,8,8H192a8,8,0,0,0,8-8V80Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></path>
                  <path
                    d="M68,40H188a8,8,0,0,1,8,8V168"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                  ></path>
                </svg>
              </a>
              <div className="myavana-chat-item-header-button-tooltip">Copy Chat</div>
            </li>
            </CopyToClipboard>
          </ul>
          {/* Correction Mode Toggle */}
          <div className="neo-toggle-container">
            <input
              className="neo-toggle-input"
              id="neo-toggle"
              type="checkbox"
              checked={isCorrectionMode}
              onChange={onCorrectionToggle}
            />
            <label className="neo-toggle" htmlFor="neo-toggle">
              <div className="neo-track">
                <div className="neo-background-layer"></div>
                <div className="neo-grid-layer"></div>
                <div className="neo-spectrum-analyzer">
                  <div className="neo-spectrum-bar"></div>
                  <div className="neo-spectrum-bar"></div>
                  <div className="neo-spectrum-bar"></div>
                  <div className="neo-spectrum-bar"></div>
                  <div className="neo-spectrum-bar"></div>
                </div>
                <div className="neo-track-highlight"></div>
              </div>
              <div className="neo-thumb">
                <div className="neo-thumb-ring"></div>
                <div className="neo-thumb-core">
                  <div className="neo-thumb-icon">
                    <div className="neo-thumb-wave"></div>
                    <div className="neo-thumb-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="neo-gesture-area"></div>
              <div className="neo-interaction-feedback">
                <div className="neo-ripple"></div>
                <div className="neo-progress-arc"></div>
              </div>
              <div className="neo-status">
                <div className="neo-status-indicator">
                  <div className="neo-status-dot"></div>
                  <div className="neo-status-text"></div>
                </div>
              </div>
            </label>
          </div>
        </div>
        {/* Hidden table for Excel export */}
        <table ref={tableRef} style={{ display: "none" }}>
          <thead>
            <tr>
              <th>Role</th>
              <th>Content</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {exportData.map((row, index) => (
              <tr key={index}>
                <td>{row.Role}</td>
                <td>{row.Content}</td>
                <td>{row.Timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default ChatMessageLayer;