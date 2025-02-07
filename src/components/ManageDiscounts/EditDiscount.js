import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import '../../assets/css/AddProduct.css';
import AlertMessage from '../../utils/AlertMessage';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/ErrorHandler';

const EditDiscountModel = ({ visible, onClose, discountId }) => {
    const [discountDetails, setDiscountDetails] = useState({
        code: '',
        type: '',
        value: '',
        start_date: null,
        end_date: null,
    });

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (discountId) {
            setLoading(true);
            api.get(`/discounts/${discountId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
                .then(response => {
                    const data = response.data.data;
                    setDiscountDetails({
                        ...data,
                        start_date: data.start_date ? new Date(data.start_date) : null,
                        end_date: data.end_date ? new Date(data.end_date) : null,
                    });
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [discountId, visible]);

    const showAlert = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleChange = (e, field) => {
        setDiscountDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };

    const handleDateChange = (e, field) => {
        setDiscountDetails(prevState => ({
            ...prevState,
            [field]: e.value
        }));
    };

    const handleSave = () => {
        if (!discountDetails.code || !discountDetails.type || !discountDetails.value || !discountDetails.start_date || !discountDetails.end_date) {
            showAlert('Please fill in all fields.', 'warning');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showAlert('You need to login', 'warning');
            return;
        }

        const requestData = {
            ...discountDetails,
            start_date: discountDetails.start_date ? discountDetails.start_date.toISOString() : null,
            end_date: discountDetails.end_date ? discountDetails.end_date.toISOString() : null,
        };
        

        setLoading(true);
        api.patch(`/discounts/${discountId}`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            setLoading(false);
            const editDiscount = response.data.data;
            onClose(true, response.data.message, editDiscount);
        })
        .catch(error => {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        });
    };

    return (
        <Dialog visible={visible} onHide={onClose} header='Edit Discount' style={{ width: '50vw' }}>
            <div className='discount-form'>
                <h3>Discount Information</h3>
                <div className='p-field'>
                    <label>Code</label>
                    <InputText value={discountDetails.code} onChange={e => handleChange(e, 'code')} />
                </div>
                <div className='p-field'>
                    <label>Type</label>
                    <Dropdown 
                        value={discountDetails.type} 
                        options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]} 
                        onChange={e => handleChange(e, 'type')} 
                    />
                </div>
                <div className='p-field'>
                    <label>Value</label>
                    <InputText type='number' value={discountDetails.value} onChange={e => handleChange(e, 'value')} />
                </div>
                <div className='p-field'>
                    <label>Start Date</label>
                    <Calendar value={discountDetails.start_date} onChange={e => handleDateChange(e, 'start_date')} showIcon dateFormat='yy-mm-dd' />
                </div>
                <div className='p-field'>
                    <label>End Date</label>
                    <Calendar value={discountDetails.end_date} onChange={e => handleDateChange(e, 'end_date')} showIcon dateFormat='yy-mm-dd' />
                </div>

                <div className='p-dialog-footer'>
                    <Button label='Save' className='p-button-success' onClick={handleSave} disabled={loading} />
                    <Button label='Cancel' className='p-button-secondary' onClick={onClose} />
                </div>
            </div>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default EditDiscountModel;