import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";

import HowItWorks from "../components_modals/HowItWorks";
import Feedback from "../components_modals/Feedback";
import PrivacyPolicy from "../components_modals/PrivacyPolicy";
import { currURL } from "../constants";

export default function Footer(props) {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  //const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [modalName, setModalName] = useState("");

  const getCurrentModal = () => {
    var modal = <></>;
    if (modalName === "faq") {
      modal = (
        <HowItWorks
          showModal={showModal}
          hideModal={() => setShowModal(false)}
        />
      );
    } else if (modalName === "feedback") {
      modal = (
        <Feedback showModal={showModal} hideModal={() => setShowModal(false)} />
      );
    } else if (modalName === "privacy_policy") {
      modal = (
        <PrivacyPolicy
          showModal={showModal}
          hideModal={() => setShowModal(false)}
        />
      );
    }
    return modal;
  };

  return (
    <footer
      className="footer"
      id={props.id}
      style={props.style || { marginTop: 20 }}
    >
      <Container style={{ maxWidth: 2500 }}>
        <Row style={{ textAlign: "left" }}>
          <Col
            xs={1}
            style={{ padding: 20, paddingRight: 0, paddingTop: 0 }}
            id="footer-brand"
          >
            <Navbar style={{ paddingLeft: 0, paddingBottom: 0 }}>
              <Navbar.Brand
                onClick={() => history.push("/")}
                id="navbar-brand"
                style={{
                  paddingLeft: 0,
                  color: "#7B7B7B",
                  marginLeft: 0,
                  marginTop: 20,
                }}
              >
                covaid
              </Navbar.Brand>
            </Navbar>
          </Col>
          <Col
            xl={10}
            lg={10}
            md={10}
            sm={12}
            style={{ textAlign: "left", marginTop: 42, paddingLeft: 50 }}
            id="footer-content"
          >
            <Button
              variant="link"
              id="footer-link"
              onClick={() => window.open(currURL + "/faq", "_self")}
            >
              FAQ
            </Button>
            <Button
              variant="link"
              id="footer-link"
              onClick={() => (window.location.href = currURL + "/updates")}
            >
              Updates
            </Button>
            <Button
              variant="link"
              id="footer-link"
              onClick={() => {
                setModalName("feedback");
                setShowModal(true);
              }}
            >
              Feedback
            </Button>
            <Button
              variant="link"
              id="footer-link"
              onClick={() => {
                setModalName("privacy_policy");
                setShowModal(true);
              }}
            >
              Privacy Policy
            </Button>

            <i
              id="social-icon"
              className="fa fa-2x fa-github"
              onClick={() =>
                (window.location.href = "https://github.com/Covaid-co")
              }
              aria-hidden="true"
            ></i>
            <i
              id="social-icon"
              className="fa fa-2x fa-instagram"
              onClick={() =>
                (window.location.href =
                  "https://www.instagram.com/covaidmutualaid/")
              }
              aria-hidden="true"
            ></i>
            <i
              id="social-icon"
              className="fa fa-2x fa-facebook-official"
              onClick={() =>
                (window.location.href = "https://www.facebook.com/covaidco")
              }
              aria-hidden="true"
            ></i>
          </Col>
        </Row>
      </Container>
      {getCurrentModal()}
    </footer>
  );
}
