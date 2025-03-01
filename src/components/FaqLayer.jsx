// app/docs/page.jsx
"use client";
import { useState } from 'react';
import { CodeBlock } from 'react-code-block';

function CodeBlockDemo({ code, language }) {
    return (
        <CodeBlock code={code} language={language}>
            <CodeBlock.Code className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <CodeBlock.LineContent>
                    <CodeBlock.Token />
                </CodeBlock.LineContent>
            </CodeBlock.Code>
        </CodeBlock>
    );
}

const FaqLayer = () => {
  return (
    <div className='card basic-data-table'>
      <div className='card-header p-0 border-0'>
        <div className='responsive-padding-40-150 bg-light-pink'>
          <div className='row gy-4 align-items-center'>
            <div className='col-xl-7'>
              <h4 className='mb-20'>Sienna Naturals Chatbot Documentation.</h4>
              <p className='mb-0 text-secondary-light max-w-634-px text-xl'>
                  This documentation provides a complete guide to the Sienna Naturals chatbot and its associated dashboard.  Find information on the bot's code, how to use the dashboard, and instructions for deployment and maintenance.
              </p>
            </div>
            <div className='col-xl-5 d-xl-block d-none'>
              <img src='https://siennanaturals.com/cdn/shop/files/DNA_desktop_1600x.png' alt='' />
            </div>
          </div>
        </div>
      </div>
        <FaqLayer1 />

    </div>
  );
};




