'use client'; 
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Badge } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { CodeBlock, dracula } from 'react-code-blocks';
import ReactJson from 'react-json-view'

const TaskCard = ({ task, index, onEdit, onDelete, onDuplicate, onTrainBot, isAnalyzing, onAnalyzeImage, isTraining }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className="kanban-card bg-neutral-50 p-3 radius-8 mb-3"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        userSelect: 'none',
                        background: snapshot.isDragging ? '#f0f0f0' : '#ffffff',
                        ...provided.draggableProps.style,
                    }}
                >
                    {task.image && (
                        <div className="radius-8 mb-2 overflow-hidden" style={{ maxHeight: '200px' }}>
                            <img
                                src={task.image}
                                alt=""
                                className="w-100 h-100 object-fit-cover"
                            />
                        </div>
                    )}

                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="kanban-title text-lg fw-semibold mb-0">{task.title}</h6>
                        {task.trainingStatus && (
                            <Badge
                                bg={
                                    task.trainingStatus === "completed" ? "success" :
                                    task.trainingStatus === "pending" ? "warning" : "secondary"
                                }
                                className="text-capitalize"
                            >
                                {task.trainingStatus}
                            </Badge>
                        )}
                    </div>

                    {task.descriptionLoading ? (
                                <div className='d-flex align-items-center justify-content-between gap-8 pb-24'
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '200px'
                                }}
                            >
                                <div className="loading-card">
                                    <div className="loading-loader">
                                        <p>Processing...</p>
                                        <div className="loading-words">
                                            <span className="loading-word">analyzing</span>
                                            <span className="loading-word">extracting</span>
                                            <span className="loading-word">processing</span>
                                            <span className="loading-word">training</span>
                                            <span className="loading-word">optimizing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    ) : task.description ? (
                        <p className="kanban-desc text-secondary-light mb-2">{task.description}</p>
                    ) : null}
                    {task.associatedProduct && (
                        <div className="mb-2">
                            <small className="text-muted">Associated Product:</small>
                            <div className="d-flex align-items-center gap-2 mt-1">
                                <Icon icon="ph:package" className="icon text-lg" />
                                <span className="fw-semibold">
                                    {task.associatedProduct.name}
                                </span>
                            </div>
                        </div>
                    )}

                    {task.tag && (
                        <button
                            type="button"
                            className="btn text-primary-600 border rounded border-primary-600 bg-hover-primary-600 text-hover-white d-flex align-items-center gap-2 mb-2"
                        >
                            <Icon icon="lucide:tag" className="icon text-lg"></Icon>
                            <span className="kanban-tag fw-semibold">{task.tag}</span>
                        </button>
                    )}

                    {task.trainingData && (
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Training Data:</small>
                          <div className="bg-light p-2 rounded small" style={{
                            maxHeight: '100px',
                            overflow: 'auto',
                          }}>
                            {(() => {
                              try {
                                // Handle both stringified JSON and already parsed objects
                                const data = typeof task.trainingData === 'string'
                                  ? JSON.parse(task.trainingData)
                                  : task.trainingData;

                                return <ReactJson
                                  src={data}
                                  displayDataTypes={false}
                                  collapsed={1}
                                  style={{ fontSize: '12px' }}
                                />;
                              } catch (e) {
                                // Fallback display if parsing fails
                                return (
                                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                    {typeof task.trainingData === 'string'
                                      ? task.trainingData
                                      : JSON.stringify(task.trainingData, null, 2)}
                                  </pre>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:calendar-outline" className="icon text-lg line-height-1"></Icon>
                        <span className="start-date text-secondary-light">
                            {task.date && new Date(task.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">

                        <div className="d-flex align-items-center gap-2">


                            {task.image && (
                                <button
                                    type="button"
                                    className="user-profile"
                                    onClick={() => onAnalyzeImage(task.id)}
                                    disabled={isAnalyzing || task.descriptionLoading}
                                >
                                    <Icon icon="bx:analyze" className="icon-sm"></Icon>
                                    <span className="user-profile-inner"> {task.descriptionLoading ? 'Analyzing...' : 'Re-Analyze'}</span>
                                </button>
                            )}

                            {task.description && !task.descriptionLoading && (
                                <>
                                    {isTraining && task.trainingStatus === "pending" ?(
                                        <div className="🤚">
                                        	<div className="👉"></div>
                                        	<div className="👉"></div>
                                        	<div className="👉"></div>
                                        	<div className="👉"></div>
                                        	<div className="🌴"></div>
                                        	<div className="👍"></div>
                                        </div>
                                    ):(
                                        <button
                                            className="train-button"
                                            onClick={() => onTrainBot(task.id)}
                                            disabled={isTraining || task.trainingStatus === "completed" || task.trainingStatus === "completed"}
                                     >
                                        <span className="train-button__icon-wrapper">
                                          <svg
                                            viewBox="0 0 14 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="train-button__icon-svg"
                                            width="10"
                                          >
                                            <path
                                              d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                                              fill="currentColor"
                                            ></path>
                                          </svg>

                                          <svg
                                            viewBox="0 0 14 15"
                                            fill="none"
                                            width="10"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="train-button__icon-svg train-button__icon-svg--copy"
                                          >
                                            <path
                                              d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                                              fill="currentColor"
                                            ></path>
                                          </svg>
                                        </span>
                                        Train Bot
                                      </button>
                                    )}

                                </>
                            )}

                            <button
                                type="button"
                                className="card-edit-button text-success-600"
                                onClick={onEdit}
                            >
                                <Icon icon="lucide:edit" className="icon text-lg"></Icon>
                            </button>
                            <button
                                type="button"
                                className="card-delete-button text-danger-600"
                                onClick={onDelete}
                            >
                                <Icon icon="fluent:delete-24-regular" className="icon text-lg line-height-1"></Icon>
                            </button>
                            <button
                                type="button"
                                className="card-edit-button text-info-600"
                                onClick={onDuplicate}
                            >
                                <Icon icon="lucide:copy" className="icon text-lg"></Icon>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;