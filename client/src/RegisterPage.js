import React, { useState, useEffect } from 'react';

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import NewLocationSetting from './location_tools/NewLocationSetting';
import GetLocation from './components_homepage/GetLocation';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import RegisterPage1 from './RegisterPage1';
import RegisterPage2 from './RegisterPage2';
import RegisterPage3 from './RegisterPage3';


export default function RegisterPage(props) {

    const [showModal, setShowModal] = useState(false);
    const [firstPage, setFirstPage] = useState({});
    const [secondPage, setSecondPage] = useState({});
    const [justRegistered, setJustRegistered] = useState(false);

    useEffect(() => {
        setShowModal(false);
    }, [props.locationProps]);


    const volunteerFormInfo = () => {
        return (
            <>
                <h1 id="small-header">Volunteer Registration</h1>
                <p id="regular-text" style={{marginBottom: 5}}>
                    Creating an account allows you to be listed as a volunteer in your area. 
                    Once logged in, you will be able to update your availability and indicate 
                    which tasks you’re able to complete.
                </p>
                <p id="regular-text" style={{fontStyle: 'italic', marginTop: 0}}>
                    Your contact information will <strong id='hello-name' style={{marginRight: 0}}>never</strong> be publicly visible.
                </p>
                <p id='regular-text' style={{marginBottom: 0}}>Current Location: 
                    <button id="change-location" onClick={() => setShowModal(true)}> {props.locationProps.locality + ', ' + props.locationProps.zipcode}</button>
                </p>
            </>
        )
    }

    const handleSubmit = (thirdPage) => {
        let form = {
            'user': {
                'first_name': firstPage.first_name,
                'last_name': firstPage.last_name,
                'email': firstPage.email,
                'password': firstPage.password,
                'pronouns': firstPage.pronouns,
                'availability': true,
                'location': {
                    'type': 'Point',
                    'coordinates': [props.locationProps.longitude, props.locationProps.latitude]
                },
                'offer': {
                    'details': secondPage.details,
                    'tasks': secondPage.tasks,
                    'neighborhoods': thirdPage.neighborhoods,
                    'state': props.locationProps.state,
                    'car': secondPage.car,
                    'timesAvailable': secondPage.timesAvailable,
                },
                'association': props.locationProps.currentAssoc._id,
                'association_name': props.locationProps.currentAssoc.name,
                'languages': ['English'],
                'phone': firstPage.phone,
            }
        };

        fetch('/api/users/', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form)
        }).then((response) => {
            if (response.ok) {
                response.json().then(data => {
                    setJustRegistered(true);
                    console.log("niceeeee");
                });
            } else {
                console.log("email exists");
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    const displayRegisterPage = () => {
        if (Object.keys(firstPage).length === 0) {
            return <RegisterPage1 setFirstPage={setFirstPage}/>
        } else if (Object.keys(secondPage).length === 0) {
            return <RegisterPage2 setSecondPage={setSecondPage} currentAssoc={props.locationProps.currentAssoc}/>
        } else {
            return <RegisterPage3 handleSubmit={handleSubmit} 
                                  currentAssoc={props.locationProps.currentAssoc} 
                                  neighborhoods={props.locationProps.neighborhoods}/>
        }
    }

    if (justRegistered) {
        return ([
            <div className="App" key="1">
                <NavBar isLoggedIn={false} totalVolunteers={0} orgPortal={true}/>
                <Container style={{maxWidth: 1500}}>
                    <Row>
                        <Col lg={3} md={2} sm={0}>
                        </Col>
                        <Col lg={6} md={8} sm={12}>
                            <Container id="newOfferContainer" style={{marginBottom: 0}}>
                                <h1 id="small-header">Check your email for a verification link!</h1>
                                <p id="regular-text" style={{marginBottom: 5}}>
                                    Once verified, you will be able to post an offer to support your 
                                    community directly from your volunteer portal.
                                </p>
                            </Container>
                        </Col>
                        <Col lg={3} md={2} sm={0}>
                        </Col>
                    </Row>
                </Container>
            </div>,
            <Footer key="2"/>
        ]);
    }

    return ([
		<div className="App" key="1">
			<NavBar isLoggedIn={false} totalVolunteers={0} orgPortal={true}/>
            <Container style={{maxWidth: 1500}}>
            <   Row>
                    <Col lg={3} md={2} sm={0}>
                    </Col>
                    <Col lg={6} md={8} sm={12}>
                        <Container id="newOfferContainer">
                            {volunteerFormInfo()}
                        </Container>
                    </Col>
                    <Col lg={3} md={2} sm={0}>
                    </Col>
                </Row>
                <Row>
                    <Col lg={3} md={2} sm={0}>
                    </Col>
                    <Col lg={6} md={8} sm={12}>
                        <Container id="newOfferContainer" style={{marginBottom: 15}}>
                            {displayRegisterPage()}
                        </Container>
                    </Col>
                    <Col lg={3} md={2} sm={0}>
                    </Col>
                </Row>
            </Container>
            <NewLocationSetting locationSubmit={props.onLocationSubmit}
                                refreshLocation={props.refreshLocation}
                                showModal={showModal}
                                hideModal={() => setShowModal(false)}/>
            <GetLocation isLoaded={props.isLoaded} onLocationSubmit={props.onLocationSubmit}/>
		</div>,
		<Footer key="2"/>]
	);

}