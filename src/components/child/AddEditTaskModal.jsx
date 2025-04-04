import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddEditTaskModal = ({ 
  show, 
  handleClose, 
  handleSave, 
  task, 
  setCurrentTask,
  isAnalyzing,
  products,
  loadingProducts
}) => {
    const isEdit = Boolean(task);
    const [title, setTitle] = useState('');
    const [tag, setTag] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [associatedProduct, setAssociatedProduct] = useState(null);

    useEffect(() => {
        if (isEdit && task) {
            setTitle(task.title);
            setTag(task.tag);
            setDescription(task.description || '');
            setImagePreview(task.image || '');
            setImageFile(null);
            setImageChanged(false);
            
            // Set associated product if it exists
            if (task.associatedProduct) {
                const product = products.find(p => p.product_id == task.associatedProduct.product_id);
                setAssociatedProduct(product || null);
            } else {
                setAssociatedProduct(null);
            }
        } else {
            resetForm();
        }
    }, [isEdit, task, products]);

    const resetForm = () => {
        setTitle('');
        setTag('');
        setDescription('');
        setImagePreview('');
        setImageFile(null);
        setImageChanged(false);
        setAssociatedProduct(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
            setImageChanged(true);
            
            if (!isEdit) {
                setDescription('');
            }
        } else {
            setImagePreview('');
            setImageFile(null);
            setImageChanged(false);
        }
    };

    const onSave = () => {
        if (!title) {
            alert('Title is required.');
            return;
        }
    
        const currentDate = new Date().toISOString().split('T')[0];
        
        const taskData = {
            id: isEdit ? task.id : null,
            title,
            description,
            tag,
            date: currentDate,
            image: imagePreview || null,
            imageFile: imageChanged ? imageFile : null,
            imagePreview: imagePreview,
            associatedProduct: associatedProduct || null
        };
    
        handleSave(taskData, isEdit);
        resetForm();
        handleClose();
    };

    return (
        <Modal show={show} onHide={() => {
            resetForm();
            handleClose();
        }}>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit Content' : 'Add New Content'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="taskTitle">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Content Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="taskTag">
                        <Form.Label>Category/Tag</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Marketing, Before/After"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                        />
                    </Form.Group>

                    {isEdit && (
                        <Form.Group className="mb-3" controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            {isAnalyzing ? (
                                <div className="placeholder-glow">
                                    <div className="placeholder col-12" style={{height: "100px"}}></div>
                                </div>
                            ) : (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            )}
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3" controlId="taskProduct">
                        <Form.Label>Associated Product</Form.Label>
                        {loadingProducts ? (
                            <Form.Control as="select" disabled>
                                <option>Loading products...</option>
                            </Form.Control>
                        ) : (
                            <Form.Control
                                as="select"
                                value={associatedProduct?.product_id || ''}
                                onChange={(e) => {
                                    const productId = e.target.value;
                                    const selectedProduct = products.find(p => p.product_id == productId);
                                    setAssociatedProduct(selectedProduct || null);
                                }}
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product.product_id} value={product.product_id}>
                                        {product.name}
                                    </option>
                                ))}
                            </Form.Control>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="taskImage">
                        <Form.Label>
                            {isEdit ? 'Change Image' : 'Upload Image'}
                        </Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-2"
                                style={{ 
                                    width: '100%',
                                    maxHeight: '200px', 
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => {
                    resetForm();
                    handleClose();
                }}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={onSave}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? 'Processing...' : (isEdit ? 'Save Changes' : 'Add Content')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddEditTaskModal;