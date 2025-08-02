import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import axios from 'axios';
import { useAuth } from '../../../context/authContext';

const ManageUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [newUniversity, setNewUniversity] = useState('');
  const { authState } = useAuth();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axios.get('/api/universities');
        setUniversities(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUniversities();
  }, []);

  const handleAddUniversity = async () => {
    if (!newUniversity.trim()) return;

    try {
      const res = await axios.post('/api/universities', {
        name: newUniversity
      }, {
        headers: {
          'x-auth-token': authState.token
        }
      });
      setUniversities([...universities, res.data]);
      setNewUniversity('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/universities/${id}`, {
        headers: {
          'x-auth-token': authState.token
        }
      });
      setUniversities(universities.filter(uni => uni._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Paper style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>
        Manage Universities
      </Typography>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <TextField
          label="New University"
          variant="outlined"
          value={newUniversity}
          onChange={(e) => setNewUniversity(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddUniversity}
          style={{ marginLeft: '10px' }}
        >
          Add
        </Button>
      </div>
      <List>
        {universities.map((university) => (
          <ListItem key={university._id}>
            <ListItemText primary={university.name} />
            <IconButton edge="end" onClick={() => handleDelete(university._id)}>
              <Delete color="error" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ManageUniversities;