// src/services/vehicleService.js
import api from './api';

// ──────────────────────────────────────────────────────────
// IDSPay / srv2 API credentials
// ──────────────────────────────────────────────────────────
const API_ID = 'APID2629';
const API_KEY = '8cbaecfa-70cc-480d-9e21-0c9b11c81cb2';
const TOKEN_ID = 'K2I4y1qrQVtUme7OKFpIKVYfQfvFZFHm';

/**
 * Validates a vehicle's Registration Certificate (RC).
 *
 * Backend validation requires the field name `reg_no`.
 *
 * Endpoint: POST https://v1.vahanfinserv.com/srv2/validation/rc
 *
 * @param {string} vehicleNumber - Indian vehicle registration number
 * @returns {Promise} Axios response with RC details
 */
export const validateRC = vehicleNumber => {
  const payload = {
    reg_no: vehicleNumber,
    api_id: API_ID,
    api_key: API_KEY,
    token_id: TOKEN_ID,
  };

  console.log(
    '[VehicleService] RC Validation Request =>',
    JSON.stringify(payload),
  );

  return api
    .post('https://v1.vahanfinserv.com/srv2/validation/rc', payload)
    .then(res => {
      console.log(
        '[VehicleService] RC Validation Response =>',
        JSON.stringify(res.data),
      );
      return res;
    })
    .catch(err => {
      console.log(
        '[VehicleService] RC Validation Error Status =>',
        err.response?.status,
      );
      console.log(
        '[VehicleService] RC Validation Error Data =>',
        JSON.stringify(err.response?.data),
      );
      throw err;
    });
};

/**
 * Checks pending E-Challans for a vehicle.
 *
 * Backend validation requires the field name `reg_no`.
 *
 * Endpoint: POST https://v1.vahanfinserv.com/srv2/basic-e-challan
 *
 * @param {string} vehicleNumber - Indian vehicle registration number
 * @returns {Promise} Axios response with E-Challan data
 */
export const checkEChallan = vehicleNumber => {
  const payload = {
    vehicle_num: vehicleNumber,
    api_id: API_ID,
    api_key: API_KEY,
    token_id: TOKEN_ID,
  };

  console.log('[VehicleService] E-Challan Request =>', JSON.stringify(payload));

  return api
    .post('https://v1.vahanfinserv.com/srv2/basic-e-challan', payload)
    .then(res => {
      console.log(
        '[VehicleService] E-Challan Response =>',
        JSON.stringify(res.data),
      );
      return res;
    })
    .catch(err => {
      console.log(
        '[VehicleService] E-Challan Error Status =>',
        err.response?.status,
      );
      console.log(
        '[VehicleService] E-Challan Error Data =>',
        JSON.stringify(err.response?.data),
      );
      throw err;
    });
};

export default {
  validateRC,
  checkEChallan,
};