const FaqLayer1 = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('bot-code');

  // Content for each documentation section (replace with your actual content)
  const documentationContent = {
    'bot-code': (
        <div>
          <h6 className="text-xl font-semibold mb-4">Bot Code Documentation</h6>
          <p>Detailed explanation of the bot's codebase, including:</p>
            <div>
                <h6>Sienna Naturals Chatbot Documentation</h6>

                <p>
                    This document provides comprehensive documentation for the Sienna Naturals chatbot, a virtual assistant designed to
                    provide customer support, product information, and personalized haircare advice. The chatbot integrates with
                    Google's Gemini AI models, PostgreSQL for data storage, and Redis for caching.
                </p>

                <h6>Table of Contents</h6>
                <ol>
                    <li><a href="#overview">Overview</a></li>
                    <li><a href="#architecture">Architecture</a></li>
                    <li><a href="#components">Components</a></li>
                    <li><a href="#data-flow">Data Flow</a></li>
                    <li><a href="#error-handling">Error Handling</a></li>
                    <li><a href="#performance">Performance</a></li>
                    <li><a href="#database-schema">Database Schema</a></li>
                    <li><a href="#api-endpoints">API Endpoints</a></li>
                    <li><a href="#configuration">Configuration</a></li>
                    <li><a href="#dependencies">Dependencies</a></li>
                </ol>

                <h6 id="overview">1. Overview</h6>
                <p>
                    The Sienna Naturals chatbot is a Node.js application built to handle user interactions, leveraging AI for
                    natural language understanding and generation. It provides a seamless conversational experience for users seeking
                    information about Sienna Naturals products, haircare advice, and account-related inquiries. The chatbot supports
                    text-based interactions and image uploads for personalized hair analysis.
                </p>

                <h6 id="architecture">2. Architecture</h6>
                <p>The chatbot follows a layered architecture:</p>
                <ul>
                    <li><strong>Presentation Layer:</strong>  Handles user requests and responses (<code>index.js</code>).</li>
                    <li><strong>AI Layer:</strong>  Processes user input and generates responses using Gemini AI models (<code>ai.js</code>,
                        Genkit).
                    </li>
                    <li><strong>Data Access Layer:</strong>  Interacts with PostgreSQL and Redis databases (<code>database.js</code>,
                        <code>session.js</code>).
                    </li>
                    <li><strong>Service Layer:</strong>  Contains business logic for handling conversations, user profiles, and hair
                        issues (<code>conversation.js</code>, <code>user.js</code>, <code>hairIssues.js</code>, <code>eventHandlers.js</code>, <code>postResponseProcessing.js</code>).
                    </li>
                    <li><strong>Prompt Engineering:</strong> Constructs prompts for the AI models based on user context and conversation
                        history (<code>constructPrompt.js</code>).
                    </li>
                    <li><strong>System Prompt:</strong> Defines core instruction for the AI model (<code>system.js</code>).</li>
                </ul>
                <p>The application utilizes asynchronous operations extensively to ensure responsiveness and handle concurrent
                    requests.</p>

                <h6 id="components">3. Components</h6>

                <h6 id="indexjs">3.1 index.js (Main Entry Point)</h6>
                <p>
                    This file is the main entry point for the chatbot. It handles incoming requests, interacts with other modules, and sends responses back to the user.  Key responsibilities include:
                </p>
                <ul>
                    <li>Handles incoming requests (HTTP POST) to <code>/siennaNaturalsfulfillment</code>.</li>
                    <li>Extracts user ID, conversation ID, message, and event type from the request body.</li>
                    <li>Handles "WELCOME" events.</li>
                    <li>Loads or creates user sessions.</li>
                    <li>Retrieves conversation history and user details.</li>
                    <li>Handles image messages ("KOMMUNICATE_MEDIA_EVENT").</li>
                    <li>Constructs prompts for the AI model.</li>
                    <li>Sends user messages to the Gemini AI model (with fallback to a secondary model).</li>
                    <li>Processes AI responses and sends them back to the user.</li>
                    <li>Updates conversation history and user profile.</li>
                    <li>Measures and logs performance.</li>
                </ul>

                <h6 id="aijs">3.2 ai.js (Genkit Initialization)</h6>
                <p>This file initializes the Genkit AI framework and configures the Google AI plugin.</p>
                <ul>
                    <li>Initializes the Genkit AI framework.</li>
                    <li>Configures the Google AI plugin with the API key.</li>
                    <li>Sets the default model.</li>
                    <li>Exports the initialized <code>ai</code> object for use in other modules.</li>
                </ul>

                <h6 id="configjs">3.3 config.js (Configuration)</h6>
                <p>This file manages the application's configuration settings.</p>
                <ul>
                    <li>Loads environment variables.</li>
                    <li>Defines configuration settings for:
                        <ul>
                            <li>PostgreSQL database</li>
                            <li>Redis</li>
                            <li>Genkit API key</li>
                            <li>OpenAI API key (used for image analysis)</li>
                            <li>Default and experimental AI models</li>
                            <li>AI model temperature</li>
                        </ul>
                    </li>
                </ul>

                <h6 id="constructpromptjs">3.4 constructPrompt.js (Prompt Construction)</h6>
                <p>This file is responsible for generating the prompts that are sent to the AI models.</p>
                <ul>
                    <li><code>constructPrompt</code>: Generates the main system prompt.</li>
                    <li><code>postProcessingPrompt</code>: Generates a prompt for extracting structured data (user profile
                        updates and hair issues) from the conversation.</li>
                    <li><code>imageAnalysisPrompt</code>: Creates a prompt to extract a user's hair details by analyzing a user's uploaded photo.</li>
                </ul>

                <h6 id="conversationjs">3.5 conversation.js (Conversation Management)</h6>
                <p>This file provides functions for managing conversations and their summaries, interacting with both PostgreSQL and Redis.</p>
                <ul>
                    <li>Provides functions for managing conversations and summaries:
                        <ul>
                            <li><code>saveConversationSummary</code>: Saves or updates the summary of a conversation.</li>
                            <li><code>generateConversationSummary</code>: Generates a summary of a conversation.</li>
                            <li><code>getAllConversationsSummary</code>: Retrieves the most recent conversation summary for a
                                user.
                            </li>
                            <li><code>getConversationHistory</code>: Retrieves the chat history for a specific conversation ID.</li>
                            <li><code>saveConversation</code>: Saves or updates the chat history and summary for a conversation.
                            </li>
                            <li><code>getAllChatsAsSingleArray</code>: Retrieves all chat history entries for a user as a single
                                array.
                            </li>
                            <li><code>generateAndSaveSummary</code>: Generates a new summary for all of a user's conversations (or a single conversation).</li>
                        </ul>
                    </li>
                </ul>

                <h6 id="databasejs">3.6 database.js (Database Connection)</h6>
                <p>This file handles the connections to the PostgreSQL and Redis databases.</p>
                <ul>
                    <li>Establishes connections to PostgreSQL and Redis databases.</li>
                    <li>Provides database client objects for other modules to use.</li>
                    <li>Handles connection errors.</li>
                </ul>

                <h6 id="eventhandlersjs">3.7 eventHandlers.js (Event Handlers)</h6>
                <p>This file contains the event handlers for specific events, such as welcome messages and image uploads.</p>
                <ul>
                    <li><code>handleWelcomeEvent</code>: Sends a welcome message and creates a new user session.</li>
                    <li><code>handleImageMessage</code>: Handles image uploads, analyzes the image, provides haircare advice, and updates the conversation history and user profile.</li>
                </ul>

                <h6 id="hairissuesjs">3.8 hairIssues.js (Hair Issue Tracking)</h6>
                <p>This file provides functions for managing user-reported hair issues, storing them in the database.</p>
                <ul>
                    <li>Provides functions for managing user-reported hair issues:
                        <ul>
                            <li><code>saveHairIssue</code>: Saves a hair issue reported by a user.</li>
                            <li><code>getHairIssuesForUser</code>: Retrieves all hair issues reported by a user.</li>
                        </ul>
                    </li>
                </ul>

                <h6 id="postresponseprocessingjs">3.9 postResponseProcessing.js (Post-Response Processing)</h6>
                <p>This file handles post-processing of AI responses, including extracting structured data and updating user profiles and conversation history.</p>
                <ul>
                    <li><code>processBotResponse</code>: Parses the raw bot response and extracts relevant information.</li>
                    <li><code>postProcessConversation</code>: Calls the Gemini AI model to extract structured data from the conversation.</li>
                    <li><code>updateUserProfile</code>: Updates the user's profile in the database and cache.</li>
                    <li><code>postResponseProcessing</code>:  Coordinates the overall post-processing workflow.</li>
                </ul>

                <h6 id="sessionjs">3.10 session.js (Session Management)</h6>
                <p>This file implements a custom session store using PostgreSQL to manage user sessions.</p>
                <ul>
                    <li>Implements a custom session store (<code>DatabaseSessionStore</code>) for Genkit, using PostgreSQL.</li>
                    <li><code>get</code>: Retrieves session data.</li>
                    <li><code>save</code>: Saves or updates session data.</li>
                </ul>

                <h6 id="systemjs">3.11 system.js (System Prompt)</h6>
                <p>This file defines the core system prompt used by the Gemini AI model, providing detailed instructions and context.</p>
                <ul>
                    <li>Defines the core system prompt (<code>systemPromt</code>).</li>
                    <li>Includes information on chatbot roles, output format, product data, FAQs, brand information, and behavioral rules.</li>
                </ul>

                <h6 id="userjs">3.12 user.js (User Management)</h6>
                <p>This file provides functions for managing user data, including retrieving and creating user records.</p>
                <ul>
                    <li>Provides functions to manage user data
                        <ul>
                            <li><code>getUserDetails</code>: Retrieves or creates user details.</li>
                        </ul>
                    </li>
                </ul>

                <h6 id="data-flow">4. Data Flow</h6>

                <ol>
                    <li>User sends a message or triggers an event.</li>
                    <li><code>index.js</code> receives the request.</li>
                    <li>For welcome events, a welcome message is sent and a session is created.</li>
                    <li>For image uploads, the image is analyzed and advice is provided.</li>
                    <li>For text messages:
                        <ul>
                            <li>Conversation history and user details are retrieved.</li>
                            <li>A prompt is generated for the AI model.</li>
                            <li>The AI model generates a response.</li>
                            <li>Post-processing extracts data and updates the user profile and conversation history.</li>
                            <li>The response is sent back to the user.</li>
                        </ul>
                    </li>
                </ol>

                <h6 id="error-handling">5. Error Handling</h6>
                <ul>
                    <li>Database connection errors cause the application to exit.</li>
                    <li>Redis connection errors are logged.</li>
                    <li>Errors during AI model interaction are caught, logged, and a fallback mechanism is used.</li>
                    <li>Errors during database queries are caught and logged.</li>
                    <li>General errors result in a 500 status code.</li>
                    <li>The system prompt includes the full chat history when an error occurs.</li>
                </ul>

                <h6 id="performance">6. Performance</h6>
                <ul>
                    <li>Redis caching is used for user details, conversation summaries, and conversation history.</li>
                    <li>Asynchronous operations are used extensively.</li>
                    <li>Performance is measured and logged.</li>
                </ul>

                <h6 id="database-schema">7. Database Schema</h6>

                <p>The application uses the following PostgreSQL tables:</p>

                <h6>7.1 users</h6>
                <table>
                    <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>user_id</td>
                        <td>TEXT (PRIMARY KEY)</td>
                        <td>Unique identifier for the user.</td>
                    </tr>
                    <tr>
                        <td>name</td>
                        <td>TEXT</td>
                        <td>User's name.</td>
                    </tr>
                    <tr>
                        <td>hair_type</td>
                        <td>TEXT</td>
                        <td>User's hair type.</td>
                    </tr>
                    <tr>
                        <td>hair_texture</td>
                        <td>TEXT</td>
                        <td>User's hair texture.</td>
                    </tr>
                    <tr>
                        <td>porosity</td>
                        <td>TEXT</td>
                        <td>User's hair porosity.</td>
                    </tr>
                    <tr>
                        <td>elasticity</td>
                        <td>TEXT</td>
                        <td>User's hair elasticity.</td>
                    </tr>
                    <tr>
                        <td>density</td>
                        <td>TEXT</td>
                        <td>User's hair density.</td>
                    </tr>
                    <tr>
                        <td>curl_pattern</td>
                        <td>TEXT</td>
                        <td>User's curl pattern.</td>
                    </tr>
                    <tr>
                        <td>hair_color_natural</td>
                        <td>TEXT</td>
                        <td>User's natural hair color.</td>
                    </tr>
                    <tr>
                        <td>hair_color_treated</td>
                        <td>TEXT</td>
                        <td>User's treated hair color.</td>
                    </tr>
                    <tr>
                        <td>hair_concerns</td>
                        <td>TEXT[]</td>
                        <td>Array of user's hair concerns.</td>
                    </tr>
                    <tr>
                        <td>hair_goals</td>
                        <td>TEXT[]</td>
                        <td>Array of user's hair goals.</td>
                    </tr>
                    <tr>
                        <td>hair_history_treatments</td>
                        <td>TEXT[]</td>
                        <td>Array of user's past hair treatments.</td>
                    </tr>
                    <tr>
                        <td>hair_styling_habits</td>
                        <td>TEXT</td>
                        <td>User's hair styling habits.</td>
                    </tr>
                    <tr>
                        <td>product_preferences_brands</td>
                        <td>TEXT[]</td>
                        <td>Array of user's preferred hair product brands.</td>
                    </tr>
                    <tr>
                        <td>product_preferences_ingredients</td>
                        <td>TEXT</td>
                        <td>User's preferred hair product ingredients.</td>
                    </tr>
                    <tr>
                        <td>journey_stage_intent</td>
                        <td>TEXT</td>
                        <td>The user's current intention within their hair journey.</td>
                    </tr>
                    <tr>
                        <td>damage_level_self_reported</td>
                        <td>TEXT</td>
                        <td>User's self-reported level of hair damage.</td>
                    </tr>
                    <tr>
                        <td>experimenting_interest</td>
                        <td>BOOLEAN</td>
                        <td>Indicates if the user is interested in experimenting.</td>
                    </tr>
                    <tr>
                        <td>boredom_expression</td>
                        <td>BOOLEAN</td>
                        <td>Indicates if the user has expressed boredom.</td>
                    </tr>
                    <tr>
                        <td>confidence_level_inferred</td>
                        <td>TEXT</td>
                        <td>The inferred level of confidence the user has.</td>
                    </tr>
                    <tr>
                        <td>desperation_level_inferred</td>
                        <td>TEXT</td>
                        <td>The inferred level of desperation the user is feeling.</td>
                    </tr>
                    <tr>
                        <td>created_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of creation.</td>
                    </tr>
                    <tr>
                        <td>updated_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of last update.</td>
                    </tr>
                    </tbody>
                </table>

                <h6>7.2 conversations</h6>
                <table>
                    <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>conversation_id</td>
                        <td>TEXT (PRIMARY KEY)</td>
                        <td>Unique identifier for the conversation.</td>
                    </tr>
                    <tr>
                        <td>user_id</td>
                        <td>TEXT</td>
                        <td>Foreign key referencing the <code>users</code> table.</td>
                    </tr>
                    <tr>
                        <td>chat_history</td>
                        <td>JSONB</td>
                        <td>The conversation history.</td>
                    </tr>
                    <tr>
                        <td>summary</td>
                        <td>TEXT</td>
                        <td>A summary of the conversation.</td>
                    </tr>
                    <tr>
                        <td>created_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of creation.</td>
                    </tr>
                    <tr>
                        <td>updated_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of last update.</td>
                    </tr>

                    </tbody>
                </table>

                <h6>7.3 hair_issues</h6>
                <table>
                    <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>issue_id</td>
                        <td>SERIAL PRIMARY KEY</td>
                        <td>Unique identifier for the hair issue.</td>
                    </tr>
                    <tr>
                        <td>user_id</td>
                        <td>TEXT</td>
                        <td>Foreign key referencing the <code>users</code> table.</td>
                    </tr>
                    <tr>
                        <td>issue_description</td>
                        <td>TEXT</td>
                        <td>Description of the hair issue.</td>
                    </tr>
                    <tr>
                        <td>bot_advice</td>
                        <td>TEXT</td>
                        <td>The chatbot's advice.</td>
                    </tr>
                    <tr>
                        <td>reported_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of when reported.</td>
                    </tr>
                    <tr>
                        <td>advice_given_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of when advice was given.</td>
                    </tr>
                    </tbody>
                </table>

                <h6>7.4 sessions</h6>
                <table>
                    <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>session_id</td>
                        <td>TEXT (PRIMARY KEY)</td>
                        <td>Unique identifier for the session.</td>
                    </tr>
                    <tr>
                        <td>user_id</td>
                        <td>TEXT</td>
                        <td>Foreign key referencing the <code>users</code> table.</td>
                    </tr>
                    <tr>
                        <td>session_data</td>
                        <td>JSONB</td>
                        <td>The session data.</td>
                    </tr>
                    <tr>
                        <td>last_accessed_at</td>
                        <td>TIMESTAMP WITH TIME ZONE</td>
                        <td>Timestamp of last access.</td>
                    </tr>
                    </tbody>
                </table>

                <h6 id="api-endpoints">8. API Endpoints</h6>

                <ul>
                    <li><code>POST /siennaNaturalsfulfillment</code>: Main endpoint for handling user interactions.</li>
                </ul>

                <h6 id="configuration">9. Configuration</h6>

                <p>Configuration is managed through environment variables and stored in <code>config.js</code>:</p>

                <ul>
                    <li>Database connection settings.</li>
                    <li>Redis connection settings.</li>
                    <li>Genkit API key.</li>
                    <li>OpenAI API key.</li>
                    <li>AI model settings.</li>
                </ul>

                <h6 id="dependencies">10. Dependencies</h6>
                <p>The project uses the following external libraries:</p>
                <ul>
                    <li><code>@genkit-ai/googleai</code>: Genkit plugin for Google AI models.</li>
                    <li><code>genkit</code>: Genkit AI framework.</li>
                    <li><code>pg</code>: PostgreSQL client.</li>
                    <li><code>redis</code>: Redis client.</li>
                    <li><code>dotenv</code>: Loads environment variables.</li>
                    <li><code>perf_hooks</code>: For performance monitoring.</li>
                    <li><code>openai</code>: OpenAI API client (for image analysis).</li>
                </ul>
            </div>
        </div>
    ),
      'dashboard': (
          <div>
              <h3 className="text-xl font-semibold mb-4">Dashboard Documentation</h3>
              <p>
                  This section provides a comprehensive guide to using the Sienna Naturals
                  chatbot dashboard.  Learn how to navigate the interface, interpret the
                  data, and manage users and conversations.
              </p>

              <h4 className="font-bold text-lg mt-6 mb-2">1. Overview (Homepage)</h4>
              <p>
                  The dashboard homepage (/) provides a high-level overview of key metrics.
                  Upon logging in, you'll see the following:
              </p>
              <ul className="list-disc list-inside ml-4 mb-4">
                  <li>
                      <strong>Total Conversations:</strong> The total number of conversations
                      the bot has had with users.
                  </li>
                  <li>
                      <strong>Active Users (30 Days):</strong> The number of unique users who
                      have interacted with the bot in the last 30 days.
                  </li>
                  <li>
                      <strong>Product Interactions:</strong> The total number of times users
                      have interacted with product cards (e.g., clicked on them).
                  </li>
                  <li>
                      <strong>Hair Profiles Analyzed:</strong> The total number of user hair
                      profiles created.
                  </li>
                  <li>
                      <strong>Total Hair Issues:</strong> The total number of hair issues reported by users.
                  </li>
                  <li>
                      <strong>Messages Per Day (Chart):</strong> A chart displaying the
                      number of messages exchanged between users and the bot each day.
                  </li>
                  <li>
                      <strong>New Users Per Day (Chart):</strong>  A chart showing the number of new users registered each day.
                  </li>
                  <li>
                      <strong>Hair Concerns Overview (Donut Chart):</strong> A donut chart
                      visualizing the distribution of the most common hair concerns reported
                      by users.
                  </li>
                  <li>
                      <strong>Users Table:</strong> A table that displays All Users and the recent users.
                  </li>
              </ul>

              <h4 className="font-bold text-lg mt-6 mb-2">2. Users Page (/users)</h4>
              <p>
                  The Users page provides a detailed list of all users who have
                  interacted with the bot.
              </p>
              <ul className="list-disc list-inside ml-4 mb-4">
                  <li>
                      <strong>Table View:</strong>  User data is displayed in a table format,
                      with columns for:
                      <ul className="list-disc list-inside ml-8">
                          <li>User ID</li>
                          <li>Name (or a generated name if not provided)</li>
                          <li>Email</li>
                          <li>Registration Date</li>
                          <li>Hair Type</li>
                          <li>Hair Texture</li>
                          <li>... (and all other user profile fields) ...</li>
                          <li>Action (View)</li>
                      </ul>
                  </li>
                  <li>
                      <strong>Search:</strong>  A search bar allows you to quickly find users
                      by name or email.
                  </li>
                  <li>
                      <strong>Pagination:</strong>  If there are many users, pagination
                      controls allow you to navigate through the pages of results.
                  </li>
                  <li>
                      <strong>View Details:</strong>  Clicking the "View" link for a user
                      navigates to the User Detail Page (`/users/[userId]`).
                  </li>
              </ul>

              <h4 className="font-bold text-lg mt-6 mb-2">3. User Detail Page (/users/[userId])</h4>
              <p>
                  The User Detail Page displays all available information for a specific
                  user.
              </p>
              <ul className="list-disc list-inside ml-4 mb-4">
                  <li>
                      <strong>User Information:</strong>  Displays all fields from the `users`
                      table, including name, email, registration date, hair profile details,
                      location, and any other custom fields you've added.
                  </li>
                  <li>
                      <strong>Statistics Cards:</strong>  Shows key statistics for the user:
                      <ul className="list-disc list-inside ml-8">
                          <li>Total Conversations</li>
                          <li>Total Messages</li>
                          <li>Total Hair Issues</li>
                      </ul>
                  </li>
                  <li>
                      <strong>Back to Users button:</strong> Button to go back to the users list.
                  </li>
              </ul>


              <h4 className="font-bold text-lg mt-6 mb-2">4. Conversations Page (/conversations)</h4>
              <p>
                  The Conversations page offers a way to browse and review all conversations that have taken place between users and the chatbot.
              </p>
              <ul className="list-disc list-inside ml-4 mb-4">
                  <li>
                      <strong>Conversation List (Left Sidebar):</strong> A list of all conversations, displaying:
                      <ul className="list-disc list-inside ml-8">
                          <li>User ID (and user name if available)</li>
                          <li>Conversation Summary (if available)</li>
                          <li>Date of the conversation</li>
                      </ul>
                  </li>
                  <li>
                      <strong>Search:</strong> A search bar to find conversations by user ID or summary content.
                  </li>
                  <li>
                      <strong>Conversation Selection:</strong> Clicking on a conversation in the list displays its full details in the main chat area.
                  </li>
                  <li>
                      <strong>Chat History (Main Area):</strong> When a conversation is selected, the full chat history is displayed.
                      <ul className="list-disc list-inside ml-8">
                          <li>Messages are displayed with the correct sender/receiver alignment (user messages on the right, bot messages on the left).</li>
                          <li>User messages have the timestamp and "User Said:" prefix removed.</li>
                          <li>Bot messages with HTML content are rendered correctly.</li>
                          <li>Cards and buttons sent by the bot are displayed using the appropriate styling.</li>
                          <li>Timestamps for each message are displayed.</li>
                          <li>A placeholder user icon is shown for bot messages.</li>
                      </ul>
                  </li>
                  <li>
                      <strong>Message Input (Disabled):</strong> A disabled message input field and send button are present, as this dashboard is for viewing conversations, not for sending messages.
                  </li>
              </ul>

              <h4 className="font-bold text-lg mt-6 mb-2">5.  Additional Notes</h4>
              <ul className="list-disc list-inside ml-4 mb-4">
                  <li><b>Authentication:</b>  All dashboard pages are protected by Clerk authentication.  Only authorized users can access the dashboard.</li>
                  <li><b>Error Handling:</b>  The dashboard includes error handling to gracefully display messages if data fails to load.</li>
                  <li><b>Responsiveness:</b>  The dashboard is designed to be responsive and work well on different screen sizes.</li>
              </ul>
          </div>
      ),
      'deployment': (
          <div>
              <h6 className="text-xl font-semibold mb-4">Migration/Production Deployment</h6>
              <p>Step-by-step instructions for deploying the bot and dashboard:</p>
              <h4 className='font-bold text-lg'>Technologies Used:</h4>
              <ul className="list-disc list-inside ml-4">
                  <li>Next.js (version 14+)</li>
                  <li>React</li>
                  <li>PostgreSQL (with Vercel Postgres or other provider)</li>
                  <li>Clerk (for authentication)</li>
                  <li>Kommunicate (for chatbot integration)</li>
                  <li>Vercel (for deployment)</li>
                  <li>Tailwind CSS (for styling)</li>
                  <li>@iconify/react (for icons)</li>
                  <li>@scaleway/random-name (for generating default user names)</li>
              </ul>

              <h4 className='font-bold text-lg'>Setting up a Clerk Account:</h4>
              <ol className="list-decimal list-inside ml-4">
                  <li>Go to the <a href="https://clerk.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Clerk website</a>.</li>
                  <li>Click "Sign Up" and create an account.</li>
                  <li>Create a new application in the Clerk dashboard.  Give it a descriptive name (e.g., "Sienna Naturals Dashboard").</li>
                  <li>Configure the application:
                      <ul className="list-disc list-inside ml-8">
                          <li>Select the desired authentication methods (e.g., Email and Password, Google, etc.).  For a dashboard, email/password is usually sufficient.</li>
                          <li>Set up any desired user metadata fields (you likely won't need custom fields for the *dashboard* users, as opposed to the *bot* users).</li>
                          <li>Configure session length and other security settings.</li>
                      </ul>
                  </li>
                  <li>
                      Obtain your Clerk API keys (Publishable Key and Secret Key).  We need these for the `.env.local` file:
                      <pre className='bg-gray-100 p-2 rounded text-sm'>
                    {`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key`}
                </pre>
                  </li>

              </ol>


              <h4 className='font-bold text-lg'>Setting up a Kommunicate Account:</h4>
              <ol className="list-decimal list-inside ml-4">
                  <li>Go to the <a href="https://www.kommunicate.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Kommunicate website</a>.</li>
                  <li>Click "Sign Up" or "Get Started" and create an account.</li>
                  <li>Create a new bot in the Kommunicate dashboard.</li>
                  <li>
                      Configure the bot:
                      <ul className="list-disc list-inside ml-8">
                          <li>Set up welcome messages and initial interactions.</li>
                          <li>Import your intents and responses (from your bot's logic).</li>
                          <li>Train the bot with your data.</li>
                      </ul>
                  </li>
                  <li>Obtain your Kommunicate Application ID. You'll need this to integrate with your Next.js application. Add to .env.local</li>
                  <li>Install the Kommunicate SDK or use their provided integration methods (e.g., webhooks).  The specific instructions will depend on how you've structured your bot.</li>
              </ol>

              <h4 className='font-bold text-lg'>Deploying to Shopify (Kommunicate):</h4>
              <ol className="list-decimal list-inside ml-4">
                  <li>Follow the instructions provided by Kommunicate for Shopify integration.  This typically involves adding a script tag to your Shopify theme's code.  Kommunicate's documentation will have the most up-to-date instructions. You may also need to setup webhooks between your Next project and Kommunicate.</li>
                  <li>Test the integration thoroughly to ensure the bot is working correctly on your Shopify site.</li>
              </ol>


              <h4 className='font-bold text-lg'>Setting up Vercel for Dashboard Deployment:</h4>
              <ol className="list-decimal list-inside ml-4">
                  <li>Create a Vercel account (if you don't have one).</li>
                  <li>Connect your GitHub repository to Vercel.</li>
                  <li>
                      Configure your project settings:
                      <ul className="list-disc list-inside ml-8">
                          <li>Set the framework preset to "Next.js".</li>
                          <li>Configure environment variables (your database connection string, Clerk keys, Kommunicate ID, etc.).  *Never* commit these directly to your code!</li>
                          <li>Set up any necessary build commands (usually, Vercel handles this automatically).</li>
                      </ul>
                  </li>
                  <li>Deploy your project. Vercel will automatically build and deploy your application.</li>
                  <li>Configure your custom domain (if you have one).</li>
              </ol>


          </div>
),
};

return (

    <div className='card'>

      <div className='card-body '>
        <div className='row gy-4'>
          <div className='col-lg-4'>
            <div
                className='active-text-tab nav flex-column nav-pills bg-base shadow py-0 px-24 radius-12 border'
                id='v-pills-tab'
                role='tablist'
                aria-orientation='vertical'
            >

              <button
                  className={`nav-link text-secondary-light fw-semibold text-xl px-0 py-16 border-bottom ${activeTab === 'bot-code' ? 'active' : ''}`}
                  id='v-pills-bot-code-tab'
                  onClick={() => setActiveTab('bot-code')}
                  type='button'
                  role='tab'

              >
                Bot Code
              </button>
              <button
                  className={`nav-link text-secondary-light fw-semibold text-xl px-0 py-16 border-bottom ${activeTab === 'dashboard' ? 'active' : ''}`}
                  id='v-pills-dashboard-tab'
                  onClick={() => setActiveTab('dashboard')}
                  type='button'
                  role='tab'

              >
                Dashboard
              </button>
              <button
                  className={`nav-link text-secondary-light fw-semibold text-xl px-0 py-16 ${activeTab === 'deployment' ? 'active' : ''}`}
                  id='v-pills-deployment-tab'
                  onClick={() => setActiveTab('deployment')}
                  type='button'
                  role='tab'

              >
                Deployment
              </button>

            </div>
          </div>
          <div className='col-lg-8'>
            <div className='tab-content' id='v-pills-tabContent'>
              {/* Content for the active tab */}
              {documentationContent[activeTab]}
            </div>
          </div>
        </div>
      </div>
    </div>

);
};

const code1 = `
const { gemini15Flash, googleAI, gemini20FlashExp } = require('@genkit-ai/googleai');
const { performance } = require('perf_hooks');
const {constructPrompt} = require('./constructPrompt');
const { connectDatabases } = require('./database');
const DatabaseSessionStore = require('./session');
const ai = require('./ai');
const { handleWelcomeEvent, handleImageMessage } = require('./eventHandlers');
const { getUserDetails } = require('./user');
const {getAllConversationsSummary, getConversationHistory } = require('./conversation');
const {postResponseProcessing, postProcessConversation} = require("./postResponseProcessing");


// Initialize databases
connectDatabases().then(r => console.log('Connected'));

exports.siennaNaturalsfulfillmentHandler = async (req, res) => {
                        try {
                        const start = performance.now();
                        console.log('req-body:', JSON.stringify(req.body))
                        const { message, from: userId, groupId: conversationId, eventName, metadata, contentType, source, chatKey } = req.body;

                        if (eventName === "WELCOME") {
                        await handleWelcomeEvent(res, userId);
                        return;
                    }

                        const session = await ai.loadSession(userId, {
                        store: new DatabaseSessionStore(),
                    });

                        const [allchatsSummary, userInfo] = await Promise.all([
                        getAllConversationsSummary(userId),
                        getUserDetails(userId)
                        ]);
                        let chatHistory = [];
                        chatHistory = await getConversationHistory(conversationId, userId);

                        if (!Array.isArray(chatHistory)) {
                        chatHistory = []; // Initialize to empty array if it's new chat
                    }
                        if (eventName === "KOMMUNICATE_MEDIA_EVENT") {
                        const handled = await handleImageMessage(eventName, metadata, userId, conversationId, chatHistory, res, message);
                        if (handled) return;
                    }

                        // Timestamp user message
                        const timestampedUserSaid = {new Date().toISOString()} - User Said: message;
                        chatHistory.push({ role: 'user', content: timestampedUserSaid });

                        const endGetChaHistory = performance.now();
                        const DEFAULT_IMAGES = {
                        primary: "https://www.siennanaturals.com/cdn/shop/files/banner1.jpg",
                        secondary: [
                        "https://www.siennanaturals.com/cdn/shop/files/hannah_issa_duo_ed709ef3-f5f4-424d-9372-e24c03be8f7c_370x230@2x.png",
                        "https://www.siennanaturals.com/cdn/shop/files/navigation_customertestimonials_370x230@2x.jpg",
                        "https://www.siennanaturals.com/cdn/shop/files/Mobile_48_370x230@2x.png"
                        ]
                    };
                        try {
                        const aiPrompt = await constructPrompt(userId, userInfo, chatHistory, allchatsSummary, false); //  <-- await here!
                        console.log('generated prompt:', aiPrompt);
                        const chat = session.chat({
                        model: gemini20FlashExp,
                        system: aiPrompt,
                        config: {
                        temperature: 1.1,
                    },
                    });
                        const { output } = await chat.send(message);
                        const endGetResponse = performance.now();
                       
                        res.json(output);
                        console.log('ai response 1: ', JSON.stringify(output))
                        chatHistory.push({ role: 'assistant', content: output });
                        // Post-processing after getting AI response
                        const postProcessData = await postProcessConversation(chatHistory, message);

                        return await postResponseProcessing(postProcessData, userId, output, allchatsSummary, conversationId, chatHistory);

                    } catch (e) {
                        console.log(e);
                        const aiPrompt = await constructPrompt(userId, userInfo, chatHistory, allchatsSummary, false); //  <-- await here!
                        console.log('generated prompt:', aiPrompt);
                        const chat = ai.chat({
                        model: gemini15Flash,
                        system: aiPrompt,
                        config: {
                        temperature: 1.1,
                    },
                    });
                        const { output } = await chat.send(message);
                        const endGetResponse = performance.now();
                       
                        console.log('ai response 2: ', JSON.stringify(output))
                        res.json(output);
                        chatHistory.push({ role: 'assistant', content: output });
                        // Post-processing after getting AI response
                        const postProcessData = await postProcessConversation(chatHistory, message);

                        return await postResponseProcessing(postProcessData, userId, output, allchatsSummary, conversationId, chatHistory);
                    }
                    } catch (error) {
                        console.error("Error yaitika ndeiyi:", error);
                        return res.status(500).send(Error, error.message || error);
                    }
                    };`
const code2 = `const { genkit } = require('genkit');
const { googleAI, gemini15Flash, gemini20FlashExp } = require('@genkit-ai/googleai');
const config = require('./config');

const ai = genkit({
                        plugins: [googleAI({
                        apiKey: config.genkitApiKey,
                    })],
                        model: gemini20FlashExp,
                    });

module.exports = ai;`
const code3 = `require('dotenv').config();

module.exports = {
                        dbConfig: {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        port: parseInt(process.env.DB_PORT, 10) || 5432, // Default PostgreSQL port
                    },
                        redisConfig: {
                        username: process.env.REDIS_USERNAME,
                        password: process.env.REDIS_PASSWORD,
                        socket: {
                        host: process.env.REDIS_HOST,
                        port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Default Redis port
                    }

                    },
                        genkitApiKey: process.env.GENKIT_API_KEY,
                        openaiApiKey: process.env.OPENAI_API_KEY,
                        defaultModel: 'gemini15Flash',
                        experimentalModel: 'gemini20FlashExp',
                        temperature: 1.1,
                    };`
const code4 = `const systemPrompt = require("./system");
const {getHairIssuesForUser} = require("./hairIssues");


const constructPrompt = async (userId, userDetails, chatHistory, allConversationsSummary, onError) => {
                        const userInfo = userDetails ? JSON.stringify(userDetails) : 'New User';
                        const summary = allConversationsSummary || 'No previous conversations.';
                        const recentHairIssues = await getHairIssuesForUser(userId);
                        const issueSummary = recentHairIssues.length > 0 ? 'Recent Hair Issues: {JSON.stringify(recentHairIssues)}' : 'No recent hair issues reported.';

                        let userDetailsString =  '
        User Information: {userInfo}
        Previous Conversations Summary: {summary}
        Previous hair issues: {issueSummary}

    ';
                        if(onError){
                        userDetailsString =  '
        User Information: {userInfo}
        Previous Conversations Summary: {summary}
        Previous hair issues: {issueSummary}
        Chat History: {JSON.stringify(chatHistory)}
    ';
                    }
                        return '
    {systemPrompt.systemInstruction.parts[0].text}
    {userDetailsString}
    '
                    };


const postProcessingPrompt = (chatHistory, message) => {
                        return '
    You are a Sienna Naturals expert AI assistant designed to analyze user conversations and user's name and extract structured information related to hair care.

    // ... (rest of the prompt) ...
    ';
                    };

const imageAnalysisPrompt = () => {
                        return '
      // (image analysis instruction)
  '
                    };

module.exports = {
                        constructPrompt,
                        postProcessingPrompt,
                        imageAnalysisPrompt
                    }`
const code5 = `const { pgClient, redisClient } = require('./database');
const ai = require('./ai');
const {gemini15Flash} = require("@genkit-ai/googleai");

const saveConversationSummary = async (conversationId, userId, summary) => {
                        // saves conversation summary in the database
                    };

const generateConversationSummary = async (chatHistory) => {
                        // generate summary from chat history
                    };

const getAllConversationsSummary = async (userId) => {
                        // gets conversation summary
                    };

const getConversationHistory = async (conversationId, userId) => {
                        // retrieve history
                    };

const saveConversation = async (conversationId, userId, chatHistory, summary) => {
                        // save chat history and summary
                    };

const getAllChatsAsSingleArray = async (userId) => {
                        // gets chat as a single array
                    };

const generateAndSaveSummary = async (userId, conversationId, chatHistory) => {
                        // generate and save conversation summary
                    };

module.exports = {
                        saveConversationSummary,
                        generateConversationSummary,
                        getAllConversationsSummary,
                        getConversationHistory,
                        saveConversation,
                        getAllChatsAsSingleArray,
                        generateAndSaveSummary
                    };`
const code6 = `const { Client } = require('pg');
const { createClient } = require('redis');
const config = require('./config');
require('dotenv').config();

const pgClient = new Client(config.dbConfig);
const redisClient = createClient(config.redisConfig);
redisClient.on('error', (err) => console.error('Redis error:', err));

const connectDatabases = async () => {
                        try {
                        await pgClient.connect();
                        await redisClient.connect();
                        console.log('Connected to PostgreSQL and Redis');
                    } catch (err) {
                        console.error('Database connection error:', err);
                        process.exit(1);
                    }
                    };

module.exports = {
                        pgClient,
                        redisClient,
                        connectDatabases,
                    };`
const code7 = `const DatabaseSessionStore = require("./session");
const ai = require('./ai');
const OpenAI = require('openai');
const {saveConversation, generateConversationSummary} = require("./conversation");
const config = require('./config');
const {imageAnalysisPrompt} = require("./constructPrompt");
const {postProcessConversation, updateUserProfile} = require("./postResponseProcessing");
const {saveHairIssue} = require("./hairIssues");

const openai = new OpenAI({
                        apiKey: config.openaiApiKey
                    });

const handleWelcomeEvent = async (res, userId) => {
                        // handles welcome event
                    };

const handleImageMessage = async (eventName, metadata, userId, conversationId, chatHistory, res, message) => {
                        // handles image event
                    };

module.exports = {
                        handleWelcomeEvent,
                        handleImageMessage
                    };`
const code8 = `const { pgClient } = require('./database');

const saveHairIssue = async (userId, issueDescription, botAdvice) => {
                        // save hair issues
                    };

const getHairIssuesForUser = async (userId) => {
                        // retrieve hair issues for a user
                    };

module.exports = {
                        saveHairIssue,
                        getHairIssuesForUser
                    }`
const code9 = `const ai = require("./ai");
const {gemini15Flash} = require("@genkit-ai/googleai");
const DatabaseSessionStore = require("./session");
const { pgClient, redisClient } = require('./database');
const {generateAndSaveSummary, saveConversationSummary, saveConversation} = require("./conversation");
const {saveHairIssue} = require("./hairIssues");
const {postProcessingPrompt} = require("./constructPrompt");


const processBotResponse = (botResponse) => {
                        // process bot response
                    };

const postProcessConversation = async (chatHistory, message) => {
                        // post process conversation
                    };

const updateUserProfile = async (userId, updates) => {
                        // update user profile
                    };

const postResponseProcessing = async (postProcessData, userId, output, allchatsSummary, conversationId, chatHistory )=>{
                        // post response processing
                    };

module.exports = {
                        postResponseProcessing,
                        postProcessConversation,
                        processBotResponse,
                        updateUserProfile
                    }`
const code10 = `const { pgClient } = require('./database');

class DatabaseSessionStore {
                        async get(sessionId) {
                        // retrieves session data
                    }

                        async save(sessionId, sessionData) {
                        // save session data
                    }
                    }

                    module.exports = DatabaseSessionStore;`
const code11 = `const products = require("./products");
const {faqs, youtubeVideos} = require("./faqs");
const DEFAULT_IMAGES = {
                        primary: "https://www.siennanaturals.com/cdn/shop/files/banner1.jpg",
                        secondary: [
                        "https://www.siennanaturals.com/cdn/shop/files/hannah_issa_duo_ed709ef3-f5f4-424d-9372-e24c03be8f7c_370x230@2x.png",
                        "https://www.siennanaturals.com/cdn/shop/files/navigation_customertestimonials_370x230@2x.jpg",
                        "https://www.siennanaturals.com/cdn/shop/files/Mobile_48_370x230@2x.png"
                        ]
                    };
const systemPromt = {
                        // system prompt
                    }

                    module.exports = systemPromt;`
const code12 = `const { pgClient, redisClient } = require('./database');

const getUserDetails = async (userId) => {
                        // user details
                    };

module.exports = {
                        getUserDetails,
                    };`

export default FaqLayer;