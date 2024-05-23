import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { Container, Form, Button, Col, Row} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  const [data, setData] = useState([]);
  const [customer_id, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchData = useCallback(async () => {
    try {
      const totalSales = await axios.get(`http://localhost:5000/bill/totalSalesOverall`, {
        params: {
          customer_id: customer_id || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      const salesCount = await axios.get(`http://localhost:5000/bill/salesCountOverall`, {
        params: {
          customer_id: customer_id || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      }, [customer_id, startDate, endDate]);

      setData([
        { name: 'Total Sales', value: totalSales.data.total_sales },
        { name: 'Sales Count', value: salesCount.data.sales_count },
      ]);

      toast.success('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching data', error);
      toast.error('Error fetching data');
    }
  }, [customer_id, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Container>
      <h1>Welcome to the Dashboard</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="customerId">
          <Form.Label>Customer ID</Form.Label>
          <Form.Control type="text" placeholder="Enter Customer ID" value={customer_id} onChange={(e) => setCustomerId(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="startDate">
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="endDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
      <Row>
    <Col>
      <LineChart width={500} height={300} data={data} layout="vertical">
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
      </LineChart>
    </Col>
    <Col>
      <BarChart width={500} height={300} data={data} layout="vertical">
        <Bar dataKey="value" fill="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
      </BarChart>
    </Col>
    <Col>
      <PieChart width={400} height={400}>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={data}
          cx={200}
          cy={200}
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </Col>
    </Row>
      <ToastContainer />
    </Container>
  );
}

export default Dashboard;