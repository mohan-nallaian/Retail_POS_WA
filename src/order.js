import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import Popover from 'react-bootstrap/Popover';

const App = () => {
  const [data, setData] = useState([]);
  const [items, setItem] = useState({item_id:'',name: '', category: '', price: '', quantity: '', description: '', weight: '' });
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [bill, setBill] = useState([]);
  const[total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone_number: '', email: '' });
  const [showCustomerDetailsForm, setShowCustomerDetailsForm] = useState(false);
  

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/items');
      let data = response.data;
      data = data.sort((a, b) => a.item_id - b.item_id);
      setData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const handleRowSelection = (item, quantity) => {
    setSelectedItems(prevItems => ({ ...prevItems, [item.item_id]: quantity }));
  };

  const handleBill = async () => {
    let newBill = [];
    let total = 0;
    for (const itemId in selectedItems) {
      const quantity = Number(selectedItems[itemId]);
      const item = data.find(item => item.item_id === Number(itemId));
      if (item) {
        item.quantity -= quantity;
        await axios.put(`http://localhost:5000/items/${itemId}`, item);
        const itemPrice = Number(item.price.replace('Rs', '').trim());
        const itemTotal = itemPrice * quantity;
        newBill.push({ name: item.name, price: item.price, quantity, total: itemTotal });
        total += itemTotal;
      }
    }
  setBill(newBill);
  setTotal(total);
  setSelectedItems({});
  fetchItems();
};
const filteredItems = data.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.description.toLowerCase().includes(searchTerm.toLowerCase())
);
const handleSave = () => {
  setShowCustomerDetailsForm(true);
};

const handleCustomerDetailsChange = (e) => {
  setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
};

