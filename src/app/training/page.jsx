'use client'; 
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import { useState, useEffect } from "react";
import Column from "@/components/child/Column";
import AddEditTaskModal from "@/components/child/AddEditTaskModal";
import { DragDropContext } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { toast } from 'react-toastify';

const initialData = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "New",
      taskIds: [],
    },
    "column-2": {
      id: "column-2",
      title: "Bot Training Completed",
      taskIds: [],
    },
  },
  tasks: [],
  columnOrder: ["column-1",  "column-2"],
};


// export const metadata = {
//   title: "Training- Sienna Naturals",
//   description:
//     "Training page.",
// };

const Page = () => {
  const [data, setData] = useState(initialData);
    const [showModal, setShowModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [currentColumn, setCurrentColumn] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [products, setProducts] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [isTraining, setIsTraining] = useState(false);
  
    useEffect(() => {
      const loadInitialData = async () => {
        try {
          setLoadingTasks(true);
          setLoadingProducts(true);
  
          // Load products and tasks in parallel
          const [productsResponse, tasksResponse] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/training-images')
          ]);
  
          if (!productsResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to load initial data');
          }
  
          const productsData = await productsResponse.json();
          const tasksData = await tasksResponse.json();
  
  
          setProducts(productsData.products);
  
          // Transform database tasks into our kanban format
          const tasks = tasksData.tasks.map(task => {
            // Find associated product if exists
            const associatedProduct = task.productId
              ? productsData.products.find(p => p.product_id == task.productId)
              : null;
  
            return {
              id: task.taskId,
              title: task.title,
              description: task.description,
              tag: task.tag,
              image: task.imageUrl,
              trainingData: task.trainingData,
              trainingStatus: task.trainingStatus,
              associatedProduct,
              date: new Date(task.createdAt).toISOString().split('T')[0]
            };
          });
  
          // Organize tasks into columns
          const newColumn1 = {
            ...initialData.columns['column-1'],
            taskIds: tasks
              .filter(task => task.trainingStatus !== 'completed')
              .map(task => task.id)
          };
  
          const newColumn2 = {
            ...initialData.columns['column-2'],
            taskIds: tasks
              .filter(task => task.trainingStatus === 'completed')
              .map(task => task.id)
          };
  
          setData({
            columns: {
              'column-1': newColumn1,
              'column-2': newColumn2
            },
            tasks,
            columnOrder: ['column-1', 'column-2']
          });
  
        } catch (error) {
          console.error("Error loading initial data:", error);
          toast.error("Failed to load initial data");
        } finally {
          setLoadingTasks(false);
          setLoadingProducts(false);
        }
      };
  
      loadInitialData();
    }, []);
  
    const onDragEnd = (result) => {
      const { destination, source, draggableId } = result;
  
      if (!destination) return;
  
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }
  
      const startColumn = data.columns[source.droppableId];
      const endColumn = data.columns[destination.droppableId];
  
      if (startColumn === endColumn) {
        const newTaskIds = Array.from(startColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);
  
        const newColumn = {
          ...startColumn,
          taskIds: newTaskIds,
        };
  
        setData({
          ...data,
          columns: {
            ...data.columns,
            [newColumn.id]: newColumn,
          },
        });
        return;
      }
  
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIds,
      };
  
      const endTaskIds = Array.from(endColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
      const newEnd = {
        ...endColumn,
        taskIds: endTaskIds,
      };
  
      const updatedTasks = data.tasks.map(task => {
        if (task.id === draggableId) {
          return {
            ...task,
            trainingStatus: destination.droppableId === "column-2" ? "completed" : "not_started"
          };
        }
        return task;
      });
  
      setData({
        ...data,
        columns: {
          ...data.columns,
          [newStart.id]: newStart,
          [newEnd.id]: newEnd,
        },
        tasks: updatedTasks,
      });
    };
  
    const handleAddTask = (columnId) => {
      setCurrentTask(null);
      setCurrentColumn(columnId);
      setShowModal(true);
    };
  
    const handleEditTask = (taskId, columnId) => {
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        setCurrentTask({ ...task, columnId });
        setCurrentColumn(columnId);
        setShowModal(true);
      }
    };
  
    const handleDeleteTask = async (taskId, columnId) => {
      try {
        // Delete from database first
        const response = await fetch(`/api/training-images/${taskId}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete task from database');
        }
  
        // Then update local state
        const column = data.columns[columnId];
        const newTaskIds = column.taskIds.filter((id) => id !== taskId);
        const newColumn = {
          ...column,
          taskIds: newTaskIds,
        };
        const newTasks = data.tasks.filter(task => task.id !== taskId);
  
        setData({
          ...data,
          columns: {
            ...data.columns,
            [newColumn.id]: newColumn,
          },
          tasks: newTasks,
        });
  
        toast.success("Task deleted successfully");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error(`Failed to delete task: ${error.message}`);
      }
    };
  
    const handleDuplicateTask = (taskId, columnId) => {
      const task = data.tasks.find(t => t.id === taskId);
      if (!task) return;
  
      const newId = uuidv4();
      const duplicatedTask = { ...task, id: newId, trainingStatus: "not_started" };
      const newTasks = [...data.tasks, duplicatedTask];
  
      const column = data.columns[columnId];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.unshift(newId);
      const newColumn = {
        ...column,
        taskIds: newTaskIds,
      };
  
      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
        tasks: newTasks,
      });
    };
  
    const uploadImageAndGetUrl = async (file) => {
      if (!file) {
        throw new Error("No file provided");
      }
  
      try {
        const formData = new FormData();
        formData.append("file", file);
  
        // Upload to your API endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,  // Use formData instead of JSON body
        });
  
  
        if (!response.ok) {
          throw new Error('Upload failed');
        }
  
        const { url } = await response.json();
        return url;
      } catch (error) {
        console.error("Upload failed:", error);
        throw error;
      }
    };
  
    const analyzeImage = async (imageFile, taskId, associatedProduct) => {
      setIsAnalyzing(true);
      try {
        // Get a URL for the image (or use existing if already saved)
        const imageUrl = imageFile ? await uploadImageAndGetUrl(imageFile) : data.tasks.find(t => t.id === taskId)?.image;
  
        if (!imageUrl) {
          throw new Error("No image available for analysis");
        }
  
        // Analyze with GenKit
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          body: JSON.stringify({
            imageUrl,
            associatedProduct: associatedProduct || null
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) throw new Error('Analysis failed');
  
        const { productName, description, trainingPairs } = await response.json();
  
        // Convert trainingPairs to trainingData format if needed
        const trainingData = trainingPairs
          ? JSON.stringify(trainingPairs, null, 2)
          : null;
  
        // Update local state
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                title: productName || task.title,
                description: description || task.description,
                trainingData,
                descriptionLoading: false // Set loading to false on success
              };
            }
            return task;
          })
        }));
  
        // Update database
        const task = data.tasks.find(t => t.id === taskId);
        await updateTaskInDatabase({
          id: taskId,
          title: productName || task.title,
          description: description || task.description,
          trainingData,
          image: imageUrl,
          associatedProduct: task.associatedProduct,
          trainingStatus: task.trainingStatus
        });
  
        toast.success("Image analysis completed");
      } catch (error) {
        console.error("Image analysis failed:", error);
  //      toast.error("Failed to analyze image");
  
  //      setData(prev => ({
  //        ...prev,
  //        tasks: prev.tasks.map(task => {
  //          if (task.id === taskId) {
  //            return {
  //              ...task,
  //              description: "Could not analyze image",
  //              descriptionLoading: false // Ensure loading is false on error
  //            };
  //          }
  //          return task;
  //        })
  //      }));
      } finally {
        setIsAnalyzing(false);
      }
    };
  
    const generateTrainingData = (title, description) => {
      return JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Tell me about ${title}`
          },
          {
            role: "assistant",
            content: description
          }
        ]
      }, null, 2);
    };
  
    const handleTrainBot = async (taskId) => {
      try {
        setIsTraining(true);
  
        // Update local state to "pending"
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                trainingStatus: "pending"
              };
            }
            return task;
          })
        }));
  
        // Update database status to "pending"
        await updateTaskInDatabase({
          id: taskId,
          trainingStatus: "completed",
          ...data.tasks.find(t => t.id === taskId)
        });
  
        toast.info("Bot training started for this content");
  
        // Simulate training with timeout (3 seconds)
        setTimeout(async () => {
          try {
            // Update local state to "completed"
            setData(prev => {
              const updatedTasks = prev.tasks.map(task => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    trainingStatus: "completed"
                  };
                }
                return task;
              });
  
              // Move task to completed column
              return {
                ...prev,
                tasks: updatedTasks,
                columns: {
                  ...prev.columns,
                  "column-1": {
                    ...prev.columns["column-1"],
                    taskIds: prev.columns["column-1"].taskIds.filter(id => id !== taskId)
                  },
                  "column-2": {
                    ...prev.columns["column-2"],
                    taskIds: [taskId, ...prev.columns["column-2"].taskIds]
                  }
                }
              };
            });
  
            // Update database status to "completed"
  //          await updateTaskInDatabase({
  //            id: taskId,
  //            trainingStatus: "completed",
  //            ...data.tasks.find(t => t.id === taskId)
  //          });
  
            toast.success("Bot training completed!");
          } catch (error) {
            console.error("Error completing training:", error);
            toast.error("Failed to complete training");
          } finally {
            setIsTraining(false);
          }
        }, 3000); // 3 second training simulation
  
      } catch (error) {
        console.error("Error starting training:", error);
        toast.error("Failed to start training");
        setIsTraining(false);
      }
    };
  
    const handleSaveTask = async (task, isEdit) => {
      try {
        let imageUrl = task.image;
  
        // Upload new image if changed
        if (task.imageFile) {
          imageUrl = await uploadImageAndGetUrl(task.imageFile);
        }
  
        // Prepare complete task data
        const taskData = {
          ...task,
          image: imageUrl,
          trainingStatus: task.imageFile ? "processing" : task.trainingStatus || "not_started"
        };
  
        if (isEdit && currentTask) {
          // Update in database
          await updateTaskInDatabase({
            ...taskData,
            id: task.id,
            associatedProduct: task.associatedProduct
          });
  
          // Then update local state
          const updatedTasks = data.tasks.map(t =>
            t.id === task.id ? { ...t, ...taskData } : t
          );
  
          setData({
            ...data,
            tasks: updatedTasks,
          });
  
          // Analyze if image was changed
          if (task.imageFile) {
            await analyzeImage(task.imageFile, task.id, task.associatedProduct);
          }
        } else {
          // Create new task
          const newId = uuidv4();
          const newTask = {
            ...taskData,
            id: newId,
            descriptionLoading: !!task.imageFile
          };
  
          // Save to database
          await saveTaskToDatabase({
            ...newTask,
            associatedProduct: task.associatedProduct
          });
  
          // Then update local state
          const newTasks = [...data.tasks, newTask];
          const column = currentColumn ? data.columns[currentColumn] : data.columns["column-1"];
          const newTaskIds = Array.from(column.taskIds);
          newTaskIds.push(newId);
          const newColumn = {
            ...column,
            taskIds: newTaskIds,
          };
  
          setData({
            ...data,
            columns: {
              ...data.columns,
              [newColumn.id]: newColumn,
            },
            tasks: newTasks,
          });
  
          // Analyze if image was provided
          if (task.imageFile) {
            await analyzeImage(task.imageFile, newId, task.associatedProduct);
          }
        }
  
        setShowModal(false);
        toast.success("Task saved successfully");
      } catch (error) {
        console.error("Error saving task:", error);
        toast.error(`Failed to save task: ${error.message}`);
  
        if (isEdit && currentTask) {
          const updatedTasks = data.tasks.map(t =>
            t.id === task.id ? { ...t, trainingStatus: "failed" } : t
          );
          setData({ ...data, tasks: updatedTasks });
        }
      }
    };
  
    const saveImageToDatabase = async (task) => {
      try {
        const response = await fetch('/api/save-training-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task.id,
            title: task.title,
            description: task.description,
            tag: task.tag,
            image_url: task.image,
            product_id: task.associatedProduct?.product_id || null,
            training_data: task.trainingData || null
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save image to database');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Database save error:', error);
        throw error;
      }
    };
  
    const saveTaskToDatabase = async (task) => {
      try {
        const response = await fetch('/api/save-training-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task.id,
            title: task.title,
            description: task.description,
            tag: task.tag,
            image_url: task.image,
            product_id: task.associatedProduct?.product_id || null,
            training_data: task.trainingData || null,
            training_status: task.trainingStatus || 'not_started'
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save task to database');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Database save error:', error);
        throw error;
      }
    };
  
    const updateTaskInDatabase1 = async (task) => {
      try {
        const response = await fetch(`/api/training-images/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            tag: task.tag,
            image_url: task.image,
            product_id: task.associatedProduct?.product_id || null,
            training_data: task.trainingData || null,
            training_status: task.trainingStatus || 'not_started'
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task in database');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Database update error:', error);
        throw error;
      }
    };
  
    const updateTaskInDatabase = async (task) => {
      try {
        const response = await fetch(`/api/training-images/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            tag: task.tag,
            image_url: task.image,
            product_id: task.associatedProduct?.product_id || null,
            training_data: task.trainingData || null,
            training_status: task.trainingStatus || 'not_started'
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task in database');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Database update error:', error);
        throw error;
      }
    };
  
    const handleAnalyzeImage = (taskId) => {
      // Update local state to show loading
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              descriptionLoading: true
            };
          }
          return task;
        })
      }));
  
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        analyzeImage(null, taskId, task.associatedProduct);
      }
    };
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Kanban' />

        <div className='overflow-x-auto scroll-sm pb-8'>
          <div className="kanban-wrapper p-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="d-flex align-items-start gap-4" style={{ overflowX: "auto" }}>
                {data.columnOrder.map((columnId) => {
                  const column = data.columns[columnId];
                  const tasks = column.taskIds
                    .map(taskId => data.tasks.find(task => task.id === taskId))
                    .filter(Boolean);

                  return (
                    <Column
                      key={column.id}
                      column={column}
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDuplicateTask={handleDuplicateTask}
                      onTrainBot={handleTrainBot}
                      isAnalyzing={isAnalyzing}
                      onAnalyzeImage={handleAnalyzeImage}
                      isTraining={isTraining}
                    />
                  );
                })}
              </div>
            </DragDropContext>

            <AddEditTaskModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              handleSave={handleSaveTask}
              task={currentTask}
              setCurrentTask={setCurrentTask}
              isAnalyzing={isAnalyzing}
              products={products}
              loadingProducts={loadingProducts}
            />
          </div>
        </div>
      </MasterLayout>
    </>
  );
};

export default Page;
