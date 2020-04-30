import React, { useState, useEffect } from "react";
import { useFormFields } from "./libs/hooksLib";
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'

import NeededBy from './components_homepage/NeededBy';
import NewDetails from './components_homepage/NewDetails';
import NewPaymentMethod from './components_homepage/NewPaymentMethod';
import CheckForm from './components/CheckForm';
import { toastTime, languages } from './constants'
import { setFalseObj, extractTrueObj } from './Helpers';


export default function RequestPage2(props) {

    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [languageChecked, setLanguageChecked] = useState({});
    const [selectedPayment, setSelectedIndex] = useState(0);
    const [time, setTime] = useState('Morning');
    const [date, setDate] = useState(new Date(Date.now()).toLocaleString().split(',')[0]);
    const [fields, handleFieldChange] = useFormFields({
        details: ""
    });

    useEffect(() => {
        setLanguageChecked(setFalseObj(languages));
    }, []);


    const goToSubmit = () => {
        const valid = checkPage();
        if (valid) {
            setShowToast(false);
            setPendingSubmit(true);
            const languages = extractTrueObj(languageChecked);
            const result = {
                'details': fields.details,
                'payment': selectedPayment,
                'languages': languages,
                'time': time,
                'date': date
            }
            props.handleSubmit(result);
        } else {
            setShowToast(true);
        }
    }

    const checkPage = () => {
        if (Object.values(languageChecked).every(v => v === false)) {
            setToastMessage('No language selected');
            return false;
        }

        if (fields.details.length === 0) {
            setToastMessage('Enter details about your request');
            return false;
        }
        return true;
    }

    const paymentMethod = () => {
        var payment = <NewPaymentMethod setSelectedIndex={setSelectedIndex}/>;
        if (props.currentAssoc._id === '5e843ab29ad8d24834c8edbf') {
            payment = <></>;
        }
        return payment;
    }

    return (
        <>
            <h5 id="regular-text-bold" style = {{marginTop: 0, marginBottom: 0}}>What language do you speak?</h5>
            <p id="regular-text" style={{marginBottom: 0}}>
                If language not listed, please mention in details section below
            </p>
            <CheckForm obj={languageChecked} setObj={setLanguageChecked}/>
            <NeededBy setTime={setTime} setDate={setDate}/>
            {paymentMethod()}
            {/* {paymentAgreement()} */}
            <NewDetails fields={fields} handleFieldChange={handleFieldChange}/>
            {/* {agreement} */}
            <Button id="large-button" disabled={pendingSubmit} style={{marginTop: 15}} onClick={goToSubmit}>Submit a Request</Button>
            <p id="pagenum-text">Page 2 of 2</p>
            <Toast show={showToast} delay={toastTime} onClose={() => setShowToast(false)} autohide id='toastError'>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </>
    )
}