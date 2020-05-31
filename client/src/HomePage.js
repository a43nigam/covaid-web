import React, { useState, useEffect } from "react";
import LocalizedStrings from "react-localization";
import fetch_a from "./util/fetch_auth";
import PropTypes from "prop-types";
import Cookie from "js-cookie";
import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Feedback from "./components_modals/Feedback";
import NewLogin from "./components_modals/NewLogin";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { currURL } from "./constants";
import home from "./assets/home.png";
import "./HomePage.css";
import { translations } from "./translations/translations";

let translatedStrings = new LocalizedStrings({ translations });

/**
 * Main Homepage Component for covaid
 */

export default function HomePage(props) {
  const [showModal, setShowModal] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [modalType, setModalType] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [pageLoaded, setPageLoaded] = useState(false);

  window.addEventListener("resize", () => {
    setWidth(window.innerWidth);
  });

  useEffect(() => {
    if (props.login === true) {
      showModalType("signin");
    }

    if (Object.keys(currentUser).length === 0 && Cookie.get("token")) {
      fetchUser();
    }
    setPageLoaded(true);
  }, [currentUser, props.login]);

  const showModalType = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleHideModal = () => {
    setShowModal(false);
  };

  // Find current modal component based on current modal type
  const getCurrentModal = () => {
    var modal = <></>;
    if (modalType === "feedback") {
      modal = (
        <Feedback showModal={showModal} hideModal={() => setShowModal(false)} />
      );
    } else if (modalType === "signin") {
      modal = <NewLogin showModal={showModal} hideModal={handleHideModal} />;
    }
    return modal;
  };

  // Get current user based on token
  const fetchUser = () => {
    fetch_a("token", "/api/users/current")
      .then((response) => response.json())
      .then((user) => {
        setCurrentUser(user);
        setLoggedIn(true);
      });
  };

  return [
    <div key="1" className="App" style={{ height: "100%" }}>
      <NavBar
        setLanguage={props.setLanguage}
        language={props.language}
        pageLoaded={pageLoaded}
        isLoggedIn={loggedIn}
        first_name={currentUser.first_name}
      />
      <Jumbotron fluid id="jumbo">
        <div id="feedback">
          <div
            id="feedback-tab"
            onClick={() => {
              showModalType("feedback");
            }}
          >
            Feedback
          </div>
        </div>
        <Container id="jumboContainer">
          <Row>
            <Col md={6} id="jumbo-text">
              <h1 id="home-heading" style={{marginTop: 25}}>
                {translatedStrings[props.language].HomePage_Title}
              </h1>
              <p id="home-subheading">
                {translatedStrings[props.language].HomePage_Subtitle}
              </p>
              <Button
                onClick={() => window.open(currURL + "/request", "_self")}
                id="request-button"
              >
                {/* {translatedStrings[props.language].INeedHelp} → */}
                <font style={{float: 'left'}}>
                  {translatedStrings[props.language].INeedHelp}
                </font> 
                <font style={{float: 'right'}}>
                  →
                </font>
              </Button>{" "}
              <br />
              <Button
                id="resources-button"
                onClick={() =>
                  window.open(currURL + "/information-hub", "_self")
                }
              >
                COVID-19 Information Hub
              </Button>
            </Col>
            <Col md={6} style={{ marginTop: 0, textAlign: 'center' }}>
              <img id="org-img" alt="" src={home}></img>
            </Col>
          </Row>
        </Container>
      </Jumbotron>
      {getCurrentModal()}
      <Footer key="2" home={true} style={{position: 'absolute', bottom: 0 }} id="mobile-footer"/>
    </div>,
    <Footer key="2" home={true} id="desktop-footer"/>,
  ];
}

HomePage.propTypes = {
  setLanguage: PropTypes.func,
  language: PropTypes.string,
  googleAPI: PropTypes.string,
  refreshLocation: PropTypes.func,
  onLocationSubmit: PropTypes.func,
};
