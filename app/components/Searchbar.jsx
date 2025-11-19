'use client';

import { React, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMovies } from '@/lib/redux/actions/MovieActions';
import { Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

// alertifyjs'i dinamik olarak import et
const getAlertify = () => {
  if (typeof window !== 'undefined') {
    return require('alertifyjs');
  }
  return null;
};

export default function Searchbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [inputText, setInputText] = useState('');

  const onChange = (e) => {
    setInputText(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (inputText === '' || inputText === null || inputText === undefined) {
      const alertify = getAlertify();
      if (alertify) {
        alertify.set('notifier', 'position', 'top-right');
        alertify.error('Please type something.');
      }
    } else {
      dispatch(fetchMovies(inputText));
      router.push(`/search/${inputText}`);
    }
  };

  return (
    <Row className="searchbar">
      <Col lg={4}>
        <InputGroup className="my-3" onChange={onChange}>
          <Form.Control placeholder="Type a movie name ..." />
          <Button onClick={onSubmit}>
            <b>Search</b>
          </Button>
        </InputGroup>
      </Col>
    </Row>
  );
}