const handleCustomerDetailsSubmit = async () => {
  try {
    const { name, phone_number, email } = customerDetails;
    if (!name || !phone_number || !email) {
      toast.error('All fields must be filled');
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      toast.error('Invalid email');
      return;
    }
    if (!/^\d{10}$/.test(phone_number)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }
    const checkResponse = await axios.get(`http://localhost:5000/customer?phone_number=${phone_number}`);
    if (checkResponse.data.length > 0) {
      toast.error('Mobile number already exists');
      return;
    }

    const response = await axios.post('http://localhost:5000/customer', customerDetails);
    const data = response.data;

    if (data.status === 'success') {
      toast.success('Customer details updated successfully');
      setShowCustomerDetailsForm(false);
      const billDetails = {
        customer_id: data.customer.id,
        items: bill
      };
      const billResponse = await axios.post('http://localhost:5000/bill', billDetails);
      if (billResponse.data.status === 'success') {
        toast.success('Bill details updated successfully');
      } else {
        toast.error('Error updating bill details');
      }
    } else {
      toast.error('Error updating customer details');
    }
  } catch (error) {
    console.error(error);
    toast.error('Error updating customer details');
  }
};
  const handleInputChange = (e) => {
    setItem({ ...items, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!items.name || !items.category || !items.price || !items.quantity || !items.description || !items.weight) {
      toast.error('Please fill all fields');
      return;
    }
  
    if (!items.price.startsWith('Rs')) {
      toast.error('Price should start with "Rs"');
      return;
    }
  
    if (!Number.isInteger(Number(items.quantity))) {
      toast.error('Quantity should be an integer');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/items', items);
      const data = response.data;
  
      if (data.status === 'success') {
        fetchItems();
        toast.success('Item created successfully');
        setModal(false);
      } else {
        toast.error('Error creating items');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error creating items');
    }
  };

  const handleUpdate = async () => {
    if (!items.name || !items.category || !items.price || !items.quantity || !items.description || !items.weight) {
      toast.error('Please fill all fields');
      return;
    }
    if (!items.price.startsWith('Rs')) {
      toast.error('Price should start with "Rs"');
      return;
    }
  
    if (!Number.isInteger(Number(items.quantity))) {
      toast.error('Quantity should be an integer');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:5000/items/${items.item_id}`, items);
      const data = response.data;
  
      if (data.status === 'success') {
        fetchItems();
        toast.success('Item updated successfully');
        setModal(false);
      } else {
        toast.error('Error updating items');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating items');
    }
  };

  const handleDelete = (item_id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            axios.delete(`http://localhost:5000/items/${item_id}`)
              .then(response => {
                fetchItems();
                toast.success('Item deleted successfully');
              })
              .catch(error => {
                console.error(error);
                toast.error('Error deleting item');
              });
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };
  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'quantity', headerName: 'Quantity', width: 150 },
    { field: 'description', headerName: 'Description', width: 150 },
    { field: 'weight', headerName: 'Weight', width: 150 },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => (
        <div>
        <Button color="primary" onClick={(event) => { event.stopPropagation(); setItem(params.row); setEditMode(true); setModal(true); }}>Edit</Button>
        <Button color="danger" onClick={(event) => { event.stopPropagation(); handleDelete(params.row.item_id); }}>Delete</Button>
      </div>
      ),
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Button color="primary" onClick={() => { setModal(true); setEditMode(false); setItem({ item_id: '', name: '', category: '', price: '', quantity: '', description: '', weight: '' }); }}>New</Button>
      <Button color="primary" onClick={handleBill}>Bill</Button>
      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>{editMode ? 'Edit items' : 'Create New items'}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input type="text" name="name" id="name" value={items.name} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="category">Category</Label>
              <Input type="text" name="category" id="category" value={items.category} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="price">Price</Label>
              <Input type="text" name="price" id="price" value={items.price} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="quantity">Quantity</Label>
              <Input type="text" name="quantity" id="quantity" value={items.quantity} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input type="text" name="description" id="description" value={items.description} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="weight">Weight</Label>
              <Input type="text" name="weight" id="weight" value={items.weight} onChange={handleInputChange} />
            </FormGroup>
            <ToastContainer />
          </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={editMode ? handleUpdate : handleCreate}>{editMode ? 'Update' : 'Create'}</Button>{' '}
            <Button color="secondary" onClick={() => setModal(!modal)}>Cancel</Button>
            <ToastContainer />
          </ModalFooter>
        </Modal>
        <Modal isOpen={!!selectedItem} toggle={() => setSelectedItem(null)}>
    <ModalHeader toggle={() => setSelectedItem(null)}>Enter Quantity</ModalHeader>
    <ModalBody>
      <Form>
        <FormGroup>
          <Label for="quantity">Quantity</Label>
          <Input type="number" name="quantity" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </FormGroup>
      </Form>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => { handleRowSelection(selectedItem, quantity); setSelectedItem(null); }}>Submit</Button>{' '}
      <Button color="secondary" onClick={() => setSelectedItem(null)}>Cancel</Button>
    </ModalFooter>
  </Modal>
    <ToastContainer />
      <Modal isOpen={showCustomerDetailsForm} toggle={() => setShowCustomerDetailsForm(!showCustomerDetailsForm)}>
        <ModalHeader toggle={() => setShowCustomerDetailsForm(!showCustomerDetailsForm)}>Enter Customer Details</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input type="text" name="name" id="name" value={customerDetails.name} onChange={handleCustomerDetailsChange} />
            </FormGroup>
            <FormGroup>
              <Label for="phone_number">Phone Number</Label>
              <Input type="text" name="phone_number" id="phone_number" value={customerDetails.phone_number} onChange={handleCustomerDetailsChange} />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="text" name="email" id="email" value={customerDetails.email} onChange={handleCustomerDetailsChange} />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCustomerDetailsSubmit}>Submit</Button>{' '}
          <Button color="secondary" onClick={() => setShowCustomerDetailsForm(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    <Input type="text" placeholder="Search by Name,Category" onChange={e => setSearchTerm(e.target.value)} />
      <DataGrid
        rows={filteredItems}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row.item_id}
        onRowClick={(params, event) => { event.stopPropagation(); setSelectedItem(params.row); }}
      />
      <Popover.Body>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.total}</td>
              </tr>
                ))}
            </tbody>
          <tfoot>
            <tr>
              <th colSpan="3">Total</th>
              <th>{total}</th>
            </tr>
          </tfoot>
        </table>
          <Button onClick={() => setBill([])}>Clear</Button>
          <Button onClick={handleSave}>Save</Button>
          </Popover.Body>
    </div>
  );
}

export default App;