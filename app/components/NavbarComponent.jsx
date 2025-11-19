'use client';

import React from 'react';
import { Navbar, Container, Col, Row } from 'react-bootstrap';
import Image from 'next/image';

export default function NavbarComponent() {
  return (
    <div className="sticky-navbar">
      <Container>
        <Row className="m-4">
          <Col xl={6} md={12}>
            <Navbar.Brand href="/">
              <h1 className="nb-header">where is this ?</h1>
            </Navbar.Brand>
          </Col>
          <Col xl={6} md={12} className="logos-col">
            <div className="logos-wrapper">
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                <Image src="/assets/tmdb.svg" alt="TMDb Logo" className="logo" width={36} height={36} />
              </a>
              <a href="https://www.buymeacoffee.com/aktasevren">
                <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width="160" alt="buymeacoffee" />
              </a>
            </div>
          </Col>
        </Row>
        <hr className="hr-line"></hr>
      </Container>
    </div>
  );
}

