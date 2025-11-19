'use client';

import { Container } from 'react-bootstrap';
import React from 'react';

export default function Footer() {
  return (
    <div>
      <hr className="hr-line"></hr>
      <Container>
        <div className="text-center" style={{ color: '#9fd3c7' }}>
          © Copyright 2024 - All Rights Reserved
        </div>
        <div className="text-center designedby" style={{ color: '#9fd3c7', margin: '24px' }}>
          Designed by evrenaktas
        </div>
      </Container>
    </div>
  );
}

